// =======================================================
// 🎯 OVERALL FEEDBACK
// The capstone report. No matter which page the student used, every
// signal we collect across the app is synthesized here into ONE holistic
// judgement: readiness level, strengths, focus areas, per-skill breakdown,
// engagement/consistency, interview integrity, what they've been seeking
// help on — plus a natural-language narrative (rule-based by default, or
// AI-polished on request).
// =======================================================

const { buildScorecard } = require("./placementScorecardService");
const { getStudentMastery } = require("./conceptMasteryService");
const { getStudentProfile } = require("./studentProfileStore");

// ---- safe async gatherers (one failure never sinks the whole report) ----
async function safe(fn, fallback) {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}

function recentSearches(studentId) {
  try {
    const { getEventsForStudent } = require("./studentLearningLedgerService");
    const events = getEventsForStudent(studentId, { limit: 200 });
    const searches = events
      .filter((e) => e.activityType === "search_query" && e.topic)
      .map((e) => String(e.topic).slice(0, 60));
    return [...new Set(searches)].slice(0, 5);
  } catch {
    return [];
  }
}

function learnerProfile(studentId) {
  try {
    return require("./learnerProfileService").getLearnerProfile(studentId);
  } catch {
    return null;
  }
}

function interviewSummary(studentId) {
  try {
    const { getInterviewsByStudent } = require("./interviewHistoryService");
    const list = getInterviewsByStudent(studentId, { limit: 100 }) || [];
    if (list.length === 0) return { count: 0 };
    const scored = list.filter((r) => r.averageScore != null);
    const avg =
      scored.length > 0
        ? Number(
            (scored.reduce((s, r) => s + Number(r.averageScore), 0) / scored.length).toFixed(1)
          )
        : null;
    const flagged = list.filter(
      (r) => r.integrityStatus === "flagged" || r.integrityStatus === "dismissed"
    ).length;
    return {
      count: list.length,
      averageScore: avg,
      latestVerdict: list[0]?.verdict || null,
      latestSubject: list[0]?.subject || null,
      flagged,
    };
  } catch {
    return { count: 0 };
  }
}

