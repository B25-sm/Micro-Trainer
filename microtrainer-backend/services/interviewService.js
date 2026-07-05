const axios = require("axios");
const { QUALITY_MODEL } = require("./aiModelConfig");
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

/** Meta/filler replies about the Q&A process itself, not the technical question —
 *  a small fast model can be fooled into praising these as if they were real answers.
 *  Matched with edit distance so typos ("anwer the question") are still caught. */
const NON_ANSWER_PHRASES = [
  "answer the question",
  "answered the question",
  "question answered",
  "question is answered",
  "question is successfully answered",
  "100% qualified answer",
  "qualified answer",
  "correct answer",
  "next question",
  "done",
  "ok",
  "okay",
  "sure",
  "yes",
  "no",
];

function levenshtein(a, b) {
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[a.length][b.length];
}

function isNonSubstantiveAnswer(answer) {
  const a = String(answer || "")
    .trim()
    .toLowerCase()
    .replace(/[.!?]+$/, "");
  if (!a) return false; // isBlankAnswer already handles empty
  const wordCount = a.split(/\s+/).filter(Boolean).length;
  if (wordCount > 6) return false;
  return NON_ANSWER_PHRASES.some(
    (phrase) => levenshtein(a, phrase) <= Math.max(1, Math.floor(phrase.length * 0.2))
  );
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

GROUNDING — do not hallucinate:
- Base "strengths"/"mistakes"/"improvement" ONLY on what the student's answer literally says. Never describe concepts, examples, or explanations the student did not actually write, even if they are the "expected" answer to the question.
- A confident tone is not content. Filler like "answer the question", "question answered", "100% correct answer", "done", or a restatement of the question is a NON-ANSWER — score 0-1 and say plainly that no real answer was given. Do not invent technical substance to justify a higher score.

Also rate two dimensions as exactly "Good", "Average", or "Poor" (these feed the student's progress dashboard):
- "technical": correctness/depth of the technical content (should track the score — high score means Good, low score means Poor)
- "communication": clarity and structure of the explanation, independent of whether the technical content was correct

Respond ONLY in JSON format:
{
  "score": 0-10,
  "technical": "Good/Average/Poor",
  "communication": "Good/Average/Poor",
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
          model: QUALITY_MODEL,
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

      // Guard against the model omitting/mis-formatting these — they must be
      // exactly "Good"/"Average"/"Poor" or the dashboard's progress aggregation
      // silently treats them as 0 (this is what caused communication/technical
      // progress to never move at all).
      const RATING_VALUES = new Set(["Good", "Average", "Poor"]);
      const ratingFromScore = (s) => (s >= 7 ? "Good" : s >= 4 ? "Average" : "Poor");
      if (!RATING_VALUES.has(parsed.technical)) {
        parsed.technical = ratingFromScore(Number(parsed.score) || 0);
      }
      if (!RATING_VALUES.has(parsed.communication)) {
        parsed.communication = ratingFromScore(Number(parsed.score) || 0);
      }

      // Empty answer only — do not penalize short correct answers
      if (isBlankAnswer(answer)) {
        parsed.score = 0;
        parsed.technical = "Poor";
        parsed.communication = "Poor";
        parsed.mistakes = "No answer provided";
      } else if (isNonSubstantiveAnswer(answer)) {
        // Deterministic override — the model can be fooled by confident-sounding
        // filler ("100% qualified answer", "question answered") into inventing
        // praise for technical content the student never actually wrote.
        parsed.score = 0;
        parsed.technical = "Poor";
        parsed.communication = "Poor";
        parsed.strengths = "";
        parsed.mistakes = "This doesn't address the question — no technical content was given";
        parsed.improvement = "Answer the actual question with a real explanation";
      } else if (
        questionRequiresCode(question) &&
        !answerIncludesCode(answer)
      ) {
        parsed.score = Math.min(Number(parsed.score) || 0, 5);
        parsed.technical = ratingFromScore(parsed.score);
        parsed.mistakes =
          parsed.mistakes ||
          "Question asked for code or syntax; include a concrete example";
      }

      // =======================================================
      // 🔹 Logging (non-blocking — do not delay the interview response)
      // =======================================================
      logInterview({
        studentId: studentId || "anonymous",
        question,
        answer,
        subject,
        ...parsed
      }).catch((err) => console.error("Sheets log failed:", err.message));

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

  logInterview({
    studentId: studentId || "anonymous",
    question,
    answer,
    subject,
    ...fallback
  }).catch((err) => console.error("Sheets log failed:", err.message));

  return {
    score: 0,
    feedback: null,
    nextQuestion: "Let's continue. What is your understanding of async/await?",
    ...fallback
  };
}

module.exports = { evaluateAnswer };
