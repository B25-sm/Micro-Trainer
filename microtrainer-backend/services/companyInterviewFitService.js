const axios = require("axios");
const { QUALITY_MODEL } = require("./aiModelConfig");
const { BASE_PERSONA } = require("./personaConfig");

function cleanJSON(raw) {
  if (!raw) return null;
  return raw.replace(/```json/g, "").replace(/```/g, "").trim();
}

function fitVerdictFromScore(avg, thresholds = {}, { completionRate = 100 } = {}) {
  const strong = Number(thresholds.strong ?? 7.0);
  const borderline = Number(thresholds.borderline ?? 5.5);

  if (completionRate < 60) {
    return {
      fitLevel: "incomplete",
      fitLabel: "Not eligible — mock incomplete",
      fitSummary:
        "Finish at least most of the mock before we can decide eligibility for the real interview.",
      eligible: false,
      eligibilityStatus: "not_eligible",
      eligibilityLabel: "Not eligible",
      eligibilityReason:
        "You ended the mock too early. Complete a full round so we can assess you fairly.",
      passScore: strong,
      minScore: borderline,
    };
  }

  if (avg >= strong) {
    return {
      fitLevel: "strong_fit",
      fitLabel: "Eligible for interview",
      fitSummary: `You cleared the ${strong}/10 bar. You are ready to attend the real company interview.`,
      eligible: true,
      eligibilityStatus: "eligible",
      eligibilityLabel: "Eligible",
      eligibilityReason: `Mock score ${avg}/10 meets the pass bar (${strong}+). Attend the real interview with confidence.`,
      passScore: strong,
      minScore: borderline,
    };
  }

  if (avg >= borderline) {
    return {
      fitLevel: "borderline",
      fitLabel: "Not eligible yet — almost there",
      fitSummary: `You are close (${avg}/10) but below the ${strong}/10 bar we use before recommending the real interview.`,
      eligible: false,
      eligibilityStatus: "near_eligible",
      eligibilityLabel: "Not eligible yet",
      eligibilityReason: `Score is above minimum practice level but below the ${strong}/10 eligibility bar. One more focused prep round recommended.`,
      passScore: strong,
      minScore: borderline,
    };
  }

  return {
    fitLevel: "not_yet",
    fitLabel: "Not eligible for interview",
    fitSummary: `Below the ${borderline}/10 minimum. Do not attend the real interview yet — work through the prep plan first.`,
    eligible: false,
    eligibilityStatus: "not_eligible",
    eligibilityLabel: "Not eligible",
    eligibilityReason: `Mock score ${avg}/10 is below the ${borderline}/10 minimum. More preparation is required before the real company interview.`,
    passScore: strong,
    minScore: borderline,
  };
}

function buildCategoryBreakdown(history) {
  const buckets = {};
  (history || []).forEach((h) => {
    if (h.score == null || h.answer == null || h.answer === "") return;
    const cat = h.category || "General";
    if (!buckets[cat]) buckets[cat] = { scores: [], weak: [] };
    buckets[cat].scores.push(Number(h.score));
    if (Number(h.score) < 6 && h.topic) {
      buckets[cat].weak.push(h.topic);
    }
  });

  return Object.entries(buckets).map(([category, data]) => {
    const avg =
      data.scores.reduce((a, b) => a + b, 0) / (data.scores.length || 1);
    return {
      category,
      averageScore: Number(avg.toFixed(2)),
      questionCount: data.scores.length,
      weakTopics: [...new Set(data.weak)].slice(0, 4),
    };
  });
}

