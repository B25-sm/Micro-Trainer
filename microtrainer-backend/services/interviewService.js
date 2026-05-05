const axios = require("axios");
const { logInterview } = require("./sheetsService");

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
// 🔹 Evaluate Answer (YOUR STYLE)
// =======================================================
async function evaluateAnswer({ question, answer, subject, studentId }) {
  try {
    const prompt = `
Question:
${question}

Student Answer:
${answer}

Evaluate based on:

1. Clarity (can this be understood quickly?)
2. Real-world connection (did they say where it's used?)
3. No jargon (reject buzzwords without explanation)

Rules:
- Be strict
- Be direct
- No long explanations
- No fluff

Reject:
- vague answers
- memorized definitions
- no real-world example

Respond ONLY in JSON.
`;

    // 🔥 SYSTEM PROMPT (YOUR IDENTITY)
    const SYSTEM_PROMPT = `
${BASE_PERSONA}

${INTERVIEW_PERSONA}

${INTERVIEW_FORMAT}

Extra rules:
- Candidate must be able to answer within 30 seconds
- Penalize long or confusing answers
- Push clarity over complexity
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
        max_tokens: 500
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

    return parsed;

  } catch (error) {
    console.error("Interview Error:", error.response?.data || error.message);

    const fallback = getFallback("API failure");

    await logInterview({
      studentId: studentId || "anonymous",
      question,
      answer,
      subject,
      ...fallback
    });

    return fallback;
  }
}

module.exports = { evaluateAnswer };