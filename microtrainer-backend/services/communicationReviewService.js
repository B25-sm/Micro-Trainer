const axios = require("axios");
const { BASE_PERSONA } = require("./personaConfig");
const { addReview, getHistory } = require("./communicationReviewStore");

const SCENARIOS = [
  {
    id: "intro-yourself",
    category: "Introduction",
    prompt: "Tell me about yourself.",
    hint: "Keep it 60–90 seconds. Present → past → future. No life story.",
  },
  {
    id: "why-role",
    category: "Introduction",
    prompt: "Why are you interested in this role and our company?",
    hint: "Show genuine motivation — role fit, not generic praise.",
  },
  {
    id: "challenging-project",
    category: "Behavioral",
    prompt: "Describe a challenging project you worked on. What was your role?",
    hint: "Use STAR: Situation, Task, Action, Result — your actions first.",
  },
  {
    id: "team-conflict",
    category: "Behavioral",
    prompt: "Tell me about a time you disagreed with a teammate. How did you handle it?",
    hint: "Stay professional. Focus on resolution, not blame.",
  },
  {
    id: "mistake-learned",
    category: "Behavioral",
    prompt: "Tell me about a mistake you made at work or in a project. What did you learn?",
    hint: "Own the mistake. End with a concrete lesson.",
  },
  {
    id: "explain-to-manager",
    category: "Technical explanation",
    prompt:
      "Explain what an API is to a non-technical product manager in under a minute.",
    hint: "No jargon. Use a simple analogy, then one real example.",
  },
  {
    id: "explain-database",
    category: "Technical explanation",
    prompt:
      "How would you explain the difference between SQL and NoSQL to a junior developer?",
    hint: "Compare trade-offs, not definitions only.",
  },
  {
    id: "debug-approach",
    category: "Situational",
    prompt: "Walk me through how you approach debugging a bug you have never seen before.",
    hint: "Structured steps: reproduce → isolate → hypothesize → verify → fix.",
  },
  {
    id: "tight-deadline",
    category: "Situational",
    prompt:
      "You have a tight deadline and incomplete requirements. How do you communicate with your team?",
    hint: "Show clarity, prioritization, and proactive updates.",
  },
  {
    id: "weakness",
    category: "Introduction",
    prompt: "What is your greatest weakness, and how are you working on it?",
    hint: "Real weakness + specific improvement — not a humble brag.",
  },
];

function cleanJSON(raw) {
  if (!raw) return null;
  return raw.replace(/```json/g, "").replace(/```/g, "").trim();
}

function getScenarios() {
  return SCENARIOS;
}

function getScenarioById(id) {
  return SCENARIOS.find((s) => s.id === id) || null;
}

async function reviewCommunication({
  studentId,
  scenarioId,
  customPrompt,
  response,
}) {
  const scenario = scenarioId ? getScenarioById(scenarioId) : null;
  const promptText =
    customPrompt?.trim() ||
    scenario?.prompt ||
    "Answer as you would in a professional interview.";

  if (!response?.trim()) {
    throw new Error("Response is required");
  }

  if (response.trim().length < 20) {
    throw new Error("Write at least a few sentences so we can review your communication");
  }

  const systemPrompt = `
${BASE_PERSONA}

You are a communication coach for technical interview prep — NOT a technical grader.

Evaluate HOW the student communicates: clarity, structure, conciseness, confidence, and professionalism.
Do NOT penalize for minor technical inaccuracies unless they make the answer confusing.
Do NOT reward length — rambling is a communication flaw.
Short, clear, structured answers can score 9-10.

Respond ONLY with valid JSON (no markdown).
`;

  const userPrompt = `
Interview prompt:
"${promptText}"

Student's spoken-style answer:
"""
${response.trim()}
"""

Score each dimension 0-10 and give actionable feedback.

JSON schema:
{
  "overallScore": 0-10,
  "overallVerdict": "Strong communicator" | "Solid — polish a few areas" | "Needs practice",
  "dimensions": {
    "clarity": { "score": 0-10, "label": "Clarity", "feedback": "one sentence" },
    "structure": { "score": 0-10, "label": "Structure", "feedback": "one sentence" },
    "conciseness": { "score": 0-10, "label": "Conciseness", "feedback": "one sentence" },
    "confidence": { "score": 0-10, "label": "Confidence", "feedback": "one sentence" },
    "professionalism": { "score": 0-10, "label": "Professional tone", "feedback": "one sentence" }
  },
  "strengths": ["2-3 short bullets"],
  "improvements": ["2-3 specific, actionable tips"],
  "fillerWords": ["list detected fillers like um, like, basically — empty array if none"],
  "rewrittenSample": "A tighter 45-75 second version they could say aloud — same facts, better delivery"
}
`;

  const maxRetries = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const aiRes = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model: "llama-3.1-8b-instant",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.35,
          max_tokens: 900,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const raw = aiRes?.data?.choices?.[0]?.message?.content;
      const cleaned = cleanJSON(raw);
      let parsed;

      try {
        parsed = JSON.parse(cleaned);
      } catch {
        throw new Error("Invalid AI response format");
      }

      const overallScore = Math.max(
        0,
        Math.min(10, Number(parsed.overallScore) || 0)
      );

      const result = {
        scenarioId: scenario?.id || null,
        category: scenario?.category || "Custom",
        prompt: promptText,
        response: response.trim(),
        overallScore,
        overallVerdict:
          parsed.overallVerdict || (overallScore >= 8 ? "Strong communicator" : "Needs practice"),
        dimensions: parsed.dimensions || {},
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
        improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [],
        fillerWords: Array.isArray(parsed.fillerWords) ? parsed.fillerWords : [],
        rewrittenSample: parsed.rewrittenSample || "",
      };

      if (studentId) {
        addReview(studentId, result);
      }

      return result;
    } catch (error) {
      lastError = error;
      if (
        error.response?.status === 429 ||
        error.response?.data?.error?.code === "rate_limit_exceeded"
      ) {
        const waitTime = attempt * 2000;
        if (attempt < maxRetries) {
          await new Promise((r) => setTimeout(r, waitTime));
          continue;
        }
      }
      break;
    }
  }

  console.error(
    "Communication review error:",
    lastError?.response?.data || lastError?.message
  );
  throw new Error("Could not complete communication review. Please try again.");
}

function getStudentHistory(studentId) {
  return getHistory(studentId);
}

module.exports = {
  getScenarios,
  getScenarioById,
  reviewCommunication,
  getStudentHistory,
};
