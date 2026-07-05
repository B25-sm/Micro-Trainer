const axios = require("axios");
const { QUALITY_MODEL } = require("./aiModelConfig");
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
  {
    id: "random-hobby",
    category: "Spontaneous",
    prompt: "Talk about a hobby or interest you're passionate about.",
    hint: "Lead with your main point. One example. Wrap up — don't trail off.",
  },
  {
    id: "random-automate",
    category: "Spontaneous",
    prompt: "If you could automate one part of your daily routine, what would it be and why?",
    hint: "Say the 'what' first, then the 'why' in one or two reasons.",
  },
  {
    id: "random-teach",
    category: "Spontaneous",
    prompt: "If you had to teach a 10-minute class tomorrow, what topic would you pick and why?",
    hint: "Pick one topic — don't hedge between options.",
  },
  {
    id: "random-decision",
    category: "Spontaneous",
    prompt: "Describe a recent decision you made and how you approached it.",
    hint: "State the decision first, then briefly how you got there.",
  },
  {
    id: "random-skill",
    category: "Spontaneous",
    prompt: "What's a skill you wish schools taught but don't?",
    hint: "Name the skill immediately, then justify it.",
  },
  {
    id: "random-weekend",
    category: "Spontaneous",
    prompt: "Describe your ideal weekend, start to finish.",
    hint: "Structure it in order — morning to night — not a list of unrelated things.",
  },
];

const ANSWER_FRAMEWORKS = {
  Introduction: {
    name: "Present → Past → Future",
    steps: [
      { key: "present", label: "Present", guidance: "Who you are right now — current role, year of study, or focus area." },
      { key: "past", label: "Past", guidance: "Relevant background — what led you here (experience, projects, education)." },
      { key: "future", label: "Future", guidance: "What you're looking for next and why this role/company fits." },
    ],
  },
  Behavioral: {
    name: "STAR",
    steps: [
      { key: "situation", label: "Situation", guidance: "Set the context — where and when this happened." },
      { key: "task", label: "Task", guidance: "Your specific responsibility or goal in that situation." },
      { key: "action", label: "Action", guidance: "What YOU did, step by step — not what the team did." },
      { key: "result", label: "Result", guidance: "The outcome, ideally with a number or concrete detail, plus what you learned." },
    ],
  },
  "Technical explanation": {
    name: "Analogy → Explanation → Example",
    steps: [
      { key: "analogy", label: "Hook / Analogy", guidance: "Open with a simple analogy a non-expert would recognize." },
      { key: "explanation", label: "Core explanation", guidance: "The actual mechanism, in plain language, no unexplained jargon." },
      { key: "example", label: "Concrete example", guidance: "One real, specific example that makes it click." },
    ],
  },
  Situational: {
    name: "Clarify → Plan → Act → Communicate",
    steps: [
      { key: "clarify", label: "Clarify", guidance: "What you'd confirm or ask first before acting." },
      { key: "plan", label: "Plan", guidance: "How you'd prioritize or break down the problem." },
      { key: "act", label: "Act", guidance: "The concrete steps you'd actually take." },
      { key: "communicate", label: "Communicate", guidance: "How and when you'd update others involved." },
    ],
  },
  Custom: {
    name: "Context → Core Point → Impact",
    steps: [
      { key: "context", label: "Context", guidance: "The one or two sentences of setup the listener needs." },
      { key: "core", label: "Core point", guidance: "The main answer — say it directly, don't bury it." },
      { key: "impact", label: "Impact / next step", guidance: "Why it matters or what happens next." },
    ],
  },
  Spontaneous: {
    name: "Open → Develop → Wrap-up",
    steps: [
      { key: "open", label: "Open", guidance: "State your main point or answer in the first sentence — don't warm up first." },
      { key: "develop", label: "Develop", guidance: "Give one or two reasons or a short example that supports it." },
      { key: "wrapup", label: "Wrap-up", guidance: "Close with a short concluding line instead of trailing off." },
    ],
  },
};

function getFramework(category) {
  return ANSWER_FRAMEWORKS[category] || ANSWER_FRAMEWORKS.Custom;
}

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

  const framework = getFramework(scenario?.category || "Custom");

  const systemPrompt = `
${BASE_PERSONA}

You are a communication coach for technical interview prep — NOT a technical grader.

Evaluate HOW the student communicates: clarity, structure, conciseness, confidence, and professionalism.
Do NOT penalize for minor technical inaccuracies unless they make the answer confusing.
Do NOT reward length — rambling is a communication flaw.
Short, clear, structured answers can score 9-10.

You must also TEACH structure, not just correct wording. For every review, map the student's
answer onto the "${framework.name}" framework, step by step, so they learn how to organize
future answers the same way — do not just hand back a single rewritten sentence.

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

The answer should follow this framework: "${framework.name}"
Steps to map the student's answer onto:
${framework.steps.map((s, i) => `${i + 1}. ${s.label} — ${s.guidance}`).join("\n")}

For "structureBreakdown", go through EACH step above in order and report whether the student's
answer covered it. If covered, quote or paraphrase what they said for that step. If missing, give
a short concrete tip (1 sentence) for what they should add there next time.

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
  "structureBreakdown": [
    { "step": "step label from the framework", "covered": true|false, "note": "what they said for this step, or a tip if missing" }
  ],
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
          model: QUALITY_MODEL,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.35,
          max_tokens: 1100,
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

      const aiBreakdown = Array.isArray(parsed.structureBreakdown)
        ? parsed.structureBreakdown
        : [];

      const structureBreakdown = framework.steps.map((s, i) => {
        const match =
          aiBreakdown.find(
            (b) => String(b.step || "").toLowerCase().includes(s.label.toLowerCase())
          ) || aiBreakdown[i];

        return {
          step: s.label,
          guidance: s.guidance,
          covered: Boolean(match?.covered),
          note: match?.note ? String(match.note).trim() : null,
        };
      });

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
        structureFramework: framework.name,
        structureBreakdown,
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
