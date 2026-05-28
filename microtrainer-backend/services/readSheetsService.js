// =======================================================
// 🔹 READ SHEETS SERVICE — Google Sheets + dev fallback
// =======================================================
// Column layout (matches sheetsService.logInterview):
// A timestamp | B studentId | C question | D answer | E subject
// F score | G communication | H technical | I strengths | J mistakes
// K improvement | L verdict

const {
  getSheetsApi,
  isSheetsWriteEnabled,
} = require("./googleSheetsAuth");

const SPREADSHEET_ID = process.env.SHEET_ID;
const SHEET_NAME = "Sheet1";
const DATA_RANGE = `${SHEET_NAME}!A2:L`;

let rowsCache = null;
let cacheExpiresAt = 0;
const CACHE_TTL_MS = 60_000;

function parseScore(val) {
  if (val === undefined || val === null || val === "") return 0;
  const n = typeof val === "string" ? parseFloat(val) : Number(val);
  return Number.isFinite(n) ? n : 0;
}

function parseRow(cells) {
  if (!cells || !cells.length) return null;

  const [
    timestamp,
    studentId,
    question,
    answer,
    subject,
    score,
    communication,
    technical,
    strengths,
    mistakes,
    improvement,
    verdict,
  ] = cells;

  if (!studentId && !question) return null;

  return {
    timestamp: timestamp || new Date().toISOString(),
    studentId: String(studentId || "anonymous").trim(),
    question: question || "",
    answer: answer || "",
    subject: subject || "General",
    score: parseScore(score),
    communication: communication || "",
    technical: technical || "",
    strengths: strengths || "",
    mistakes: mistakes || "",
    improvement: improvement || "",
    verdict: verdict || "",
  };
}

async function fetchRowsFromSheets() {
  if (!isSheetsWriteEnabled()) {
    return null;
  }

  const sheets = await getSheetsApi();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: DATA_RANGE,
  });

  const values = response.data.values || [];
  return values.map(parseRow).filter(Boolean);
}

async function getAllRows({ bypassCache = false } = {}) {
  const now = Date.now();

  if (!bypassCache && rowsCache && now < cacheExpiresAt) {
    return rowsCache;
  }

  try {
    const sheetRows = await fetchRowsFromSheets();
    if (sheetRows) {
      rowsCache = sheetRows;
      cacheExpiresAt = now + CACHE_TTL_MS;
      return sheetRows;
    }
  } catch (err) {
    console.error("Google Sheets read failed:", err.message);
    if (rowsCache) {
      return rowsCache;
    }
  }

  return [];
}

function normalizeScore(val) {
  return parseScore(val);
}

function getTrend(history = []) {
  if (history.length < 2) return "stable";

  const recent = history.slice(-5);
  const scores = recent.map((h) => normalizeScore(h.score));
  const first = scores[0];
  const last = scores[scores.length - 1];

  if (last > first) return "improving";
  if (last < first) return "declining";
  return "stable";
}

function getConsistency(history = []) {
  if (!history.length) return 0;

  const scores = history.map((h) => normalizeScore(h.score));
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  const variance =
    scores.reduce((sum, s) => sum + Math.pow(s - avg, 2), 0) / scores.length;

  return (10 - Math.sqrt(variance)).toFixed(2);
}

function getLevel(avgScore) {
  if (avgScore >= 8) return "Advanced";
  if (avgScore >= 6) return "Intermediate";
  if (avgScore >= 4) return "Beginner";
  return "Weak";
}

function aggregateReportFromHistory(studentId, history) {
  if (!history.length) {
    return {
      studentId,
      averageScore: 0,
      communicationScore: 0,
      technicalScore: 0,
      weakConcepts: [],
      strongConcepts: [],
      totalQuestions: 0,
    };
  }

  const scores = history.map((h) => normalizeScore(h.score));
  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;

  const commMap = { Good: 10, Average: 7, Weak: 4 };
  const techMap = { Good: 10, Average: 7, Weak: 4 };

  const commScores = history
    .map((h) => commMap[h.communication] ?? normalizeScore(h.score))
    .filter((s) => s > 0);
  const techScores = history
    .map((h) => techMap[h.technical] ?? normalizeScore(h.score))
    .filter((s) => s > 0);

  const weakFromMistakes = history
    .flatMap((h) => (h.mistakes ? String(h.mistakes).split(/[,;]/).map((s) => s.trim()) : []))
    .filter(Boolean)
    .slice(0, 5);

  const strongFromStrengths = history
    .flatMap((h) => (h.strengths ? String(h.strengths).split(/[,;]/).map((s) => s.trim()) : []))
    .filter(Boolean)
    .slice(0, 5);

  return {
    studentId,
    averageScore: parseFloat(avgScore.toFixed(2)),
    communicationScore: commScores.length
      ? parseFloat((commScores.reduce((a, b) => a + b, 0) / commScores.length).toFixed(2))
      : parseFloat(avgScore.toFixed(2)),
    technicalScore: techScores.length
      ? parseFloat((techScores.reduce((a, b) => a + b, 0) / techScores.length).toFixed(2))
      : parseFloat(avgScore.toFixed(2)),
    weakConcepts: [...new Set(weakFromMistakes)],
    strongConcepts: [...new Set(strongFromStrengths)],
    totalQuestions: history.length,
  };
}

async function getStudentHistory(studentId) {
  const rows = await getAllRows();
  return rows
    .filter((r) => r.studentId === studentId)
    .map((r) => ({
      question: r.question,
      answer: r.answer,
      subject: r.subject,
      score: r.score,
      communication: r.communication,
      technical: r.technical,
      strengths: r.strengths,
      mistakes: r.mistakes,
      improvement: r.improvement,
      verdict: r.verdict,
      timestamp: r.timestamp,
    }))
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}

async function getStudentReport(studentId) {
  const history = await getStudentHistory(studentId);
  return aggregateReportFromHistory(studentId, history);
}

async function getAllStudentsHistory() {
  const rows = await getAllRows();
  const map = {};

  rows.forEach((row) => {
    if (!map[row.studentId]) {
      map[row.studentId] = { scores: [], count: 0 };
    }
    map[row.studentId].scores.push(row.score);
    map[row.studentId].count += 1;
  });

  return Object.keys(map).map((studentId) => {
    const { scores, count } = map[studentId];
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    return {
      studentId,
      avgScore: parseFloat(avg.toFixed(2)),
      totalQuestions: count,
    };
  });
}

async function getStudentMemory(studentId) {
  try {
    const report = await getStudentReport(studentId);
    const history = await getStudentHistory(studentId);

    if (!history.length) {
      return null;
    }

    const avgScore = normalizeScore(report.averageScore);
    const communication = normalizeScore(report.communicationScore);
    const technical = normalizeScore(report.technicalScore);
    const trend = getTrend(history);
    const consistency = getConsistency(history);
    const level = getLevel(avgScore);

    return {
      avgScore,
      communication,
      technical,
      weakConcepts: report.weakConcepts || [],
      strongConcepts: report.strongConcepts || [],
      trend,
      consistency,
      level,
      totalAttempts: history.length,
      lastUpdated: new Date().toISOString(),
    };
  } catch (err) {
    console.error("Memory Error:", err.message);
    return null;
  }
}

function invalidateRowsCache() {
  rowsCache = null;
  cacheExpiresAt = 0;
}

module.exports = {
  getAllRows,
  getStudentMemory,
  getStudentReport,
  getStudentHistory,
  getAllStudentsHistory,
  invalidateRowsCache,
};