// ---- narrative helpers ----
function joinList(arr, max = 3) {
  const items = (arr || []).filter(Boolean).slice(0, max);
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

function consistencyLabel(activeDaysLast14) {
  if (activeDaysLast14 == null) return null;
  if (activeDaysLast14 >= 10) return "very consistent";
  if (activeDaysLast14 >= 5) return "fairly consistent";
  if (activeDaysLast14 >= 2) return "sporadic";
  return "barely active";
}

function buildRuleNarrative(ctx) {
  const { name, scorecard, strengths, focusAreas, profile, interviews, searches } = ctx;
  const s = [];
  const who = name || "This candidate";

  if (!scorecard || scorecard.assessedCount === 0) {
    return `${who} has not generated enough activity yet to assess. Encourage a first mock interview or a few guided lessons so the platform can start judging their understanding.`;
  }

  s.push(
    `${who} sits in the ${scorecard.overall.level.toLowerCase()} band overall` +
      (scorecard.overall.score != null ? ` (${scorecard.overall.score}/100 readiness)` : "") +
      `. ${scorecard.overall.message}`
  );

  if (strengths.length > 0) {
    s.push(`Strongest in ${joinList(strengths)}.`);
  }
  if (focusAreas.length > 0) {
    s.push(`The clearest gaps are ${joinList(focusAreas)} — these should be the coaching focus.`);
  }

  if (profile) {
    const cons = consistencyLabel(profile.studyPattern?.activeDaysLast14);
    const bits = [];
    if (cons) bits.push(`${cons} (${profile.studyPattern.activeDaysLast14}/14 active days)`);
    if (profile.momentum && profile.momentum !== "steady") bits.push(`${profile.momentum} momentum`);
    if (profile.churnRisk?.level === "high") bits.push("at risk of dropping off");
    if (bits.length) s.push(`Engagement is ${joinList(bits, 3)}.`);
  }

  if (interviews?.count > 0) {
    let line = `Across ${interviews.count} mock interview${interviews.count === 1 ? "" : "s"}`;
    if (interviews.averageScore != null) line += ` they average ${interviews.averageScore}/10`;
    if (interviews.latestVerdict) line += `, most recently "${interviews.latestVerdict}"`;
    line += ".";
    if (interviews.flagged > 0) {
      line += ` Note: ${interviews.flagged} session${interviews.flagged === 1 ? " was" : "s were"} flagged for integrity.`;
    }
    s.push(line);
  }

  if (searches.length > 0) {
    s.push(`Recently seeking help on ${joinList(searches, 3)}.`);
  }

  return s.join(" ");
}

function buildRecommendations(ctx) {
  const { scorecard, focusAreas, profile, interviews } = ctx;
  const recs = [];

  if (!scorecard || scorecard.assessedCount === 0) {
    return ["Run a first mock interview and a couple of guided lessons to seed an assessment."];
  }
  if (focusAreas.length > 0) {
    recs.push(`Targeted practice on ${joinList(focusAreas, 3)}.`);
  }
  if (profile?.churnRisk?.level === "high") {
    recs.push("Re-engage soon — attendance has dropped; a 1-on-1 check-in is warranted.");
  }
  if (profile?.momentum === "declining") {
    recs.push("Scores are trending down — review recent weak answers together.");
  }
  if (interviews?.count === 0) {
    recs.push("Has not attempted a mock interview yet — schedule one to gauge readiness.");
  } else if (interviews?.flagged > 0) {
    recs.push("Address the flagged interview integrity before relying on those scores.");
  }
  if (scorecard.overall.level === "Above average" && recs.length === 0) {
    recs.push("Strong and steady — consider advanced problems or peer mentoring.");
  }
  if (recs.length === 0) {
    recs.push("Keep the current practice cadence; re-check readiness in a week.");
  }
  return recs;
}

async function generateAiNarrative(ctx) {
  const { callGroq } = require("./groqClient");
  const { QUALITY_MODEL } = require("./aiModelConfig");
  const facts = {
    name: ctx.name,
    overall: ctx.scorecard?.overall,
    strengths: ctx.strengths,
    focusAreas: ctx.focusAreas,
    skills: (ctx.scorecard?.skills || []).map((s) => `${s.label}: ${s.level}`),
    engagement: ctx.profile
      ? {
          activeDaysLast14: ctx.profile.studyPattern?.activeDaysLast14,
          momentum: ctx.profile.momentum,
          churnRisk: ctx.profile.churnRisk?.level,
        }
      : null,
    interviews: ctx.interviews,
    recentSearches: ctx.searches,
  };
  const response = await callGroq({
    task: "overall-feedback",
    model: QUALITY_MODEL,
    temperature: 0.5,
    max_tokens: 320,
    messages: [
      {
        role: "system",
        content:
          "You are a senior technical trainer writing a short, honest overall feedback for a coding student, addressed to the placement team. 4-6 sentences, specific, no fluff, no markdown. Base every claim ONLY on the JSON facts given.",
      },
      { role: "user", content: JSON.stringify(facts) },
    ],
  });
  const text = response?.data?.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("empty narrative");
  return text;
}

/**
 * Build the holistic overall feedback for a student.
 * @param {string} studentId
 * @param {object} [opts]
 * @param {boolean} [opts.ai] - attempt an AI-polished narrative (falls back to rule-based)
 */
async function buildOverallFeedback(studentId, { ai = false } = {}) {
  const identity = getStudentProfile(studentId);
  const scorecard = await safe(() => buildScorecard(studentId), null);
  const mastery = await safe(() => getStudentMastery(studentId), { technologies: [], topWeakConcepts: [] });
  const profile = learnerProfile(studentId);
  const interviews = interviewSummary(studentId);
  const searches = recentSearches(studentId);

  // Strengths: above-average skills + strong concepts.
  const strongSkills = (scorecard?.skills || [])
    .filter((s) => s.level === "Above average")
    .map((s) => s.label);
  const strongConcepts = (mastery?.technologies || [])
    .flatMap((t) => (t.strongConcepts || []).map((c) => c.label))
    .slice(0, 3);
  const strengths = [...new Set([...strongSkills, ...strongConcepts])].slice(0, 4);

  // Focus areas: weakest concepts across everything.
  const focusAreas = [
    ...new Set(
      (scorecard?.topWeakConcepts || mastery?.topWeakConcepts || []).map(
        (c) => `${c.technology} ${c.label}`.trim()
      )
    ),
  ].slice(0, 4);

  const ctx = {
    name: identity?.name || scorecard?.name || studentId,
    scorecard,
    strengths,
    focusAreas,
    profile,
    interviews,
    searches,
  };

  let narrative = buildRuleNarrative(ctx);
  let narrativeSource = "rules";
  if (ai) {
    try {
      narrative = await generateAiNarrative(ctx);
      narrativeSource = "ai";
    } catch (err) {
      console.warn("Overall feedback AI narrative failed, using rules:", err.message);
    }
  }

  return {
    studentId,
    name: ctx.name,
    batch: identity?.batch || scorecard?.batch || "",
    careerTrack: identity?.careerTrack || null,
    generatedAt: new Date().toISOString(),
    hasData: Boolean(scorecard && scorecard.assessedCount > 0),
    readinessScore: scorecard?.overall?.score ?? null,
    level: scorecard?.overall?.level ?? "Not yet started",
    verdict: scorecard?.overall?.message ?? "Not enough activity yet to assess.",
    narrative,
    narrativeSource,
    strengths,
    focusAreas,
    skills: scorecard?.skills || [],
    engagement: profile
      ? {
          activeDaysLast14: profile.studyPattern?.activeDaysLast14 ?? null,
          totalActiveDays: profile.studyPattern?.totalActiveDays ?? null,
          momentum: profile.momentum ?? null,
          churnRisk: profile.churnRisk?.level ?? null,
          overallAvgScore: profile.overallAvgScore ?? null,
        }
      : null,
    interviews,
    recentSearches: searches,
    recommendations: buildRecommendations(ctx),
  };
}

module.exports = { buildOverallFeedback };