async function generateFitReport({ company, history, averageScore, fitVerdict }) {
  const breakdown = buildCategoryBreakdown(history);
  const answersSummary = (history || [])
    .filter((h) => h.answer != null && h.answer !== "")
    .map(
      (h, i) =>
        `Q${i + 1} [${h.category}/${h.topic}] (${h.score ?? "—"}/10): ${h.question}\nA: ${(h.answer || "").slice(0, 280)}`
    )
    .join("\n\n");

  const systemPrompt = `
${BASE_PERSONA}

You assess whether a student is ELIGIBLE to attend the REAL ${company.name} interview (${company.role}) based on this mock.

Eligibility rule used by the system:
- Eligible only if mock average >= ${fitVerdict.passScore}/10 and mock was completed.
- Below that: NOT eligible — they should prepare more before the real interview.

Tone: honest, clear, specific. No emojis.
`;

  const userPrompt = `
Company: ${company.name}
Role: ${company.role}
Mock average: ${averageScore}/10
Eligibility: ${fitVerdict.eligible ? "ELIGIBLE" : "NOT ELIGIBLE"}
Status: ${fitVerdict.eligibilityLabel}
Reason: ${fitVerdict.eligibilityReason}

Category breakdown:
${JSON.stringify(breakdown, null, 2)}

Interview transcript:
${answersSummary}

Return ONLY valid JSON:
{
  "headline": "one clear line: eligible or not for the real ${company.name} interview",
  "eligibilityAdvice": "what they should do next if not eligible, or encouragement if eligible",
  "strengths": ["2-3 bullets"],
  "gaps": ["2-4 specific topics blocking eligibility"],
  "prepPlan": ["3 actionable steps before attempting the real interview"],
  "trainerNote": "one sentence a trainer would tell this student"
}
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
        temperature: 0.35,
        max_tokens: 700,
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

    return {
      headline: parsed.headline || fitVerdict.fitSummary,
      eligibilityAdvice: parsed.eligibilityAdvice || fitVerdict.eligibilityReason,
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      gaps: Array.isArray(parsed.gaps) ? parsed.gaps : [],
      prepPlan: Array.isArray(parsed.prepPlan) ? parsed.prepPlan : [],
      trainerNote: parsed.trainerNote || "",
      categoryBreakdown: breakdown,
    };
  } catch (err) {
    console.warn("Company fit report fallback:", err.message);
    const weakTopics = breakdown.flatMap((b) => b.weakTopics);
    return {
      headline: fitVerdict.fitSummary,
      eligibilityAdvice: fitVerdict.eligibilityReason,
      strengths: breakdown
        .filter((b) => b.averageScore >= 7)
        .map((b) => `Solid ${b.category} (${b.averageScore}/10)`),
      gaps: [...new Set(weakTopics)].slice(0, 4),
      prepPlan: [
        `Redo this ${company.name} mock after revising weak topics`,
        "Practice explaining answers with one real project example each",
        "Run Communication Review on HR-style answers",
      ],
      trainerNote: "Focus on consistency — company rounds reward clear, structured answers.",
      categoryBreakdown: breakdown,
    };
  }
}

async function buildCompanyFitResult({ company, history, status = "completed" }) {
  const scored = (history || []).filter(
    (h) => h.score != null && h.answer != null && h.answer !== ""
  );

  const averageScore =
    scored.length === 0
      ? 0
      : Number(
          (
            scored.reduce((sum, h) => sum + Number(h.score || 0), 0) /
            scored.length
          ).toFixed(2)
        );

  const totalPlanned = (history || []).length;
  const completionRate =
    totalPlanned > 0 ? Math.round((scored.length / totalPlanned) * 100) : 0;

  const fitVerdict = fitVerdictFromScore(averageScore, company.fitThresholds, {
    completionRate: status === "completed" ? 100 : completionRate,
  });

  const fitReport = await generateFitReport({
    company,
    history,
    averageScore,
    fitVerdict,
  });

  return {
    companyId: company.id,
    companyName: company.name,
    role: company.role,
    averageScore,
    questionsAnswered: scored.length,
    totalQuestions: history.length,
    completionRate,
    status,
    ...fitVerdict,
    fitReport,
  };
}

module.exports = {
  fitVerdictFromScore,
  buildCategoryBreakdown,
  generateFitReport,
  buildCompanyFitResult,
};
