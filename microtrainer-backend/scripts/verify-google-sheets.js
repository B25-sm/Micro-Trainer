/**
 * Verify Google Sheets integration (credentials + SHEET_ID + API access).
 * Run from microtrainer-backend: node scripts/verify-google-sheets.js
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const path = require("path");
const fs = require("fs");
const {
  resolveCredentialsPath,
  verifyGoogleSheetsSetup,
} = require("../services/googleSheetsAuth");

const credPath = resolveCredentialsPath();

console.log("--- Google Sheets verification ---");
console.log("SHEET_ID:", process.env.SHEET_ID || "(not set)");
console.log("credentials.json:", credPath);
console.log("credentials exist:", fs.existsSync(credPath));

verifyGoogleSheetsSetup()
  .then((result) => {
    if (result.ready) {
      console.log("\nResult: READY");
      process.exit(0);
    }
    console.log("\nResult: NOT READY —", result.reason);
    process.exit(1);
  })
  .catch((err) => {
    console.error("\nResult: ERROR —", err.message);
    process.exit(1);
  });
