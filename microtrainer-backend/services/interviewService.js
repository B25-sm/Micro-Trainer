const axios = require("axios");
const { logInterview } = require("./sheetsService");
const { generateFollowUp, shouldAskFollowUp } = require("./adaptiveFollowupService");

// 🔹 Persona (NEW)
const {
  BASE_PERSONA,
  INTERVIEW_PERSONA,
  INTERVIEW_FORMAT
} = require("./personaConfig");


// =======================================================
// 🔹 Fallback Response
// =======================================================
function getFallback(reason = "Unknown error") {
  return {
    score: 0,
    communication: "Poor",
    technical: "Poor",
    strengths: "System issue",
    mistakes: reason,
    improvement: "Answer clearly with real-world example",
    verdict: "Not Selected",
    nextQuestion: "What is state in React? Where is it used?"
  };
}


// =======================================================
// 🔹 Clean AI Response
// =======================================================
function cleanJSON(raw) {
  if (!raw) return null;

  return raw
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();
}

function isBlankAnswer(answer) {
  return !answer || !String(answer).trim();
}

/** Same policy as guided-course quiz: code expected only when the question asks for it */
function questionRequiresCode(question) {
  const q = String(question || "").toLowerCase();
  return /\b(write|show\s*(me\s*)?(the\s*)?code|syntax|implement|code\s+example|snippet|function\s+that|program|class\s+that)\b/i.test(
    q
  );
}

function answerIncludesCode(answer) {
  const a = String(answer || "");
  return (
    /```[\s\S]*?```/.test(a) ||
    /[{}();]/.test(a) ||
    /\b(function|const|let|var|=>|def |class |import |public |#include)\b/i.test(a)
  );
}


// =======================================================
// 🔹 Evaluate Answer (WITH RETRY LOGIC)
// =======================================================
async function evaluateAnswer({ question, answer, subject, studentId }) {
  // Retry logic for rate limits
  const maxRetries = 3;
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const prompt = `
Question:
${question}

Student Answer:
${answer}

Score MEANING only — same fairness as the Learn session quiz.

1. Core Understanding (70%) - Did they get the main concept right?
2. Practical Knowledge (20%) - Real-world usage or example (only if relevant to the question)
3. Clarity (10%) - Was the explanation clear enough to understand?

CRITICAL — NEVER score by length:
- NEVER use word count, sentence count, or character count
- A short answer with correct meaning = 9-10/10
- A long answer with wrong or vague meaning = 0-4/10
- "Too short" is NOT a valid reason to lower score unless the answer is empty

CODE/SYNTAX QUESTIONS ONLY (when the question asks to write/show code or syntax):
- Student should include code or concrete syntax
- Working or mostly-correct code → 8-10/10
- Explains concept but no code when code was asked → max 5/10
- Minor syntax errors with correct logic → 7-8/10

SCORING:
- 9-10: meaning clearly correct
- 6-8: mostly right, small gap
- 0-4: wrong, unrelated, or empty — NOT because the answer was brief

DO NOT penalize for:
- Brief answers, bullet points, one-liners
- Minor wording differences, missing small details
- Different explanation style, informal language

PENALIZE ONLY for:
- Wrong or unrelated meaning
- Empty or non-answer
- No code when the question explicitly required code/syntax

Respond ONLY in JSON format:
{
  "score": 0-10,
  "strengths": "what they got right",
  "mistakes": "what they missed (if any)",
  "improvement": "one actionable tip"
}
`;

      // 🔥 SYSTEM PROMPT (YOUR IDENTITY)
      const SYSTEM_PROMPT = `
${BASE_PERSONA}

${INTERVIEW_PERSONA}

You are evaluating answers during an interview.

CRITICAL — same as Learn quiz grading:
- Score MEANING only; never length or word count
- Brief and correct beats long and wrong
- Be strict only when meaning is wrong, empty, or code was required but missing

Real interviews reward understanding, not essay length.
`;

      const response = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model: "llama-3.1-8b-instant",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: prompt }
          ],
          temperature: 0.3,
          max_tokens: 300 // Reduced from 500 to save tokens
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            "Content-Type": "application/json"
          }
        }
      );

      const raw = response?.data?.choices?.[0]?.message?.content;

      // 🔥 Clean JSON
      const cleaned = cleanJSON(raw);

      let parsed;

      try {
        parsed = JSON.parse(cleaned);
      } catch (err) {
        parsed = getFallback("Invalid JSON from AI");
      }

      if (!parsed.score && parsed.score !== 0) {
        parsed.score = 0;
      }

      // Empty answer only — do not penalize short correct answers
      if (isBlankAnswer(answer)) {
        parsed.score = 0;
        parsed.mistakes = "No answer provided";
      } else if (
        questionRequiresCode(question) &&
        !answerIncludesCode(answer)
      ) {
        parsed.score = Math.min(Number(parsed.score) || 0, 5);
        parsed.mistakes =
          parsed.mistakes ||
          "Question asked for code or syntax; include a concrete example";
      }

      // =======================================================
      // 🔹 Logging
      // =======================================================
      await logInterview({
        studentId: studentId || "anonymous",
        question,
        answer,
        subject,
        ...parsed
      });

      // During interview: NO feedback, just store the evaluation
      return {
        score: parsed.score || 0,
        feedback: null, // NO feedback during interview
        nextQuestion: parsed.nextQuestion,
        // 🔥 ADAPTIVE FOLLOW-UP
        shouldFollowUp: shouldAskFollowUp(answer, parsed.score || 0),
        // Store for final evaluation
        _evaluation: {
          score: parsed.score,
          strengths: parsed.strengths,
          mistakes: parsed.mistakes,
          improvement: parsed.improvement
        }
      };

    } catch (error) {
      lastError = error;
      
      // Check if it's a rate limit error
      if (error.response?.status === 429 || error.response?.data?.error?.code === 'rate_limit_exceeded') {
        const waitTime = attempt * 2000; // 2s, 4s, 6s
        console.log(`⏰ Rate limit hit. Waiting ${waitTime/1000}s before retry ${attempt}/${maxRetries}...`);
        
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue; // Retry
        }
      }
      
      // If not rate limit or max retries reached, break
      break;
    }
  }
  
  // If all retries failed
  console.error("Interview Error:", lastError?.response?.data || lastError?.message);

  const fallback = getFallback("API failure - please try again");

  await logInterview({
    studentId: studentId || "anonymous",
    question,
    answer,
    subject,
    ...fallback
  });

  return {
    score: 0,
    feedback: null,
    nextQuestion: "Let's continue. What is your understanding of async/await?",
    ...fallback
  };
}

module.exports = { evaluateAnswer };
