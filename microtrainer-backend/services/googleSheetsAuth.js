const path = require("path");
const fs = require("fs");
const { google } = require("googleapis");

const BACKEND_ROOT = path.join(__dirname, "..");
const DEFAULT_CREDENTIALS_PATH = path.join(BACKEND_ROOT, "credentials.json");
const SPREADSHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets";

let authClientPromise = null;
let sheetsApiPromise = null;

function resolveCredentialsPath() {
  const fromEnv =
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    process.env.CREDENTIALS_PATH;

  if (fromEnv) {
    return path.isAbsolute(fromEnv)
      ? fromEnv
      : path.resolve(BACKEND_ROOT, fromEnv);
  }

  return DEFAULT_CREDENTIALS_PATH;
}

function credentialsFileExists() {
  return fs.existsSync(resolveCredentialsPath());
}

function createGoogleAuth() {
  const keyFile = resolveCredentialsPath();

  if (!fs.existsSync(keyFile)) {
    throw new Error(
      `Google credentials file not found at ${keyFile}. ` +
        "Download your service account JSON from Google Cloud Console and save it as microtrainer-backend/credentials.json"
    );
  }

  return new google.auth.GoogleAuth({
    keyFile,
    scopes: [SPREADSHEETS_SCOPE],
  });
}

async function getAuthClient() {
  if (!authClientPromise) {
    authClientPromise = (async () => {
      const auth = createGoogleAuth();
      const client = await auth.getClient();
      const email =
        client.email ||
        (await auth.getCredentials().catch(() => ({}))).client_email;

      console.log("✅ Google Sheets: service account authenticated");
      if (email) {
        console.log(`   Service account: ${email}`);
      }
      console.log(`   Credentials: ${resolveCredentialsPath()}`);

      return client;
    })().catch((err) => {
      authClientPromise = null;
      console.error("❌ Google Sheets: authentication failed");
      console.error(`   ${err.message}`);
      throw err;
    });
  }

  return authClientPromise;
}

async function getSheetsApi() {
  if (!sheetsApiPromise) {
    sheetsApiPromise = (async () => {
      const auth = await getAuthClient();
      return google.sheets({ version: "v4", auth });
    })().catch((err) => {
      sheetsApiPromise = null;
      throw err;
    });
  }

  return sheetsApiPromise;
}

async function verifySheetConnection(spreadsheetId = process.env.SHEET_ID) {
  if (!spreadsheetId || spreadsheetId === "dev-no-google-sheet") {
    throw new Error("SHEET_ID is not configured in .env");
  }

  const sheets = await getSheetsApi();
  const meta = await sheets.spreadsheets.get({ spreadsheetId });

  const title = meta.data.properties?.title || "(untitled)";
  const tabNames =
    meta.data.sheets?.map((s) => s.properties?.title).filter(Boolean) || [];

  console.log("✅ Google Sheets: connected to spreadsheet");
  console.log(`   Spreadsheet: "${title}" (${spreadsheetId})`);
  if (tabNames.length) {
    console.log(`   Tabs: ${tabNames.join(", ")}`);
  }

  return { spreadsheetId, title, tabNames };
}

async function verifyGoogleSheetsSetup() {
  const spreadsheetId = process.env.SHEET_ID;

  console.log("📊 Google Sheets: verifying setup...");

  if (!spreadsheetId || spreadsheetId === "dev-no-google-sheet") {
    console.warn(
      "⚠️ Google Sheets: SHEET_ID missing or placeholder — writes will be skipped"
    );
    return { ready: false, reason: "missing_sheet_id" };
  }

  if (!credentialsFileExists()) {
    console.warn(
      `⚠️ Google Sheets: credentials.json not found at ${resolveCredentialsPath()}`
    );
    console.warn(
      "   Place your Google Cloud service account JSON there (see credentials.json.example)"
    );
    return { ready: false, reason: "missing_credentials" };
  }

  try {
    await verifySheetConnection(spreadsheetId);
    console.log("✅ Google Sheets: backend is ready to write data");
    return { ready: true, spreadsheetId };
  } catch (err) {
    console.error("❌ Google Sheets: connection check failed");
    console.error(`   ${err.message}`);
    if (err.response?.data) {
      console.error("   API:", JSON.stringify(err.response.data));
    }
    return { ready: false, reason: "connection_failed", error: err.message };
  }
}

function isSheetsWriteEnabled() {
  const sheetId = process.env.SHEET_ID;
  return (
    Boolean(sheetId) &&
    sheetId !== "dev-no-google-sheet" &&
    credentialsFileExists()
  );
}

module.exports = {
  BACKEND_ROOT,
  resolveCredentialsPath,
  credentialsFileExists,
  createGoogleAuth,
  getAuthClient,
  getSheetsApi,
  verifySheetConnection,
  verifyGoogleSheetsSetup,
  isSheetsWriteEnabled,
};
