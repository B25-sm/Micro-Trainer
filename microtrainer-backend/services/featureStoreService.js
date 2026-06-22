// =======================================================
// 🧪 FEATURE STORE SERVICE (Phase 5 — ML-ready scaffolding)
// Flattens learner profiles into numeric feature vectors and exports
// them for offline model training. Also provides a pluggable scorer
// interface so a trained model can later re-rank recommendations and
// at-risk predictions WITHOUT changing any callers.
//
// We deliberately ship a rule-based default scorer now — at batch scale
// it outperforms an under-trained model and stays fully explainable.
// =======================================================

const fs = require("fs");
const path = require("path");
const { getAllProfiles } = require("./learnerProfileService");
const { registerScorer } = require("./recommendationService");

const DATA_DIR = path.join(__dirname, "../data/progress");
const FEATURE_FILE = path.join(DATA_DIR, "feature-store.jsonl");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

/** Convert a profile into a flat numeric feature vector for ML. */
function profileToFeatures(profile) {
  const techs = Object.values(profile.technologies || {});
  const decliningTechs = techs.filter((t) => t.trend === "declining").length;
  const weakTechs = techs.filter((t) => t.mastery === "weak").length;

  return {
    studentId: profile.studentId,
    capturedAt: new Date().toISOString(),
    features: {
      overallAvgScore: profile.overallAvgScore ?? 0,
      momentumScore: profile.momentumScore ?? 0,
      churnScore: profile.churnRisk?.score ?? 0,
      daysSinceActive: profile.churnRisk?.daysSinceActive ?? 999,
      activeDaysLast14: profile.studyPattern?.activeDaysLast14 ?? 0,
      totalActiveDays: profile.studyPattern?.totalActiveDays ?? 0,
      scoredEvents: profile.scoredEvents ?? 0,
      behaviorEvents: profile.behaviorEvents ?? 0,
      abandonRate: profile.engagement?.abandonRate ?? 0,
      weakTopicCount: (profile.weakTopics || []).length,
      strongTopicCount: (profile.strongTopics || []).length,
      techCount: techs.length,
      decliningTechCount: decliningTechs,
      weakTechCount: weakTechs,
    },
  };
}

/**
 * Export every student's feature vector to JSONL for offline training.
 * Each line is a self-contained JSON object.
 */
function exportFeatureMatrix() {
  const profiles = getAllProfiles();
  const lines = profiles.map((p) => JSON.stringify(profileToFeatures(p)));
  try {
    fs.writeFileSync(FEATURE_FILE, lines.join("\n") + (lines.length ? "\n" : ""));
    console.log(`🧪 Feature store exported: ${lines.length} rows`);
  } catch (err) {
    console.error("Feature store export error:", err.message);
  }
  return { rows: lines.length, file: FEATURE_FILE };
}

/**
 * Default churn scorer (rule-based). Returns 0..100 risk.
 * Swap this with a trained model later via setChurnModel().
 */
let churnModel = function defaultChurnModel(features) {
  let risk = features.churnScore || 0;
  if (features.momentumScore < 0) risk += 15;
  if (features.abandonRate > 0.4) risk += 10;
  if (features.activeDaysLast14 <= 1) risk += 10;
  return Math.max(0, Math.min(100, Math.round(risk)));
};

function setChurnModel(fn) {
  if (typeof fn === "function") churnModel = fn;
}

function predictChurn(profile) {
  return churnModel(profileToFeatures(profile).features);
}

/**
 * Register a recommendation re-ranker. By default we DON'T override the
 * rule-based ranking (returns null = keep rules). A trained model can be
 * dropped in here later.
 */
function initPluggableScorer() {
  registerScorer((profile, ranked) => {
    // Default: trust the explainable rules. Hook left intentionally inert.
    return ranked;
  });
}

module.exports = {
  profileToFeatures,
  exportFeatureMatrix,
  predictChurn,
  setChurnModel,
  initPluggableScorer,
};
