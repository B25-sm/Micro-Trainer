const { google } = require("googleapis");

// =======================================================
// 🔹 CONFIG
// =======================================================
const SPREADSHEET_ID = process.env.SHEET_ID;
const SHEET_NAME = "Sheet1";

// 🔥 VALIDATION (fail fast)
if (!SPREADSHEET_ID) {
  console.error("❌ ERROR: SHEET_ID is missing in .env");
}

// =======================================================
// 🔹 AUTH
// =======================================================
const auth = new google.auth.GoogleAuth({
  keyFile: "credentials.json",
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

// =======================================================
// 🔹 Safe Value Helper
// =======================================================
function safe(val) {
  if (val === undefined || val === null) return "";
  if (Array.isArray(val)) return val.join(", ");
  return val;
}

// =======================================================
// 🔹 Log Interview
// =======================================================
async function logInterview(data) {
  try {
    // 🔥 HARD CHECK
    if (!SPREADSHEET_ID) {
      throw new Error("SHEET_ID is undefined. Check .env file.");
    }

    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });

    // 🔹 Prepare row
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

    // ===================================================
    // 🔥 DEBUG LOGS (VERY IMPORTANT)
    // ===================================================
    console.log("====================================");
    console.log("📤 SENDING DATA TO GOOGLE SHEETS");
    console.log("📌 SHEET_ID:", SPREADSHEET_ID);
    console.log("📌 RANGE:", `${SHEET_NAME}!A:L`);
    console.log("📌 ROW:", row);
    console.log("====================================");

    // ===================================================
    // 🔹 API CALL
    // ===================================================
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:L`,
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [row],
      },
    });

    console.log("✅ SUCCESS: Data logged to Google Sheets");
    console.log("📊 Updates:", response.data.updates);

  } catch (error) {
    console.error("❌ GOOGLE SHEETS ERROR (FULL):");

    // 🔥 FULL ERROR PRINT
    console.error(error);

    if (error.response) {
      console.error("📉 API RESPONSE ERROR:", error.response.data);
    }

    if (error.message) {
      console.error("📛 MESSAGE:", error.message);
    }
  }
}

module.exports = { logInterview };