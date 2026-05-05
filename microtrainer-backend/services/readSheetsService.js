const { google } = require("googleapis");

const SPREADSHEET_ID = process.env.SHEET_ID;
const SHEET_NAME = "Sheet1";

const auth = new google.auth.GoogleAuth({
  keyFile: "credentials.json",
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

// 🔹 Get all rows
async function getAllRows() {
  try {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:L`,
    });

    const rows = response.data.values;

    if (!rows || rows.length <= 1) {
      return [];
    }

    // Remove header row
    const data = rows.slice(1);

    return data.map(row => ({
      timestamp: row[0],
      studentId: row[1],
      question: row[2],
      answer: row[3],
      subject: row[4],
      score: Number(row[5]),
      communication: row[6],
      technical: row[7],
      strengths: row[8],
      mistakes: row[9],
      improvement: row[10],
      verdict: row[11],
    }));

  } catch (error) {
    console.error("❌ Read Sheets Error:", error.message);
    return [];
  }
}

module.exports = { getAllRows };