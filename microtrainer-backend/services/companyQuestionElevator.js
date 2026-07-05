const axios = require("axios");
const { QUALITY_MODEL } = require("./aiModelConfig");
const { BASE_PERSONA } = require("./personaConfig");

function cleanJSON(raw) {
  if (!raw) return null;
  return raw.replace(/```json/g, "").replace(/```/g, "").trim();
}

function fallbackElevate(pattern, companyName) {
  const base = String(pattern || "").trim();
  if (!base) return "Answer as you would in a professional interview.";
  if (base.endsWith("?")) {
    return `${base.replace(/\?$/, "")} — give a concrete example from your experience.`;
  }
  return `${base} (as asked in a ${companyName} interview — explain with a real example).`;
}

/**
 * Turn stored patterns into slightly harder, non-verbatim interview questions.
 */
async function elevateQuestionPatterns(company, patterns) {
  if (!patterns?.length) return [];

  const items = patterns.map((p, i) => ({
    index: i,
    category: p.category,
    topic: p.topic,
    pattern: p.pattern,
    difficulty: p.difficulty || "medium",
  }));

  const systemPrompt = `
${BASE_PERSONA}

You prepare ${company.name} (${company.role}) campus interview mocks.

Rules:
- Use the SAME topic and style as each pattern (what ${company.name} actually asks).
- Make each question ~15–20% harder than a typical ${company.name} round — more depth, application, or follow-up expectation.
- Do NOT copy patterns word-for-word. Rephrase naturally.
- Keep questions answerable in 1–3 minutes spoken.
- Return ONLY valid JSON array.
`;

  const userPrompt = `
Company: ${company.name}
Role: ${company.role}

Patterns (from past interview data):
${JSON.stringify(items, null, 2)}

Return JSON array (same length, same index order):
[
  {
    "index": 0,
    "question": "elevated interview question text",
    "difficulty": "easy|medium|hard"
  }
]
`;

  try {
    const aiRes = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: QUALITY_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.45,
        max_tokens: 1200,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const raw = aiRes?.data?.choices?.[0]?.message?.content;
    const parsed = JSON.parse(cleanJSON(raw));
    if (!Array.isArray(parsed)) throw new Error("Expected array");

    return patterns.map((p, i) => {
      const match = parsed.find((x) => Number(x.index) === i) || parsed[i];
      return {
        ...p,
        question: match?.question?.trim() || fallbackElevate(p.pattern, company.name),
        difficulty: match?.difficulty || p.difficulty || "medium",
      };
    });
  } catch (err) {
    console.warn("Company question elevation fallback:", err.message);
    return patterns.map((p) => ({
      ...p,
      question: fallbackElevate(p.pattern, company.name),
      difficulty: p.difficulty || "medium",
    }));
  }
}

module.exports = {
  elevateQuestionPatterns,
  fallbackElevate,
};
