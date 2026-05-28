// =======================================================
// 📊 EXPORT STUDENT STATUS TO GOOGLE SHEETS
// Creates a summary sheet with current student rankings
// =======================================================

const { getSheetsApi, isSheetsWriteEnabled } = require("./googleSheetsAuth");
const { getLeaderboard } = require("./rankingService");
const { getStudentHistory } = require("./readSheetsService");
const { aggregateStudent } = require("./trackingService");
const { getStudentMemory } = require("./memoryService");

const SPREADSHEET_ID = process.env.SHEET_ID;
const SUMMARY_SHEET_NAME = "Student_Status_Summary";

function assertSheetsReady() {
  if (!isSheetsWriteEnabled()) {
    throw new Error(
      "Google Sheets is not configured. Add credentials.json and SHEET_ID to .env"
    );
  }
}

// =======================================================
// 🔹 CREATE OR CLEAR SUMMARY SHEET
// =======================================================
async function ensureSummarySheet() {
  try {
    assertSheetsReady();
    const sheets = await getSheetsApi();

    // Get all sheets
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });

    const sheetExists = spreadsheet.data.sheets.some(
      (sheet) => sheet.properties.title === SUMMARY_SHEET_NAME
    );

    if (!sheetExists) {
      // Create new sheet
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        resource: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: SUMMARY_SHEET_NAME,
                  gridProperties: {
                    frozenRowCount: 1, // Freeze header row
                  },
                },
              },
            },
          ],
        },
      });
      console.log(`✅ Created new sheet: ${SUMMARY_SHEET_NAME}`);
    } else {
      // Clear existing data (keep headers)
      await sheets.spreadsheets.values.clear({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SUMMARY_SHEET_NAME}!A2:Z`,
      });
      console.log(`✅ Cleared existing data in: ${SUMMARY_SHEET_NAME}`);
    }

    return true;
  } catch (error) {
    console.error("❌ Error ensuring summary sheet:", error.message);
    throw error;
  }
}

// =======================================================
// 🔹 EXPORT STUDENT STATUS
// =======================================================
async function exportStudentStatus() {
  try {
    console.log("📊 Starting student status export...");

    // Ensure summary sheet exists
    await ensureSummarySheet();

    // Get leaderboard data
    const leaderboard = await getLeaderboard();

    if (!leaderboard || leaderboard.length === 0) {
      console.log("⚠️ No student data to export");
      return {
        success: false,
        message: "No student data available",
      };
    }

    // Build rows with enhanced data
    const rows = [];

    // Header row
    rows.push([
      "Rank",
      "Student ID",
      "Fullstack Score",
      "Total Questions",
      "Avg Communication",
      "Avg Technical",
      "Learning Level",
      "Trend",
      "Consistency",
      "Strong Concepts",
      "Weak Areas",
      "React Score",
      "Java Score",
      "Python Score",
      "JavaScript Score",
      "Node.js Score",
      "Last Updated",
    ]);

    // Data rows
    for (const student of leaderboard) {
      try {
        // Get detailed analytics
        const history = await getStudentHistory(student.studentId);
        const analytics = aggregateStudent(history);
        const memory = await getStudentMemory(student.studentId);

        rows.push([
          student.rank,
          student.studentId,
          student.fullstackScore,
          analytics?.totalQuestions || 0,
          analytics?.communicationScore || "N/A",
          analytics?.technicalScore || "N/A",
          memory?.level || "Unknown",
          memory?.trend || "N/A",
          memory?.consistency || "N/A",
          memory?.strongConcepts?.join(", ") || "None",
          analytics?.weakAreas?.join(", ") || "None",
          student.subjects?.react || "N/A",
          student.subjects?.java || "N/A",
          student.subjects?.python || "N/A",
          student.subjects?.javascript || "N/A",
          student.subjects?.nodejs || "N/A",
          new Date().toISOString(),
        ]);
      } catch (err) {
        console.error(`⚠️ Error processing student ${student.studentId}:`, err.message);
        // Add basic row even if detailed data fails
        rows.push([
          student.rank,
          student.studentId,
          student.fullstackScore,
          "N/A",
          "N/A",
          "N/A",
          "Unknown",
          "N/A",
          "N/A",
          "None",
          "None",
          student.subjects?.react || "N/A",
          student.subjects?.java || "N/A",
          student.subjects?.python || "N/A",
          student.subjects?.javascript || "N/A",
          student.subjects?.nodejs || "N/A",
          new Date().toISOString(),
        ]);
      }
    }

    const sheets = await getSheetsApi();

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SUMMARY_SHEET_NAME}!A1`,
      valueInputOption: "USER_ENTERED",
      resource: {
        values: rows,
      },
    });

    console.log(
      `✅ Google Sheets: exported ${rows.length - 1} students to ${SUMMARY_SHEET_NAME}`
    );

    // Format the sheet (make it pretty)
    await formatSummarySheet(sheets);

    return {
      success: true,
      studentsExported: rows.length - 1,
      sheetName: SUMMARY_SHEET_NAME,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("❌ Google Sheets: export failed");
    console.error(`   ${error.message}`);
    if (error.response?.data) {
      console.error("   API:", JSON.stringify(error.response.data));
    }
    throw error;
  }
}

