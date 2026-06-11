// =======================================================
// 🎯 TECHNOLOGY READINESS — Good / Average / Weak per tech
// Aggregates ledger + existing platform data.
// =======================================================

const fs = require("fs");
const path = require("path");
const {
  readAllEvents,
  getEventsForStudent,
  getAllStudentIdsFromLedger,
  normalizeTechnology,
} = require("./studentLearningLedgerService");
const { getStudentProfile } = require("./studentProfileStore");
const { getAllStudentsProgressRaw } = require("./learningPathService");

const BROWSER_SUBMISSIONS = path.join(__dirname, "../data/browser-submissions.jsonl");

const DEFAULT_TECHNOLOGIES = [
  "javascript",
  "python",
  "java",
  "react",
  "nodejs",
  "typescript",
  "angular",
  "sql",
];

const ACTIVITY_WEIGHTS = {
  guided_quiz: 1.0,
  ask_quick_check: 0.85,
  interview: 1.0,
  coding_problem: 0.9,
  mini_assessment: 0.8,
  ask_topic: 0.15,
  chat_question: 0.1,
};

function scoreToBand(score, eventCount) {
  if (!eventCount || eventCount === 0) return "Not assessed";
  if (score >= 75) return "Good";
  if (score >= 50) return "Average";
  return "Weak";
}

function confidenceFromCount(count) {
  if (count >= 8) return "high";
  if (count >= 3) return "medium";
  return "low";
}

function recencyMultiplier(timestamp) {
  const ageDays = (Date.now() - new Date(timestamp).getTime()) / (1000 * 60 * 60 * 24);
  if (ageDays <= 7) return 1.15;
  if (ageDays <= 30) return 1.0;
  if (ageDays <= 90) return 0.85;
  return 0.7;
}

function dedupeEvents(events) {
  const map = new Map();
  for (const event of events) {
    const id = event.id || `${event.studentId}|${event.timestamp}|${event.activityType}|${event.topic}`;
    if (!map.has(id)) map.set(id, event);
  }
  return [...map.values()];
}

async function importInterviewSignals(studentId) {
  try {
    const { getStudentHistory } = require("./readSheetsService");
    const history = await getStudentHistory(studentId);
    return history.map((row) => ({
      id: `import-interview-${row.timestamp}-${row.subject}-${row.question?.slice(0, 20)}`,
      studentId,
      timestamp: row.timestamp || new Date().toISOString(),
      technology: normalizeTechnology(row.subject),
      activityType: "interview",
      topic: row.question || row.subject,
      score: row.score != null ? Math.min(100, Number(row.score) * 10) : null,
      passed: row.score != null ? Number(row.score) >= 6 : null,
      source: "interview_import",
      metadata: { imported: true },
    }));
  } catch {
    return [];
  }
}

function importGuidedProgressSignals(studentId) {
  const all = getAllStudentsProgressRaw();
  const techMap = all[studentId] || {};
  const events = [];

  for (const [technology, progress] of Object.entries(techMap)) {
    const scores = progress.conceptScores || {};
    for (const [conceptId, score] of Object.entries(scores)) {
      events.push({
        id: `import-guided-${studentId}-${technology}-${conceptId}`,
        studentId,
        timestamp: progress.lastUpdated || new Date().toISOString(),
        technology: normalizeTechnology(technology),
        activityType: "guided_quiz",
        topic: conceptId,
        conceptId,
        score: Number(score),
        passed: Number(score) >= 60,
        source: "guided_import",
        metadata: { imported: true },
      });
    }
  }

  return events;
}

function importProblemSignals(studentId) {
  if (!fs.existsSync(BROWSER_SUBMISSIONS)) return [];

  const lines = fs.readFileSync(BROWSER_SUBMISSIONS, "utf8").split("\n").filter(Boolean);
  const events = [];

  for (const line of lines) {
    try {
      const row = JSON.parse(line);
      if (row.studentId !== studentId || row.studentId === "anonymous") continue;
      events.push({
        id: `import-problem-${row.problemId}-${row.submittedAt}`,
        studentId,
        timestamp: row.submittedAt || new Date().toISOString(),
        technology: normalizeTechnology(
          row.language === "py" ? "python" : row.language === "js" ? "javascript" : row.language
        ),
        activityType: "coding_problem",
        topic: row.problemId,
        conceptId: row.problemId,
        score: row.score != null ? Number(row.score) : row.allPassed ? 100 : 0,
        passed: Boolean(row.allPassed),
        source: "problem_import",
        metadata: { imported: true },
      });
    } catch {
      // skip
    }
  }

  return events;
}

async function collectAllSignals(studentId) {
  const ledger = readAllEvents().filter((e) => e.studentId === studentId);
  const imported = [
    ...(await importInterviewSignals(studentId)),
    ...importGuidedProgressSignals(studentId),
    ...importProblemSignals(studentId),
  ];
  return dedupeEvents([...ledger, ...imported]);
}

