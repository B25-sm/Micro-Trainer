// =======================================================
// 🎯 RECOMMENDATION SERVICE (Phase 3)
// Turns a learner profile into a ranked, EXPLAINABLE list of
// "what to do next". This is the helpful, first-party cousin of
// ad-style retargeting — every recommendation carries a human reason.
//
// Rule-based by design: at batch scale this beats ML and stays explainable.
// Phase 5 lets a trained scorer override the ranking without changing callers.
// =======================================================

const { getLearnerProfile } = require("./learnerProfileService");

let mlScorer = null; // optional pluggable scorer (Phase 5)

/** Allow a Phase 5 ML model to re-rank recommendations later. */
function registerScorer(fn) {
  mlScorer = typeof fn === "function" ? fn : null;
}

function titleCase(str) {
  return String(str || "")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function buildRecommendations(profile) {
  if (!profile) return [];
  const recs = [];

  // 1) Comeback / streak-save when churn risk is rising
  if (profile.churnRisk?.level === "high") {
    recs.push({
      id: "comeback",
      type: "comeback",
      priority: 95,
      title: "Jump back in — a 5-minute session keeps you sharp",
      reason: `You haven't practiced in ${profile.churnRisk.daysSinceActive} days. Short sessions rebuild momentum fast.`,
      action: { label: "Quick practice", path: "/learn" },
    });
  } else if (profile.churnRisk?.level === "medium") {
    recs.push({
      id: "stay-consistent",
      type: "consistency",
      priority: 70,
      title: "Keep your rhythm going",
      reason: `It's been ${profile.churnRisk.daysSinceActive} days. A quick session today keeps your progress on track.`,
      action: { label: "Practice now", path: "/learn" },
    });
  }

  // 2) Weak topics — most impactful, ranked by lowest score
  for (const t of profile.weakTopics || []) {
    recs.push({
      id: `weak-topic-${t.topic}`.toLowerCase().replace(/\s+/g, "-"),
      type: "review_weak_topic",
      priority: 88 - Math.min(20, Math.round((t.avgScore || 0) / 5)),
      title: `Review ${t.topic}`,
      reason: `Your average here is ${t.avgScore}% across ${t.attempts} attempt(s) — the biggest quick win for your score.`,
      technology: t.technology,
      topic: t.topic,
      action: {
        label: "Learn this",
        path: `/learn?topic=${encodeURIComponent(t.topic)}`,
      },
    });
  }

  // 3) Declining technologies — refresh before it slips further
  for (const [tech, data] of Object.entries(profile.technologies || {})) {
    if (data.trend === "declining") {
      recs.push({
        id: `refresh-${tech}`,
        type: "refresh_declining",
        priority: 80,
        title: `Refresh ${titleCase(tech)} — your scores are slipping`,
        reason: `Recent ${titleCase(tech)} scores dropped vs. earlier (now ~${data.avgScore}%). A refresher reverses the trend.`,
        technology: tech,
        action: { label: `Practice ${titleCase(tech)}`, path: "/learn" },
      });
    }
  }

  // 4) Interview practice when interview tech is weak/developing
  const interviewWeak = Object.entries(profile.technologies || {}).some(
    ([, d]) => d.mastery !== "strong"
  );
  if (interviewWeak && (profile.scoredEvents || 0) > 0) {
    recs.push({
      id: "mock-interview",
      type: "practice_interview",
      priority: 60,
      title: "Take a mock interview",
      reason:
        "Practicing under interview conditions exposes gaps that quizzes miss — great for retention.",
      action: { label: "Start interview", path: "/interview" },
    });
  }

  // 5) Advance strong topics — keep strong learners challenged
  for (const t of (profile.strongTopics || []).slice(0, 2)) {
    recs.push({
      id: `advance-${t.topic}`.toLowerCase().replace(/\s+/g, "-"),
      type: "advance_topic",
      priority: 45,
      title: `Level up: harder ${t.topic} challenges`,
      reason: `You're strong here (${t.avgScore}%). Tackle advanced problems to deepen mastery.`,
      technology: t.technology,
      topic: t.topic,
      action: { label: "Code practice", path: "/code-practice" },
    });
  }

  // 6) Cold start — no data yet
  if ((profile.scoredEvents || 0) === 0 && recs.length === 0) {
    recs.push({
      id: "get-started",
      type: "onboarding",
      priority: 50,
      title: "Start your first guided lesson",
      reason:
        "Once you complete a few activities, this space personalizes to your strengths and weak spots.",
      action: { label: "Browse courses", path: "/learn" },
    });
  }

  // Optional study-time nudge (gentle, low priority)
  const hours = profile.studyPattern?.preferredHoursUTC || [];
  if (hours.length) {
    recs.push({
      id: "study-time",
      type: "study_time",
      priority: 25,
      title: "You learn best at a consistent time",
      reason: `Most of your progress happens around ${hours
        .slice(0, 2)
        .map((h) => `${h}:00 UTC`)
        .join(", ")}. Blocking that time helps consistency.`,
      action: { label: "Plan schedule", path: "/personal-schedule" },
    });
  }

  let ranked = recs.sort((a, b) => b.priority - a.priority);

  // Phase 5 hook: let a trained model re-score if registered
  if (mlScorer) {
    try {
      ranked = mlScorer(profile, ranked) || ranked;
    } catch (err) {
      console.error("ML scorer error (falling back to rules):", err.message);
    }
  }

  return ranked.slice(0, 6);
}

function getRecommendations(studentId) {
  const profile = getLearnerProfile(studentId);
  return {
    studentId,
    generatedAt: new Date().toISOString(),
    momentum: profile.momentum,
    churnRisk: profile.churnRisk,
    recommendations: buildRecommendations(profile),
  };
}

module.exports = {
  getRecommendations,
  buildRecommendations,
  registerScorer,
};
