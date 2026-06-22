// =======================================================
// 🧠 LEARNER PROFILE SERVICE (Phase 2)
// Builds a per-student behavioral + performance profile from the
// unified learning ledger and engagement data. This is the "intelligence"
// layer that powers recommendations and at-risk detection.
//
// First-party only. No cross-app tracking. Fully explainable (no black box).
// =======================================================

const fs = require("fs");
const path = require("path");
const {
  readAllEvents,
  getAllStudentIdsFromLedger,
} = require("./studentLearningLedgerService");

const DATA_DIR = path.join(__dirname, "../data/progress");
const PROFILE_FILE = path.join(DATA_DIR, "learner-profiles.json");

const PROFILE_TTL_MS = 6 * 60 * 60 * 1000; // lazy-rebuild if older than 6h
const DAY_MS = 24 * 60 * 60 * 1000;

// Activity types that carry a graded outcome
const SCORED_TYPES = new Set([
  "guided_quiz",
  "ask_quick_check",
  "interview",
  "coding_problem",
  "mini_assessment",
]);

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadProfiles() {
  try {
    if (!fs.existsSync(PROFILE_FILE)) return {};
    return JSON.parse(fs.readFileSync(PROFILE_FILE, "utf8")) || {};
  } catch (err) {
    console.error("Learner profiles load error:", err.message);
    return {};
  }
}

function saveProfiles(profiles) {
  try {
    fs.writeFileSync(PROFILE_FILE, JSON.stringify(profiles, null, 2));
  } catch (err) {
    console.error("Learner profiles save error:", err.message);
  }
}

