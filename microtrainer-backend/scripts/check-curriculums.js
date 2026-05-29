/**
 * Fail deploy/CI if guided-course curriculum files are missing.
 * Usage: node scripts/check-curriculums.js
 */
const fs = require("fs");
const path = require("path");

const dir = path.join(__dirname, "../data/curriculums");
const files = fs.existsSync(dir)
  ? fs.readdirSync(dir).filter((f) => f.endsWith(".json"))
  : [];

if (files.length < 10) {
  console.error(
    `❌ Missing curriculum data: found ${files.length} JSON files in data/curriculums (need ≥10).`
  );
  console.error(
    "   Add and commit microtrainer-backend/data/curriculums/*.json before deploying."
  );
  process.exit(1);
}

console.log(`✅ Curriculum check OK (${files.length} technologies)`);
