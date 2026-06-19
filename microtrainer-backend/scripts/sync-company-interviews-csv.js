/**
 * Export companies.json → company-questions.csv (or import CSV → verify).
 * Run: node scripts/sync-company-interviews-csv.js
 */
const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "../data/company-interviews");
const JSON_FILE = path.join(DATA_DIR, "companies.json");
const CSV_FILE = path.join(DATA_DIR, "company-questions.csv");

function csvEscape(val) {
  const s = String(val ?? "");
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function exportJsonToCsv() {
  const bank = JSON.parse(fs.readFileSync(JSON_FILE, "utf8"));
  const header =
    "company_id,company_name,role,tagline,category,topic,pattern,difficulty,question_count,fit_strong,fit_borderline";
  const rows = [header];

  for (const company of bank.companies) {
    for (const q of company.questions) {
      rows.push(
        [
          company.id,
          company.name,
          company.role,
          company.tagline,
          q.category,
          q.topic,
          q.pattern,
          q.difficulty,
          company.defaultQuestionCount,
          company.fitThresholds?.strong ?? 7.5,
          company.fitThresholds?.borderline ?? 6.0,
        ]
          .map(csvEscape)
          .join(",")
      );
    }
  }

  fs.writeFileSync(CSV_FILE, `${rows.join("\n")}\n`, "utf8");
  return rows.length - 1;
}

const count = exportJsonToCsv();
const { reloadBank, loadBank } = require("../services/companyInterviewBank");
reloadBank();
const bank = loadBank();

console.log(`Wrote ${count} question rows to ${CSV_FILE}`);
console.log(`Active source: ${bank.source}`);
console.log(
  bank.companies.map((c) => `${c.name} (${c.questions.length} questions)`).join("\n")
);
