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

Evaluate based on:

1. Core Understanding (70%) - Did they get the main concept right?
2. Practical Knowledge (20%) - Did they mention real-world usage or example?
3. Clarity (10%) - Was the explanation clear?

SPECIAL RULES FOR CODE/SYNTAX QUESTIONS:
- If question asks for "Write", "Show me code", "Syntax" → Student MUST provide code
- If they provide working code/syntax → Give high score (8-10)
- If they explain without code when code was asked → Penalize (max 5/10)
- If code has minor syntax errors but logic is correct → Be lenient (7-8/10)

SCORING RULES - BE LENIENT:
- If answer is 90% correct → Give 9-10/10
- If answer covers main concept well → Give 7-8/10
- If answer is partially correct → Give 5-6/10
- If answer is vague or wrong → Give 0-4/10

DO NOT penalize for:
- Minor wording differences
- Missing small details
- Different explanation style
- Not using exact technical terms
- Minor syntax errors (if logic is correct)

PENALIZE ONLY for:
- Completely wrong concept
- No real understanding
- Totally vague answer
- No practical knowledge
- No code when code was explicitly asked

Be FAIR and LENIENT. Focus on understanding, not perfection.

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

CRITICAL RULES - BE LENIENT:
- If student gets 90% of the concept right → Score 9-10
- Focus on UNDERSTANDING, not perfection
- Don't penalize for minor wording differences
- Don't penalize for missing small details
- Value practical knowledge over textbook definitions

BE STRICT ONLY when:
- Answer is completely wrong
- Shows no understanding
- Totally vague or irrelevant

Remember: Real interviews are about understanding, not memorization.
Be FAIR. Be LENIENT. Reward good understanding.
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

      // =======================================================
      // 🔥 EXTRA STRICT VALIDATION (NEW)
      // =======================================================

      if (!parsed.score && parsed.score !== 0) {
        parsed.score = 0;
      }

      // Penalize if answer too short or vague
      if (!answer || answer.length < 20) {
        parsed.score = Math.min(parsed.score, 3);
        parsed.mistakes = "Answer too short or unclear";
        parsed.verdict = "Not Selected";
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
