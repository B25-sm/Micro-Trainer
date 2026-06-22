// =======================================================
// 🚨 AT-RISK MONITOR SERVICE (Phase 4)
// Scans learner profiles for students who need a trainer's attention
// and surfaces them — real-time to the admin room and as a trainer API.
// Uses the (pluggable) churn predictor so it upgrades automatically
// when a trained model is registered in Phase 5.
// =======================================================

const {
  getAllProfiles,
  rebuildAllProfiles,
} = require("./learnerProfileService");
const { predictChurn } = require("./featureStoreService");

/** Build human-readable reasons for why a student is flagged. */
function reasonsFor(profile, churn) {
  const reasons = [];
  const days = profile.churnRisk?.daysSinceActive;
  if (days != null && days >= 7) {
    reasons.push(`Inactive for ${days} days`);
  } else if (days != null && days >= 3) {
    reasons.push(`No activity in ${days} days`);
  }
  if (profile.momentum === "declining") {
    reasons.push(`Scores declining (${profile.momentumScore} pts)`);
  }
  if ((profile.engagement?.abandonRate ?? 0) > 0.4) {
    reasons.push(
      `Abandons ${Math.round(profile.engagement.abandonRate * 100)}% of opened topics`
    );
  }
  const weakCount = (profile.weakTopics || []).length;
  if (weakCount >= 3) {
    reasons.push(`${weakCount} weak topics need support`);
  }
  if (!reasons.length && churn >= 50) {
    reasons.push("Low recent engagement");
  }
  return reasons;
}

/**
 * Returns a ranked list of at-risk students for trainers.
 * @param {object} [opts]
 * @param {number} [opts.threshold=50] - churn score cutoff
 */
function getAtRiskStudents({ threshold = 50 } = {}) {
  const profiles = getAllProfiles();
  const flagged = [];

  for (const profile of profiles) {
    const churn = predictChurn(profile);
    if (churn < threshold) continue;
    flagged.push({
      studentId: profile.studentId,
      churnScore: churn,
      riskLevel: churn >= 75 ? "high" : churn >= 50 ? "medium" : "low",
      momentum: profile.momentum,
      daysSinceActive: profile.churnRisk?.daysSinceActive ?? null,
      overallAvgScore: profile.overallAvgScore,
      weakTopics: (profile.weakTopics || []).slice(0, 3).map((t) => t.topic),
      reasons: reasonsFor(profile, churn),
      recommendedFocus: profile.recommendedFocus || [],
    });
  }

  return flagged.sort((a, b) => b.churnScore - a.churnScore);
}

/**
 * Cron entry: rebuild profiles, then broadcast at-risk students to trainers.
 */
function runAtRiskScan({ broadcast = true, threshold = 50 } = {}) {
  rebuildAllProfiles();
  const atRisk = getAtRiskStudents({ threshold });

  if (broadcast) {
    try {
      const { broadcastAtRiskAlert } = require("./eventBroadcaster");
      for (const s of atRisk) {
        broadcastAtRiskAlert(s.studentId, {
          source: "learner_profile",
          churnScore: s.churnScore,
          riskLevel: s.riskLevel,
          reasons: s.reasons,
        });
      }
    } catch (err) {
      console.error("At-risk broadcast error:", err.message);
    }
  }

  console.log(`🚨 At-risk scan: ${atRisk.length} student(s) flagged`);
  return { flagged: atRisk.length, students: atRisk };
}

module.exports = {
  getAtRiskStudents,
  runAtRiskScan,
};
