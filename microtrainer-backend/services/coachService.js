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
    // Calculate actual scores
    const validAnswers = history.filter(h => h.score !== undefined && h.score !== null);
    const avgScore = validAnswers.length > 0 
      ? validAnswers.reduce((sum, h) => sum + h.score, 0) / validAnswers.length 
      : 0;

    const answersSummary = history
      .map((h, i) => `
Q${i + 1}: ${h.question}
Answer: ${h.answer || 'No answer'}
Score: ${h.score || 0}/10
Mistakes: ${h.mistakes || 'N/A'}
`)
      .join("\n");

    const prompt = `
Subject: ${subject}
Average Score: ${avgScore.toFixed(1)}/10
Total Questions: ${validAnswers.length}

Interview Summary:
${answersSummary}

Generate a PROFESSIONAL coaching report in this EXACT format:

OVERALL FEEDBACK:
Below Average: [List specific topics where score < 5]
Average: [List specific topics where score 5-7]
Above Average: [List specific topics where score > 7]

IMPROVEMENTS NEEDED:
- [Specific actionable improvement 1]
- [Specific actionable improvement 2]
- [Specific actionable improvement 3]
- [Specific actionable improvement 4]

STRICT RULES:
- NO emojis
- NO generic advice
- Be brutally honest based on actual scores
- If average score is 0-3, say "Below Average" for ALL topics
- If average score is 4-6, be realistic about weaknesses
- Focus on WHAT TO DO, not just what's wrong
- Keep it professional and direct

Return ONLY plain text in the exact format above.
`;

    const SYSTEM_PROMPT = `
${BASE_PERSONA}

You are Sai Mahendra giving final interview feedback.

Tone:
- Professional
- Direct
- Honest
- No sugarcoating
- No emojis
- No motivational fluff

If the candidate scored poorly, SAY IT.
If they scored well, acknowledge it.
Base everything on actual performance data.
`;

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt }
        ],
        temperature: 0.4,
        max_tokens: 500
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const feedbackText = response?.data?.choices?.[0]?.message?.content || "Feedback generation failed";

    // Parse the feedback text into structured format
    const parsed = parseFeedbackText(feedbackText, avgScore);

    return parsed;

  } catch (error) {
    console.error("Coach Error:", error.message);

    return {
      feedbackText: "Error generating feedback. Please contact support.",
      overallPerformance: "System Error",
      topWeakAreas: ["Unable to evaluate"],
      topStrengths: [],
      improvementPlan: ["Please retry the interview"],
      nextFocus: "System maintenance required"
    };
  }
}

// Helper function to parse feedback text
function parseFeedbackText(text, avgScore) {
  // Extract sections using regex
  const overallMatch = text.match(/OVERALL FEEDBACK:([\s\S]*?)(?=IMPROVEMENTS NEEDED:|$)/i);
  const improvementsMatch = text.match(/IMPROVEMENTS NEEDED:([\s\S]*?)$/i);

  const overallSection = overallMatch ? overallMatch[1].trim() : "";
  const improvementsSection = improvementsMatch ? improvementsMatch[1].trim() : "";

  // Parse improvements (lines starting with -)
  const improvementPlan = improvementsSection
    .split('\n')
    .filter(line => line.trim().startsWith('-'))
    .map(line => line.trim().substring(1).trim());

  return {
    feedbackText: text, // Full formatted text
    overallPerformance: avgScore < 4 ? "Needs Significant Improvement" : avgScore < 7 ? "Average Performance" : "Strong Performance",
    overallSection: overallSection,
    improvementPlan: improvementPlan.length > 0 ? improvementPlan : ["Review fundamentals", "Practice more", "Focus on clarity"],
    topWeakAreas: [], // Deprecated
    topStrengths: [], // Deprecated
    nextFocus: improvementPlan[0] || "Review core concepts"
  };
}

module.exports = { generateCoachReport };