const {
  getSheetsApi,
  isSheetsWriteEnabled,
  resolveCredentialsPath,
} = require("./googleSheetsAuth");

const SPREADSHEET_ID = process.env.SHEET_ID;
const SHEET_NAME = "Sheet1";

if (!SPREADSHEET_ID) {
  console.error("❌ Google Sheets: SHEET_ID is missing in .env");
}

function safe(val) {
  if (val === undefined || val === null) return "";
  if (Array.isArray(val)) return val.join(", ");
  return val;
}

async function logInterview(data) {
  if (!isSheetsWriteEnabled()) {
    console.warn(
      "⚠️ Google Sheets: write skipped (missing credentials.json or SHEET_ID)"
    );
    console.warn(`   Expected credentials at: ${resolveCredentialsPath()}`);
    return;
  }

  try {
    const sheets = await getSheetsApi();

    const row = [
      new Date().toISOString(),
      safe(data.studentId || "anonymous"),
      safe(data.question),
      safe(data.answer),
      safe(data.subject),
      safe(data.score),
      safe(data.communication),
      safe(data.technical),
      safe(data.strengths),
      safe(data.mistakes),
      safe(data.improvement),
      safe(data.verdict),
    ];

    const range = `${SHEET_NAME}!A:L`;

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      resource: {
        values: [row],
      },
    });

    const updatedRange =
      response.data.updates?.updatedRange || response.data.updates?.tableRange;
    const updatedRows = response.data.updates?.updatedRows ?? 1;

    console.log("✅ Google Sheets: row inserted successfully");
    console.log(`   Range: ${updatedRange || range}`);
    console.log(`   Rows added: ${updatedRows}`);
    console.log(`   Student: ${safe(data.studentId || "anonymous")}`);

    try {
      const { invalidateRowsCache } = require("./readSheetsService");
      invalidateRowsCache();
    } catch (_) {
      /* optional */
    }
  } catch (error) {
    console.error("❌ Google Sheets: row insert failed");
    console.error(`   ${error.message}`);

    if (error.response?.data) {
      console.error("   API:", JSON.stringify(error.response.data));
    }
  }
}

const BUG_REPORTS_SHEET = "BugReports";

async function ensureBugReportsSheet() {
  if (!isSheetsWriteEnabled()) return false;
  const sheets = await getSheetsApi();
  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID,
  });
  const exists = spreadsheet.data.sheets?.some(
    (s) => s.properties?.title === BUG_REPORTS_SHEET
  );
  if (!exists) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      resource: {
        requests: [
          {
            addSheet: {
              properties: {
                title: BUG_REPORTS_SHEET,
                gridProperties: { frozenRowCount: 1 },
              },
            },
          },
        ],
      },
    });
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${BUG_REPORTS_SHEET}!A1:I1`,
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [
          [
            "timestamp",
            "studentId",
            "email",
            "name",
            "message",
            "pagePath",
            "pageUrl",
            "screenshotCount",
            "screenshotIds",
          ],
        ],
      },
    });
    console.log(`✅ Google Sheets: created tab "${BUG_REPORTS_SHEET}"`);
  }
  return true;
}

async function logFeedbackReport(data) {
  if (!isSheetsWriteEnabled()) {
    return false;
  }

  try {
    await ensureBugReportsSheet();
    const sheets = await getSheetsApi();
    const row = [
      new Date().toISOString(),
      safe(data.studentId),
      safe(data.email),
      safe(data.name),
      safe(data.message),
      safe(data.pagePath),
      safe(data.pageUrl),
      safe(data.screenshotCount ?? 0),
      safe((data.screenshots || []).map((s) => s.id).join(", ")),
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${BUG_REPORTS_SHEET}!A:I`,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      resource: { values: [row] },
    });

    console.log("✅ Google Sheets: bug report logged");
    return true;
  } catch (error) {
    console.warn("⚠️  Google Sheets: bug report tab skipped —", error.message);
    return false;
  }
}

module.exports = { logInterview, logFeedbackReport };
