// =======================================================
// 🔁 LEARNING RULES ENGINE (Adaptive Loop)
// Event-driven rules that turn signals into nudges:
//  - ready_for_mock: readiness crossed "Good" -> nudge a mock interview
//  - course_after_mock_fail: weak mock verdict -> nudge a guided course
// Nudges are persisted (so the Dashboard can show them) and pushed once,
// with a cooldown so students are never spammed.
// =======================================================

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "../data/progress");
const NUDGE_FILE = path.join(DATA_DIR, "learning-nudges.json");

const COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000; // don't re-fire the same rule/tech for 3 days
const NUDGE_TTL_MS = 14 * 24 * 60 * 60 * 1000; // active nudge expires after 14 days

// Readiness gate for "ready for a mock"
const READY_MIN_SCORED_EVENTS = 3;

// Mock verdict threshold: below this average (0-10) we treat the mock as weak
const MOCK_WEAK_BELOW = 6.5;

const TECH_TO_SUBJECT = {
  react: "React",
  javascript: "JavaScript",
  nodejs: "Node.js",
  java: "Java",
  python: "Python",
  sql: "SQL",
  typescript: "TypeScript",
  angular: "Angular",
};

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadAll() {
  try {
    if (fs.existsSync(NUDGE_FILE)) {
      return JSON.parse(fs.readFileSync(NUDGE_FILE, "utf8"));
    }
  } catch (err) {
    console.error("learning-nudges load error:", err.message);
  }
  return {};
}