function aggregateTechnology(events, technology) {
  const techEvents = events.filter(
    (e) => normalizeTechnology(e.technology) === normalizeTechnology(technology)
  );

  if (techEvents.length === 0) {
    return {
      technology: normalizeTechnology(technology),
      band: "Not assessed",
      score: null,
      confidence: "none",
      eventCount: 0,
      scoredEventCount: 0,
      lastActivity: null,
      topicsStudied: [],
    };
  }

  let weightedSum = 0;
  let weightTotal = 0;
  const topics = new Set();

  for (const event of techEvents) {
    topics.add(event.topic || event.conceptId || "unknown");
    const baseWeight = ACTIVITY_WEIGHTS[event.activityType] ?? 0.5;
    const weight = baseWeight * recencyMultiplier(event.timestamp);

    if (event.score != null && !Number.isNaN(Number(event.score))) {
      weightedSum += Number(event.score) * weight;
      weightTotal += weight;
    }
  }

  const scoredEvents = techEvents.filter((e) => e.score != null);
  let score = weightTotal > 0 ? Math.round(weightedSum / weightTotal) : null;

  if (score == null && scoredEvents.length === 0) {
    score = Math.min(40, 10 + techEvents.length * 5);
  }

  const depthBonus = Math.min(10, techEvents.length);
  if (score != null) score = Math.min(100, score + depthBonus);

  const lastActivity = techEvents
    .map((e) => e.timestamp)
    .sort((a, b) => new Date(b) - new Date(a))[0];

  return {
    technology: normalizeTechnology(technology),
    band: scoreToBand(score ?? 0, techEvents.length),
    score,
    confidence: confidenceFromCount(scoredEvents.length || techEvents.length),
    eventCount: techEvents.length,
    scoredEventCount: scoredEvents.length,
    lastActivity,
    topicsStudied: [...topics].slice(0, 12),
  };
}

async function buildStudentReadiness(studentId) {
  const events = await collectAllSignals(studentId);
  const technologies = new Set(DEFAULT_TECHNOLOGIES);

  for (const event of events) {
    if (event.technology && event.technology !== "general") {
      technologies.add(normalizeTechnology(event.technology));
    }
  }

  const byTechnology = [...technologies]
    .map((tech) => aggregateTechnology(events, tech))
    .filter((t) => t.band !== "Not assessed" || t.eventCount > 0)
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

  const assessed = byTechnology.filter((t) => t.band !== "Not assessed");
  const timeline = events
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 100)
    .map((e) => ({
      id: e.id,
      timestamp: e.timestamp,
      technology: e.technology,
      activityType: e.activityType,
      topic: e.topic,
      score: e.score,
      passed: e.passed,
      source: e.source,
    }));

  const profile = getStudentProfile(studentId);

  return {
    studentId,
    name: profile?.name || null,
    displayName: profile?.displayName || profile?.name || studentId,
    initial: profile?.initial || null,
    batch: profile?.batch || null,
    summary: {
      technologiesAssessed: assessed.length,
      strongTechnologies: assessed.filter((t) => t.band === "Good").map((t) => t.technology),
      weakTechnologies: assessed.filter((t) => t.band === "Weak").map((t) => t.technology),
      totalEvents: events.length,
      lastActivity:
        timeline[0]?.timestamp ||
        assessed.map((t) => t.lastActivity).filter(Boolean).sort().reverse()[0] ||
        null,
    },
    technologies: byTechnology,
    timeline,
  };
}

async function getAllStudentsReadiness() {
  const ids = new Set(getAllStudentIdsFromLedger());

  try {
    const allProgress = getAllStudentsProgressRaw();
    Object.keys(allProgress).forEach((id) => ids.add(id));
  } catch {
    // ignore
  }

  try {
    const { getAllRows } = require("./readSheetsService");
    const rows = await getAllRows();
    rows.forEach((r) => {
      if (r.studentId) ids.add(r.studentId);
    });
  } catch {
    // ignore
  }

  const students = [];
  for (const studentId of ids) {
    const readiness = await buildStudentReadiness(studentId);
    if (readiness.summary.totalEvents === 0) continue;
    students.push(readiness);
  }

  students.sort((a, b) => {
    const aGood = a.technologies.filter((t) => t.band === "Good").length;
    const bGood = b.technologies.filter((t) => t.band === "Good").length;
    return bGood - aGood;
  });

  return {
    technologies: DEFAULT_TECHNOLOGIES,
    students,
    count: students.length,
  };
}

module.exports = {
  buildStudentReadiness,
  getAllStudentsReadiness,
  collectAllSignals,
  scoreToBand,
  DEFAULT_TECHNOLOGIES,
};
