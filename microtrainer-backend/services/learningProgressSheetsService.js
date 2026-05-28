// =======================================================
// 📊 LEARNING PROGRESS — Google Sheets sync
// Tab: Learning_Progress (separate from interview Sheet1)
// =======================================================

const {
  getSheetsApi,
  isSheetsWriteEnabled,
  resolveCredentialsPath,
} = require("./googleSheetsAuth");
const { recordSyncAttempt } = require("./syncStatusService");

const SPREADSHEET_ID = process.env.SHEET_ID;
const SHEET_NAME = "Learning_Progress";

// A timestamp | B studentId | C technology | D conceptId | E event
// F currentConceptOrder | G overallProgress | H quizScore | I completedCount
// J completedConcepts
const HEADERS = [
  "timestamp",
  "studentId",
  "technology",
  "conceptId",
  "event",
  "currentConceptOrder",
  "overallProgress",
  "quizScore",
  "completedCount",
  "completedConcepts",
];

let sheetReadyPromise = null;

function safe(val) {
  if (val === undefined || val === null) return "";
  if (Array.isArray(val)) return val.join(", ");
  return String(val);
}

async function ensureLearningProgressSheet() {
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

/**
 * Log a learning-path event (concept completed or full snapshot).
 */
async function logLearningProgress(data) {
  if (!isSheetsWriteEnabled()) {
    console.warn(
      "⚠️ Learning progress Sheets: write skipped (credentials or SHEET_ID)"
    );
    console.warn(`   Credentials: ${resolveCredentialsPath()}`);
    recordSyncAttempt(data.studentId, "learning_progress", {
      success: false,
      reason: "sheets_disabled",
    });
    return { success: false, reason: "sheets_disabled" };
  }

  try {
    await ensureLearningProgressSheet();
    const sheets = await getSheetsApi();

    const row = [
      new Date().toISOString(),
      safe(data.studentId || "anonymous"),
      safe(data.technology),
      safe(data.conceptId),
      safe(data.event || "concept_completed"),
      safe(data.currentConceptOrder),
      safe(data.overallProgress),
      safe(data.quizScore),
      safe(data.completedCount),
      safe(data.completedConcepts),
    ];

    const range = `${SHEET_NAME}!A:J`;

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      resource: { values: [row] },
    });

    try {
      const { invalidateLearningProgressCache } = require("./readLearningProgressService");
      invalidateLearningProgressCache();
    } catch (_) {
      /* optional */
    }

    console.log(
      `✅ Learning progress synced: ${data.studentId} / ${data.technology} (${data.event})`
    );
    recordSyncAttempt(data.studentId, "learning_progress", {
      success: true,
    });

    return { success: true };
  } catch (error) {
    console.error("❌ Learning progress Sheets write failed:", error.message);
    if (error.response?.data) {
      console.error("   API:", JSON.stringify(error.response.data));
    }
    recordSyncAttempt(data.studentId, "learning_progress", {
      success: false,
      error: error.message,
    });
    return { success: false, error: error.message };
  }
}

/**
 * Push current on-disk progress for all students (trainer bulk sync).
 */
async function syncAllLocalProgressToSheets(getAllLocalProgress, enrichFn) {
  if (!isSheetsWriteEnabled()) {
    throw new Error(
      "Google Sheets is not configured. Add credentials.json and SHEET_ID to .env"
    );
  }

  const all = getAllLocalProgress();
  let synced = 0;

  for (const [studentId, technologies] of Object.entries(all)) {
    for (const [technology, progress] of Object.entries(technologies)) {
      const enriched = enrichFn
        ? enrichFn(technology, progress)
        : progress;
      const result = await logLearningProgress({
        studentId,
        technology,
        conceptId: "",
        event: "snapshot",
        currentConceptOrder: enriched.currentConceptOrder,
        overallProgress: enriched.overallProgress,
        quizScore: "",
        completedCount: enriched.completedConcepts?.length || 0,
        completedConcepts: (enriched.completedConcepts || []).join(", "),
      });
      if (result.success) synced++;
    }
  }

  return { synced, students: Object.keys(all).length };
}

module.exports = {
  SHEET_NAME,
  HEADERS,
  ensureLearningProgressSheet,
  logLearningProgress,
  syncAllLocalProgressToSheets,
};
