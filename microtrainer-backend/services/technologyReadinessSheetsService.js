// =======================================================
// 📊 TECHNOLOGY READINESS — Google Sheets sync
// Tab: Technology_Readiness
// =======================================================

const {
  getSheetsApi,
  isSheetsWriteEnabled,
  resolveCredentialsPath,
} = require("./googleSheetsAuth");
const { recordSyncAttempt } = require("./syncStatusService");
const { getStudentProfile } = require("./studentProfileStore");
const { buildStudentReadiness } = require("./technologyReadinessService");

const SPREADSHEET_ID = process.env.SHEET_ID;
const SHEET_NAME = "Technology_Readiness";

// A timestamp | B studentId | C displayName | D technology | E band | F score
// G confidence | H eventCount | I lastActivity | J syncType
const HEADERS = [
  "timestamp",
  "studentId",
  "displayName",
  "technology",
  "band",
  "score",
  "confidence",
  "eventCount",
  "lastActivity",
  "syncType",
];

let sheetReadyPromise = null;

function safe(val) {
  if (val === undefined || val === null) return "";
  if (Array.isArray(val)) return val.join(", ");
  return String(val);
}

async function ensureTechnologyReadinessSheet() {
  if (!sheetReadyPromise) {
    sheetReadyPromise = (async () => {
      if (!isSheetsWriteEnabled()) return false;

      const sheets = await getSheetsApi();
      const spreadsheet = await sheets.spreadsheets.get({
        spreadsheetId: SPREADSHEET_ID,
      });

      const existing = spreadsheet.data.sheets?.find(
        (s) => s.properties?.title === SHEET_NAME
      );

      if (!existing) {
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId: SPREADSHEET_ID,
          resource: {
            requests: [
              {
                addSheet: {
                  properties: {
                    title: SHEET_NAME,
                    gridProperties: { frozenRowCount: 1 },
                  },
                },
              },
            ],
          },
        });

        await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: `${SHEET_NAME}!A1:J1`,
          valueInputOption: "USER_ENTERED",
          resource: { values: [HEADERS] },
        });

        console.log(`✅ Google Sheets: created tab "${SHEET_NAME}"`);
      }

      return true;
    })().catch((err) => {
      sheetReadyPromise = null;
      throw err;
    });
  }

  return sheetReadyPromise;
}

async function appendReadinessRow({
  studentId,
  displayName,
  technology,
  band,
  score,
  confidence,
  eventCount,
  lastActivity,
  syncType = "auto",
}) {
  if (!isSheetsWriteEnabled()) {
    recordSyncAttempt(studentId, "technology_readiness", {
      success: false,
      reason: "sheets_disabled",
    });
    return { success: false, reason: "sheets_disabled" };
  }

  try {
    await ensureTechnologyReadinessSheet();
    const sheets = await getSheetsApi();

    const row = [
      new Date().toISOString(),
      safe(studentId),
      safe(displayName),
      safe(technology),
      safe(band),
      safe(score),
      safe(confidence),
      safe(eventCount),
      safe(lastActivity),
      safe(syncType),
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:J`,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      resource: { values: [row] },
    });

    recordSyncAttempt(studentId, "technology_readiness", { success: true });
    return { success: true };
  } catch (error) {
    console.error("❌ Technology readiness Sheets write failed:", error.message);
    recordSyncAttempt(studentId, "technology_readiness", {
      success: false,
      error: error.message,
    });
    return { success: false, error: error.message };
  }
}

function resolveDisplayName(studentId) {
  const profile = getStudentProfile(studentId);
  return profile?.displayName || profile?.name || studentId;
}

/**
 * After a learning event, push updated band/score for one technology.
 */
async function syncStudentTechnologyToSheets(studentId, technology) {
  if (!studentId || studentId === "anonymous") {
    return { success: false, reason: "invalid_student" };
  }

  if (!isSheetsWriteEnabled()) {
    return { success: false, reason: "sheets_disabled" };
  }

  const readiness = await buildStudentReadiness(studentId);
  const techEntry = (readiness.technologies || []).find(
    (t) => t.technology === technology
  );

  if (!techEntry || techEntry.band === "Not assessed") {
    return { success: false, reason: "not_assessed" };
  }

  return appendReadinessRow({
    studentId,
    displayName: readiness.displayName || resolveDisplayName(studentId),
    technology: techEntry.technology,
    band: techEntry.band,
    score: techEntry.score,
    confidence: techEntry.confidence,
    eventCount: techEntry.eventCount,
    lastActivity: techEntry.lastActivity,
    syncType: "auto",
  });
}

/**
 * Push all assessed technologies for one student.
 */
async function syncStudentReadinessToSheets(studentId) {
  if (!studentId || studentId === "anonymous") {
    return { success: false, synced: 0 };
  }

  const readiness = await buildStudentReadiness(studentId);
  const assessed = (readiness.technologies || []).filter(
    (t) => t.band !== "Not assessed"
  );

  let synced = 0;
  for (const tech of assessed) {
    const result = await appendReadinessRow({
      studentId,
      displayName: readiness.displayName || resolveDisplayName(studentId),
      technology: tech.technology,
      band: tech.band,
      score: tech.score,
      confidence: tech.confidence,
      eventCount: tech.eventCount,
      lastActivity: tech.lastActivity,
      syncType: "student_bulk",
    });
    if (result.success) synced++;
  }

  return { success: synced > 0, synced, studentId };
}

/**
 * Trainer bulk sync — all students with any learning activity.
 */
async function syncAllReadinessToSheets() {
  if (!isSheetsWriteEnabled()) {
    throw new Error(
      "Google Sheets is not configured. Add credentials.json and SHEET_ID to .env"
    );
  }

  const { getAllStudentsReadiness } = require("./technologyReadinessService");
  const { students } = await getAllStudentsReadiness();

  let synced = 0;
  for (const student of students) {
    const assessed = (student.technologies || []).filter(
      (t) => t.band !== "Not assessed"
    );
    for (const tech of assessed) {
      const result = await appendReadinessRow({
        studentId: student.studentId,
        displayName: student.displayName || resolveDisplayName(student.studentId),
        technology: tech.technology,
        band: tech.band,
        score: tech.score,
        confidence: tech.confidence,
        eventCount: tech.eventCount,
        lastActivity: tech.lastActivity,
        syncType: "trainer_bulk",
      });
      if (result.success) synced++;
    }
  }

  return {
    students: students.length,
    synced,
  };
}

function scheduleReadinessSheetsSync(studentId, technology) {
  if (!studentId || studentId === "anonymous" || !technology || technology === "general") {
    return;
  }

  setImmediate(() => {
    syncStudentTechnologyToSheets(studentId, technology).catch((err) => {
      console.error("Technology readiness Sheets sync error:", err.message);
    });
  });
}

module.exports = {
  SHEET_NAME,
  HEADERS,
  ensureTechnologyReadinessSheet,
  appendReadinessRow,
  syncStudentTechnologyToSheets,
  syncStudentReadinessToSheets,
  syncAllReadinessToSheets,
  scheduleReadinessSheetsSync,
};
