// =======================================================
// 📖 READ LEARNING PROGRESS — Sheets + parse
// =======================================================

const {
  getSheetsApi,
  isSheetsWriteEnabled,
} = require("./googleSheetsAuth");
const { SHEET_NAME } = require("./learningProgressSheetsService");

const SPREADSHEET_ID = process.env.SHEET_ID;
const DATA_RANGE = `${SHEET_NAME}!A2:J`;

let rowsCache = null;
let cacheExpiresAt = 0;
const CACHE_TTL_MS = 60_000;

function parseScore(val) {
  if (val === undefined || val === null || val === "") return null;
  const n = typeof val === "string" ? parseFloat(val) : Number(val);
  return Number.isFinite(n) ? n : null;
}

function parseRow(cells) {
  if (!cells?.length) return null;

  const [
    timestamp,
    studentId,
    technology,
    conceptId,
    event,
    currentConceptOrder,
    overallProgress,
    quizScore,
    completedCount,
    completedConcepts,
  ] = cells;

  if (!studentId && !technology) return null;

  const completedList = completedConcepts
    ? String(completedConcepts)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  return {
    timestamp: timestamp || new Date().toISOString(),
    studentId: String(studentId || "anonymous").trim(),
    technology: String(technology || "").trim().toLowerCase(),
    conceptId: conceptId || "",
    event: event || "concept_completed",
    currentConceptOrder: parseInt(currentConceptOrder, 10) || 1,
    overallProgress: parseScore(overallProgress) ?? 0,
    quizScore: parseScore(quizScore),
    completedCount: parseInt(completedCount, 10) || completedList.length,
    completedConcepts: completedList,
  };
}

async function fetchRowsFromSheets() {
  if (!isSheetsWriteEnabled()) {
    return [];
  }

  try {
    const sheets = await getSheetsApi();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: DATA_RANGE,
    });

    const values = response.data.values || [];
    return values.map(parseRow).filter(Boolean);
  } catch (err) {
    if (err.message?.includes("Unable to parse range")) {
      return [];
    }
    console.error("readLearningProgressService:", err.message);
    return [];
  }
}

async function getAllLearningProgressRows({ bypassCache = false } = {}) {
  const now = Date.now();
  if (!bypassCache && rowsCache && now < cacheExpiresAt) {
    return rowsCache;
  }

  const rows = await fetchRowsFromSheets();
  rowsCache = rows;
  cacheExpiresAt = now + CACHE_TTL_MS;
  return rows;
}

function invalidateLearningProgressCache() {
  rowsCache = null;
  cacheExpiresAt = 0;
}

/**
 * Latest row per student + technology (by timestamp).
 */
async function getLatestProgressByStudentTechnology() {
  const rows = await getAllLearningProgressRows();
  const map = {};

  rows.forEach((row) => {
    const key = `${row.studentId}::${row.technology}`;
    const existing = map[key];
    if (
      !existing ||
      new Date(row.timestamp).getTime() > new Date(existing.timestamp).getTime()
    ) {
      map[key] = row;
    }
  });

  return map;
}

module.exports = {
  getAllLearningProgressRows,
  getLatestProgressByStudentTechnology,
  invalidateLearningProgressCache,
};
