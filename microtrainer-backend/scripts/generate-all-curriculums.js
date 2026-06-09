/**
 * Regenerate all guided-course curriculum JSON files from scripts/syllabi/*.js
 * Skips datascience (hand-maintained mega syllabus).
 *
 * Run: node scripts/generate-all-curriculums.js
 */
const fs = require("fs");
const path = require("path");
const { buildCurriculum } = require("./lib/curriculumBuilder");

const syllabiDir = path.join(__dirname, "syllabi");
const outDir = path.join(__dirname, "../data/curriculums");
const SKIP = new Set(["datascience"]);

const files = fs
  .readdirSync(syllabiDir)
  .filter(
    (f) =>
      f.endsWith(".js") &&
      !f.startsWith("_") &&
      f !== "javascript.js"
  )
  .sort();

// javascript uses dedicated generator (large SECTIONS array)
files.push("javascript.js");

if (!files.length) {
  console.error("No syllabus files in scripts/syllabi/");
  process.exit(1);
}

let wrote = 0;
for (const file of files) {
  const key = file.replace(/\.js$/, "");
  if (SKIP.has(key)) {
    console.log(`⏭️  Skipped ${key} (preserved existing JSON)`);
    continue;
  }
  const spec = require(path.join(syllabiDir, file));
  const curriculum = buildCurriculum(spec);
  const outPath = path.join(outDir, `${key}.json`);
  fs.writeFileSync(outPath, JSON.stringify(curriculum, null, 2), "utf8");
  console.log(`✅ ${key}: ${curriculum.totalConcepts} modules → ${outPath}`);
  wrote += 1;
}

console.log(`\nDone. Wrote ${wrote} curriculum file(s).`);
