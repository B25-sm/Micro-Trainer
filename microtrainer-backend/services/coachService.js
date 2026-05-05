const axios = require("axios");

// 🔹 Persona
const {
  BASE_PERSONA
} = require("./personaConfig");


// =======================================================
// 🔹 GENERATE COACH REPORT
// =======================================================
async function generateCoachReport({ history = [], studentId, subject }) {
  try {
    const answersSummary = history
      .map((h, i) => `
Q${i + 1}: ${h.question}
Score: ${h.score}
Mistake: ${h.mistakes}
`)
      .join("\n");

    const avgScore =
      history.reduce((sum, h) => sum + (h.score || 0), 0) /
      (history.length || 1);

    const prompt = `
Subject: ${subject}
Average Score: ${avgScore.toFixed(1)}

Interview Summary:
${answersSummary}

Generate a coaching report.

STRICT RULES:
- No generic advice
- Be direct
- Focus on improvement
- No long paragraphs

Return JSON:

{
  "overallPerformance": "short summary",
  "topWeakAreas": ["...", "..."],
  "topStrengths": ["...", "..."],
  "improvementPlan": [
    "step 1",
    "step 2",
    "step 3"
  ],
  "nextFocus": "what to study next"
}
`;

    const SYSTEM_PROMPT = `
${BASE_PERSONA}

You are Sai Mahendra acting as a coach after an interview.

Tone:
- Direct
- Practical
- Slightly strict
- Focused on improvement

No motivation fluff.
Give actionable steps only.
`;

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt }
        ],
        temperature: 0.5,
        max_tokens: 600
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const raw = response?.data?.choices?.[0]?.message?.content;

    let parsed;

    try {
      parsed = JSON.parse(
        raw.replace(/```json|```/g, "").trim()
      );
    } catch (err) {
      parsed = {
        overallPerformance: "Needs improvement",
        topWeakAreas: ["Concept clarity"],
        topStrengths: ["Basic understanding"],
        improvementPlan: [
          "Revise fundamentals",
          "Practice explaining clearly",
          "Focus on real-world examples"
        ],
        nextFocus: "Core concepts"
      };
    }

    return parsed;

  } catch (error) {
    console.error("Coach Error:", error.message);

    return {
      overallPerformance: "Error generating report",
      topWeakAreas: [],
      topStrengths: [],
      improvementPlan: [],
      nextFocus: ""
    };
  }
}

module.exports = { generateCoachReport };