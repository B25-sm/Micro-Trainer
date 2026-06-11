// =======================================================
// 📒 UNIFIED STUDENT LEARNING LEDGER
// Every study action across MicroTrainer flows here.
// =======================================================

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const DATA_DIR = path.join(__dirname, "../data/progress");
const LEDGER_FILE = path.join(DATA_DIR, "learning-ledger.jsonl");

const TECH_ALIASES = {
  js: "javascript",
  node: "nodejs",
  "node.js": "nodejs",
  py: "python",
  ts: "typescript",
  springboot: "java",
  spring: "java",
  postgres: "sql",
  mysql: "sql",
};

const TECH_KEYWORDS = {
  javascript: ["javascript", "js ", "closure", "hoisting", "promise", "async", "event loop"],
  python: ["python", "django", "flask", "pandas", "numpy"],
  java: ["java", "spring", "jvm", "jdbc", "maven", "gradle"],
  react: ["react", "jsx", "redux", "hooks", "component"],
  nodejs: ["nodejs", "node.js", "express", "npm"],
  typescript: ["typescript", " ts ", "interface", "generics"],
  angular: ["angular", "rxjs", "ngmodule"],
  sql: ["sql", "query", "join", "database", "postgres", "mysql"],
};

const LEVEL_SCORES = {
  advanced: 85,
  intermediate: 65,
  beginner: 45,
};

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function normalizeTechnology(raw) {
  if (!raw) return "general";
  const key = String(raw).trim().toLowerCase().replace(/\s+/g, "");
  if (!key) return "general";
  if (TECH_ALIASES[key]) return TECH_ALIASES[key];
  if (TECH_KEYWORDS[key]) return key;
  return key;
}

function inferTechnologyFromText(text) {
  const lower = String(text || "").toLowerCase();
  if (!lower.trim()) return "general";

  let best = { tech: "general", hits: 0 };
  for (const [tech, keywords] of Object.entries(TECH_KEYWORDS)) {
    const hits = keywords.filter((kw) => lower.includes(kw)).length;
    if (hits > best.hits) best = { tech, hits };
  }
  return best.tech;
}

function resolveTechnology({ technology, topic, subject }) {
  if (technology) return normalizeTechnology(technology);
  if (subject) return normalizeTechnology(subject);
  return inferTechnologyFromText(topic);
}

function languageToTechnology(language) {
  const lang = String(language || "").toLowerCase();
  if (lang === "python" || lang === "py") return "python";
  if (lang === "javascript" || lang === "js") return "javascript";
  if (lang === "java") return "java";
  if (lang === "typescript" || lang === "ts") return "typescript";
  return inferTechnologyFromText(lang);
}

function levelToScore(level) {
  return LEVEL_SCORES[String(level || "").toLowerCase()] ?? 50;
}

function makeEventId(parts) {
  return crypto
    .createHash("sha1")
    .update(parts.filter(Boolean).join("|"))
    .digest("hex")
    .slice(0, 16);
}

function appendEvent(event) {
  if (!event?.studentId || event.studentId === "anonymous") return null;

  const record = {
    id: event.id || makeEventId([event.studentId, event.timestamp, event.activityType, event.topic]),
    studentId: event.studentId,
    timestamp: event.timestamp || new Date().toISOString(),
    technology: resolveTechnology(event),
    activityType: event.activityType,
    topic: event.topic || "",
    conceptId: event.conceptId || null,
    score: event.score != null ? Number(event.score) : null,
    passed: event.passed ?? null,
    source: event.source || "system",
    metadata: event.metadata || {},
  };

  try {
    fs.appendFileSync(LEDGER_FILE, `${JSON.stringify(record)}\n`, "utf8");
  } catch (err) {
    console.error("Ledger write error:", err.message);
    return null;
  }

  try {
    const { scheduleReadinessSheetsSync } = require("./technologyReadinessSheetsService");
    scheduleReadinessSheetsSync(record.studentId, record.technology);
  } catch (syncErr) {
    console.error("Readiness Sheets schedule error:", syncErr.message);
  }

  return record;
}

function readAllEvents() {
  if (!fs.existsSync(LEDGER_FILE)) return [];

  const lines = fs.readFileSync(LEDGER_FILE, "utf8").split("\n").filter(Boolean);
  const events = [];
  for (const line of lines) {
    try {
      events.push(JSON.parse(line));
    } catch {
      // skip corrupt line
    }
  }
  return events;
}

function getEventsForStudent(studentId, { limit = 200 } = {}) {
  return readAllEvents()
    .filter((e) => e.studentId === studentId)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, limit);
}

function getAllStudentIdsFromLedger() {
  return [...new Set(readAllEvents().map((e) => e.studentId).filter(Boolean))];
}

function logGuidedQuiz({
  studentId,
  technology,
  conceptId,
  topic,
  score,
  passed,
}) {
  return appendEvent({
    studentId,
    technology,
    conceptId,
    topic: topic || conceptId,
    activityType: "guided_quiz",
    score,
    passed,
    source: "guided",
    metadata: { conceptId },
  });
}

function logAskTopic({ studentId, topic }) {
  return appendEvent({
    studentId,
    topic,
    activityType: "ask_topic",
    score: null,
    source: "ask",
  });
}

function logAskQuickCheck({ studentId, topic, level, score }) {
  return appendEvent({
    studentId,
    topic,
    activityType: "ask_quick_check",
    score: score != null ? score : levelToScore(level),
    passed: (score != null ? score : levelToScore(level)) >= 60,
    source: "ask",
    metadata: { level },
  });
}

function logInterviewAnswer({
  studentId,
  subject,
  topic,
  score,
  metadata = {},
}) {
  const normalized = normalizeTechnology(subject);
  const score100 = score != null ? Math.min(100, Math.max(0, Number(score) * 10)) : null;
  return appendEvent({
    studentId,
    technology: normalized,
    topic: topic || subject,
    activityType: "interview",
    score: score100,
    source: "interview",
    metadata,
  });
}

function logCodingProblem({
  studentId,
  language,
  problemId,
  topic,
  score,
  passed,
}) {
  return appendEvent({
    studentId,
    technology: languageToTechnology(language),
    topic: topic || problemId,
    conceptId: problemId,
    activityType: "coding_problem",
    score,
    passed,
    source: "problem",
    metadata: { problemId, language },
  });
}

function logMiniAssessment({ studentId, technology, topic, score }) {
  return appendEvent({
    studentId,
    technology,
    topic,
    activityType: "mini_assessment",
    score,
    passed: score >= 60,
    source: "engagement",
  });
}

function logChatQuestion({ studentId, topic }) {
  return appendEvent({
    studentId,
    topic,
    activityType: "chat_question",
    score: null,
    source: "chat",
  });
}

module.exports = {
  appendEvent,
  readAllEvents,
  getEventsForStudent,
  getAllStudentIdsFromLedger,
  normalizeTechnology,
  inferTechnologyFromText,
  resolveTechnology,
  languageToTechnology,
  levelToScore,
  logGuidedQuiz,
  logAskTopic,
  logAskQuickCheck,
  logInterviewAnswer,
  logCodingProblem,
  logMiniAssessment,
  logChatQuestion,
};