function mean(nums) {
  if (!nums.length) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function round(n, d = 1) {
  if (n == null || Number.isNaN(n)) return null;
  const f = 10 ** d;
  return Math.round(n * f) / f;
}

// =======================================================
// Core: build one student's profile from their events
// =======================================================
function buildProfileFromEvents(studentId, events) {
  const now = Date.now();
  const sorted = [...events].sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
  );

  const scored = sorted.filter(
    (e) => SCORED_TYPES.has(e.activityType) && e.score != null
  );
  const behavior = sorted.filter((e) => e.source === "behavior");

  // ---- Per-technology aggregates ----
  const techMap = {};
  for (const e of scored) {
    const tech = e.technology || "general";
    if (!techMap[tech]) techMap[tech] = { scores: [], lastTs: 0 };
    techMap[tech].scores.push(Number(e.score));
    const ts = new Date(e.timestamp).getTime();
    if (ts > techMap[tech].lastTs) techMap[tech].lastTs = ts;
  }

  const technologies = {};
  for (const [tech, data] of Object.entries(techMap)) {
    const avg = mean(data.scores);
    const recent = data.scores.slice(-3);
    const earlier = data.scores.slice(0, -3);
    const recentAvg = mean(recent);
    const earlierAvg = mean(earlier);
    let trend = "steady";
    if (recentAvg != null && earlierAvg != null) {
      if (recentAvg - earlierAvg >= 8) trend = "improving";
      else if (earlierAvg - recentAvg >= 8) trend = "declining";
    } else if (data.scores.length <= 2) {
      trend = "new";
    }
    technologies[tech] = {
      attempts: data.scores.length,
      avgScore: round(avg),
      lastScore: round(data.scores[data.scores.length - 1]),
      mastery:
        avg >= 80 ? "strong" : avg >= 60 ? "developing" : "weak",
      trend,
      lastActiveDaysAgo: data.lastTs
        ? Math.floor((now - data.lastTs) / DAY_MS)
        : null,
    };
  }

  // ---- Per-topic weak/strong (group by topic) ----
  const topicMap = {};
  for (const e of scored) {
    const topic = (e.topic || "").trim();
    if (!topic) continue;
    const key = topic.toLowerCase();
    if (!topicMap[key]) {
      topicMap[key] = { topic, technology: e.technology, scores: [] };
    }
    topicMap[key].scores.push(Number(e.score));
  }
  const topics = Object.values(topicMap).map((t) => ({
    topic: t.topic,
    technology: t.technology,
    attempts: t.scores.length,
    avgScore: round(mean(t.scores)),
  }));
  const weakTopics = topics
    .filter((t) => t.avgScore != null && t.avgScore < 60)
    .sort((a, b) => a.avgScore - b.avgScore)
    .slice(0, 8);
  const strongTopics = topics
    .filter((t) => t.avgScore != null && t.avgScore >= 80)
    .sort((a, b) => b.avgScore - a.avgScore)
    .slice(0, 8);

  // ---- Study pattern (from ALL events, including behavior) ----
  const hourCounts = new Array(24).fill(0);
  const activeDays = new Set();
  for (const e of sorted) {
    const d = new Date(e.timestamp);
    hourCounts[d.getUTCHours()] += 1;
    activeDays.add(d.toISOString().split("T")[0]);
  }
  const maxHourCount = Math.max(...hourCounts);
  const preferredHours = maxHourCount
    ? hourCounts
        .map((c, h) => ({ h, c }))
        .filter((x) => x.c >= maxHourCount * 0.6)
        .map((x) => x.h)
    : [];
  const last14 = new Set(
    [...activeDays].filter(
      (day) => now - new Date(day).getTime() <= 14 * DAY_MS
    )
  );

  // ---- Momentum (recent vs earlier overall scores) ----
  const allScores = scored.map((e) => Number(e.score));
  const recentScores = scored
    .filter((e) => now - new Date(e.timestamp).getTime() <= 7 * DAY_MS)
    .map((e) => Number(e.score));
  const olderScores = scored
    .filter((e) => now - new Date(e.timestamp).getTime() > 7 * DAY_MS)
    .map((e) => Number(e.score));
  const recentAvg = mean(recentScores);
  const olderAvg = mean(olderScores);

  let momentum = "new";
  let momentumScore = 0;
  if (recentAvg != null && olderAvg != null) {
    momentumScore = round(recentAvg - olderAvg);
    if (momentumScore >= 5) momentum = "improving";
    else if (momentumScore <= -5) momentum = "declining";
    else momentum = "steady";
  } else if (allScores.length > 0) {
    momentum = "steady";
  }

  // ---- Churn risk (recency of ANY activity) ----
  const lastEventTs = sorted.length
    ? new Date(sorted[sorted.length - 1].timestamp).getTime()
    : 0;
  const daysSinceActive = lastEventTs
    ? Math.floor((now - lastEventTs) / DAY_MS)
    : null;

  let churnLevel = "low";
  let churnScore = 0;
  if (daysSinceActive == null) {
    churnLevel = "unknown";
    churnScore = 50;
  } else {
    churnScore = Math.min(100, daysSinceActive * 12);
    if (daysSinceActive >= 7) churnLevel = "high";
    else if (daysSinceActive >= 3) churnLevel = "medium";
    else churnLevel = "low";
  }
  // Declining momentum bumps risk
  if (momentum === "declining") churnScore = Math.min(100, churnScore + 20);

  // ---- Abandonment signal (behavior) ----
  const abandoned = behavior.filter(
    (e) => e.activityType === "topic_abandoned"
  ).length;
  const opened = behavior.filter(
    (e) => e.activityType === "topic_opened"
  ).length;
  const abandonRate = opened > 0 ? round(abandoned / opened, 2) : null;

  // ---- Recommended focus (weak techs + declining techs) ----
  const recommendedFocus = Object.entries(technologies)
    .filter(([, t]) => t.mastery === "weak" || t.trend === "declining")
    .sort((a, b) => (a[1].avgScore ?? 100) - (b[1].avgScore ?? 100))
    .map(([tech]) => tech)
    .slice(0, 3);

  return {
    studentId,
    updatedAt: new Date().toISOString(),
    totalEvents: sorted.length,
    scoredEvents: scored.length,
    behaviorEvents: behavior.length,
    technologies,
    weakTopics,
    strongTopics,
    studyPattern: {
      preferredHoursUTC: preferredHours,
      mostActiveHourUTC: maxHourCount ? hourCounts.indexOf(maxHourCount) : null,
      activeDaysLast14: last14.size,
      totalActiveDays: activeDays.size,
    },
    momentum,
    momentumScore,
    overallAvgScore: round(mean(allScores)),
    churnRisk: { level: churnLevel, score: round(churnScore), daysSinceActive },
    engagement: { abandonRate, topicsOpened: opened, topicsAbandoned: abandoned },
    recommendedFocus,
  };
}

// =======================================================
// Public API
// =======================================================
function rebuildProfile(studentId, allEvents = null) {
  const events = (allEvents || readAllEvents()).filter(
    (e) => e.studentId === studentId
  );
  const profile = buildProfileFromEvents(studentId, events);
  const profiles = loadProfiles();
  profiles[studentId] = profile;
  saveProfiles(profiles);
  return profile;
}

function rebuildAllProfiles() {
  const allEvents = readAllEvents();
  const ids = getAllStudentIdsFromLedger();
  const profiles = loadProfiles();
  let count = 0;
  for (const id of ids) {
    const events = allEvents.filter((e) => e.studentId === id);
    profiles[id] = buildProfileFromEvents(id, events);
    count += 1;
  }
  saveProfiles(profiles);
  console.log(`🧠 Learner profiles rebuilt: ${count} students`);
  return { studentsProcessed: count };
}

function getLearnerProfile(studentId, { rebuildIfStale = true } = {}) {
  const profiles = loadProfiles();
  const existing = profiles[studentId];
  if (
    existing &&
    rebuildIfStale &&
    Date.now() - new Date(existing.updatedAt).getTime() < PROFILE_TTL_MS
  ) {
    return existing;
  }
  // Lazy rebuild (covers first access and stale data)
  return rebuildProfile(studentId);
}

function getAllProfiles() {
  return Object.values(loadProfiles());
}

module.exports = {
  rebuildProfile,
  rebuildAllProfiles,
  getLearnerProfile,
  getAllProfiles,
  buildProfileFromEvents,
};