// =======================================================
// 🔹 FORMAT SUMMARY SHEET (Make it pretty!)
// =======================================================
async function formatSummarySheet(sheets) {
  try {
    // Get sheet ID
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });

    const sheet = spreadsheet.data.sheets.find(
      (s) => s.properties.title === SUMMARY_SHEET_NAME
    );

    if (!sheet) return;

    const sheetId = sheet.properties.sheetId;

    // Apply formatting
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      resource: {
        requests: [
          // Bold header row
          {
            repeatCell: {
              range: {
                sheetId: sheetId,
                startRowIndex: 0,
                endRowIndex: 1,
              },
              cell: {
                userEnteredFormat: {
                  textFormat: {
                    bold: true,
                    fontSize: 11,
                  },
                  backgroundColor: {
                    red: 0.2,
                    green: 0.5,
                    blue: 0.9,
                  },
                  horizontalAlignment: "CENTER",
                },
              },
              fields: "userEnteredFormat(textFormat,backgroundColor,horizontalAlignment)",
            },
          },
          // Auto-resize columns
          {
            autoResizeDimensions: {
              dimensions: {
                sheetId: sheetId,
                dimension: "COLUMNS",
                startIndex: 0,
                endIndex: 17,
              },
            },
          },
          // Freeze header row
          {
            updateSheetProperties: {
              properties: {
                sheetId: sheetId,
                gridProperties: {
                  frozenRowCount: 1,
                },
              },
              fields: "gridProperties.frozenRowCount",
            },
          },
        ],
      },
    });

    console.log("✅ Applied formatting to summary sheet");
  } catch (error) {
    console.error("⚠️ Formatting failed (non-critical):", error.message);
  }
}

// =======================================================
// 🔹 EXPORT SUBJECT-SPECIFIC STATUS
// =======================================================
async function exportSubjectStatus(subject) {
  try {
    console.log(`📊 Exporting ${subject} status...`);

    const sheetName = `${subject.toUpperCase()}_Status`;

    // Get subject-specific leaderboard
    const leaderboard = await getLeaderboard(subject);

    if (!leaderboard || leaderboard.length === 0) {
      return {
        success: false,
        message: `No ${subject} data available`,
      };
    }

    assertSheetsReady();
    const sheets = await getSheetsApi();

    // Check if sheet exists
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });

    const sheetExists = spreadsheet.data.sheets.some(
      (s) => s.properties.title === sheetName
    );

    if (!sheetExists) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        resource: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: sheetName,
                },
              },
            },
          ],
        },
      });
    } else {
      await sheets.spreadsheets.values.clear({
        spreadsheetId: SPREADSHEET_ID,
        range: `${sheetName}!A2:Z`,
      });
    }

    // Build rows
    const rows = [
      ["Rank", "Student ID", "Score", "Total Questions", "Last Updated"],
    ];

    for (const student of leaderboard) {
      const history = await getStudentHistory(student.studentId);
      const subjectHistory = history.filter((h) => h.subject === subject);

      rows.push([
        student.rank,
        student.studentId,
        student.score,
        subjectHistory.length,
        new Date().toISOString(),
      ]);
    }

    // Write to sheet
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A1`,
      valueInputOption: "USER_ENTERED",
      resource: {
        values: rows,
      },
    });

    console.log(
      `✅ Google Sheets: exported ${rows.length - 1} students to ${sheetName}`
    );

    return {
      success: true,
      studentsExported: rows.length - 1,
      sheetName: sheetName,
      subject: subject,
    };
  } catch (error) {
    console.error(`❌ Google Sheets: export failed for ${subject}`);
    console.error(`   ${error.message}`);
    throw error;
  }
}

// =======================================================
// 🔹 SCHEDULE AUTO-EXPORT (Optional)
// =======================================================
function scheduleAutoExport(intervalMinutes = 60) {
  console.log(`⏰ Scheduling auto-export every ${intervalMinutes} minutes`);

  setInterval(async () => {
    try {
      console.log("🔄 Running scheduled export...");
      await exportStudentStatus();
      console.log("✅ Scheduled export completed");
    } catch (error) {
      console.error("❌ Scheduled export failed:", error.message);
    }
  }, intervalMinutes * 60 * 1000);
}

module.exports = {
  exportStudentStatus,
  exportSubjectStatus,
  scheduleAutoExport,
};
