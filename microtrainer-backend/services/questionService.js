const axios = require("axios");

// 🔹 Persona
const {
  BASE_PERSONA,
  INTERVIEW_PERSONA
} = require("./personaConfig");

// 🔹 Memory (NEW)
const { getStudentMemory } = require("./memoryService");


// =======================================================
// 🔹 ADAPTIVE DIFFICULTY
// =======================================================
function getAdaptiveDifficulty(history = []) {
  if (history.length === 0) return "easy";

  const recent = history.slice(-3);

  const avg =
    recent.reduce((sum, h) => sum + (h.score || 0), 0) / recent.length;

  if (avg >= 7) return "hard";
  if (avg >= 4) return "medium";
  return "easy";
}


// =======================================================
// 🔹 WEAK AREA DETECTION (SESSION LEVEL)
// =======================================================
function getWeakFocus(history = []) {
  if (!history.length) return "";

  const mistakes = history
    .map(h => h.mistakes || "")
    .join(" ")
    .toLowerCase();

  if (mistakes.includes("state")) return "state management";
  if (mistakes.includes("hook")) return "react hooks";
  if (mistakes.includes("api")) return "api handling";
  if (mistakes.includes("render")) return "rendering";
  if (mistakes.includes("props")) return "props usage";

  return "";
}


// =======================================================
// 🔹 FALLBACK QUESTION
// =======================================================
function getFallbackQuestion(subject, difficulty) {
  if (difficulty === "easy") {
    return `What is ${subject}? Where is it used?`;
  }

  if (difficulty === "medium") {
    return `Give one real-world use of ${subject}.`;
  }

  return `Why do we need ${subject}? Give a real example.`;
}


// =======================================================
// 🔹 CLEAN OUTPUT
// =======================================================
function cleanQuestion(q) {
  if (!q) return null;

  let cleaned = q
    .replace(/^["'\n]+|["'\n]+$/g, "")
    .trim();

  if (cleaned.length > 140) {
    cleaned = cleaned.split(".")[0];
  }

  return cleaned;
}


// =======================================================
// 🔹 GENERATE QUESTION (FINAL)
// =======================================================
async function generateQuestion({ subject, history = [], studentId }) {
  try {
    const difficulty = getAdaptiveDifficulty(history);
    const weakFocus = getWeakFocus(history);

    // 🔹 MEMORY FETCH (NEW)
    const memory = await getStudentMemory(studentId);

    const weakConcepts = memory?.weakConcepts?.join(", ") || "";
    const strongConcepts = memory?.strongConcepts?.join(", ") || "";

    const previousQuestions = history
      .map(h => h.question)
      .filter(Boolean)
      .slice(-10);

    const prompt = `
Subject: ${subject}
Difficulty: ${difficulty}

Weak Concepts (Long-Term):
${weakConcepts || "None"}

Strong Concepts:
${strongConcepts || "None"}

Session Weak Focus:
${weakFocus || "None"}

Previous Questions:
${previousQuestions.map(q => "- " + q).join("\n") || "None"}

Generate ONE interview question.

STRICT RULES:
- No jargon
- One line only
- Max 12 words preferred
- Must test CORE concept
- Must include real-world usage
- Do NOT repeat previous questions

INTERVIEW STYLE:
- Straight to the point
- Practical
- No theory-heavy wording
- Answerable within 30 seconds

ADAPTIVE RULES:
- Focus on weak concepts first
- Avoid repeating strong areas too often
- If student is strong → increase difficulty
- If weak → reinforce basics

GOOD:
- What is state? Where do you use it?
- What is useEffect? Give one real example.
- When should you NOT use useEffect?

BAD:
- Explain React lifecycle in detail
- Describe architecture of React

Return ONLY question text.
`;

    const SYSTEM_PROMPT = `
${BASE_PERSONA}

${INTERVIEW_PERSONA}

You generate questions like Sai Mahendra:

- Sharp
- Direct
- No fluff
- Real-world focused
- Adaptive to student performance
`;

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt }
        ],
        temperature: 0.6,
        max_tokens: 60
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    let question = response?.data?.choices?.[0]?.message?.content;

    question = cleanQuestion(question);

    // =======================================================
    // 🔥 SAFETY CHECKS
    // =======================================================

    if (!question) {
      return getFallbackQuestion(subject, difficulty);
    }

    if (previousQuestions.includes(question)) {
      return getFallbackQuestion(subject, difficulty);
    }

    return question;

  } catch (error) {
    console.error("Question Generation Error:", error.message);
    return getFallbackQuestion(subject, "easy");
  }
}

module.exports = { generateQuestion };