function saveAll(data) {
  try {
    ensureDir();
    fs.writeFileSync(NUDGE_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("learning-nudges save error:", err.message);
  }
}

function getStudentRecord(all, studentId) {
  if (!all[studentId]) all[studentId] = { active: [], history: {} };
  return all[studentId];
}

function normalizeTech(raw) {
  try {
    return require("./studentLearningLedgerService").normalizeTechnology(raw);
  } catch {
    return String(raw || "general").toLowerCase();
  }
}

function subjectForTech(tech) {
  return TECH_TO_SUBJECT[tech] || tech.charAt(0).toUpperCase() + tech.slice(1);
}

function titleCase(str) {
  return String(str || "").replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Active, non-expired nudges for a student (used by recommendationService). */
function getActiveNudges(studentId) {
  const all = loadAll();
  const rec = all[studentId];
  if (!rec) return [];
  const now = Date.now();
  const active = (rec.active || []).filter(
    (n) => now - new Date(n.createdAt).getTime() < NUDGE_TTL_MS
  );
  if (active.length !== (rec.active || []).length) {
    rec.active = active;
    saveAll(all);
  }
  return active;
}

function dismissNudge(studentId, nudgeId) {
  const all = loadAll();
  const rec = all[studentId];
  if (!rec) return;
  rec.active = (rec.active || []).filter((n) => n.id !== nudgeId);
  saveAll(all);
}

function removeNudges(rec, type, technology) {
  rec.active = (rec.active || []).filter(
    (n) => !(n.type === type && (!technology || n.technology === technology))
  );
}

function firedRecently(rec, ruleKey) {
  const last = rec.history?.[ruleKey];
  return last && Date.now() - new Date(last).getTime() < COOLDOWN_MS;
}

/**
 * Evaluate rules for an event. Best-effort and non-blocking; never throws.
 * @param {object} opts
 * @param {"activity"|"interview_completed"} opts.event
 * @param {string} opts.studentId
 * @param {string} [opts.technology]      - for "activity"
 * @param {object} [opts.record]          - for "interview_completed" (subject, averageScore)
 */
async function evaluate({ event, studentId, technology, record }) {
  if (!studentId || studentId === "anonymous") return;

  try {
    if (event === "activity") {
      await evaluateReadyForMock(studentId, technology);
    } else if (event === "interview_completed") {
      await evaluateMockOutcome(studentId, record);
    }
  } catch (err) {
    console.error("learningRules evaluate error:", err.message);
  }
}

async function evaluateReadyForMock(studentId, technology) {
  const tech = normalizeTech(technology);
  if (!tech || tech === "general") return;

  const { buildStudentReadiness } = require("./technologyReadinessService");
  const readiness = await buildStudentReadiness(studentId);
  const techData = readiness?.technologies?.[tech];
  if (!techData) return;

  const isReady =
    techData.band === "Good" &&
    techData.confidence !== "low" &&
    (techData.scoredEventCount || 0) >= READY_MIN_SCORED_EVENTS;

  if (!isReady) return;

  const all = loadAll();
  const rec = getStudentRecord(all, studentId);
  const ruleKey = `ready_for_mock:${tech}`;

  const alreadyActive = (rec.active || []).some(
    (n) => n.type === "ready_for_mock" && n.technology === tech
  );
  if (alreadyActive || firedRecently(rec, ruleKey)) return;

  const subject = subjectForTech(tech);
  const nudge = {
    id: `ready-mock-${tech}`,
    type: "ready_for_mock",
    priority: 97,
    title: `You're ready for a ${titleCase(tech)} mock interview`,
    reason: `Your ${titleCase(tech)} knowledge has reached a strong level. Prove it under interview conditions.`,
    technology: tech,
    action: { label: "Start mock interview", path: `/interview?subject=${encodeURIComponent(subject)}` },
    createdAt: new Date().toISOString(),
  };

  rec.active = [...(rec.active || []).filter((n) => n.id !== nudge.id), nudge];
  rec.history[ruleKey] = new Date().toISOString();
  saveAll(all);

  try {
    await require("./notificationOrchestratorService").notifyProgressPush(studentId, {
      title: "You're mock-ready! 🚀",
      body: `Your ${titleCase(tech)} is looking strong — take a mock interview to test it.`,
      url: nudge.action.path,
    });
  } catch (pushErr) {
    console.error("ready_for_mock push error:", pushErr.message);
  }
}

async function evaluateMockOutcome(studentId, record) {
  if (!record) return;
  const tech = normalizeTech(record.subject);
  const avg = Number(record.averageScore);
  if (Number.isNaN(avg)) return;

  const all = loadAll();
  const rec = getStudentRecord(all, studentId);

  // They took the mock — clear any "ready for mock" nudge for this tech.
  removeNudges(rec, "ready_for_mock", tech);

  if (avg >= MOCK_WEAK_BELOW) {
    // Passed — clear any lingering "take a course" nudge for this tech.
    removeNudges(rec, "course_after_mock_fail", tech);
    saveAll(all);
    return;
  }

  const ruleKey = `course_after_mock_fail:${tech}`;
  if (firedRecently(rec, ruleKey)) {
    saveAll(all);
    return;
  }

  const nudge = {
    id: `course-${tech}`,
    type: "course_after_mock_fail",
    priority: 99,
    title: `Strengthen ${titleCase(tech)} with a guided course`,
    reason: `Your recent ${titleCase(tech)} mock scored ${avg.toFixed(1)}/10. A structured course will close the gaps before your next attempt.`,
    technology: tech,
    action: { label: `Start ${titleCase(tech)} course`, path: "/learn" },
    createdAt: new Date().toISOString(),
  };

  rec.active = [...(rec.active || []).filter((n) => n.id !== nudge.id), nudge];
  rec.history[ruleKey] = new Date().toISOString();
  saveAll(all);

  try {
    await require("./notificationOrchestratorService").notifyProgressPush(studentId, {
      title: "Let's turn that mock around 💪",
      body: `Your ${titleCase(tech)} mock was a bit weak. A guided course will get you interview-ready.`,
      url: "/learn",
    });
  } catch (pushErr) {
    console.error("course_after_mock_fail push error:", pushErr.message);
  }
}

module.exports = {
  evaluate,
  getActiveNudges,
  dismissNudge,
};
