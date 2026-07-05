/**
 * Import interview_questions.xlsx → company-questions.csv
 * Run from microtrainer-backend:
 *   node scripts/import-company-interviews-from-xlsx.js
 * Optional path:
 *   node scripts/import-company-interviews-from-xlsx.js ../interview_questions.xlsx
 */
const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");

const DEFAULT_XLSX = path.join(__dirname, "../../interview_questions.xlsx");
const CSV_FILE = path.join(__dirname, "../data/company-interviews/company-questions.csv");

// Labels found in the source workbook that identify candidates, interview rounds,
// roles, or locations rather than companies. Keep them out of the app if an old
// copy of the workbook is imported again.
const NON_COMPANY_LABELS = new Set(
  [
    "Arun kumar",
    "Bala Manoj Gupta",
    "Civic center",
    "D1R ROHIT",
    "D1R SANDHYA",
    "D3R SWATHI",
    "Fatima Firdouse -outi",
    "Final round",
    "G. praveen",
    "HARSHAVARDHAN",
    "Jayakrishna",
    "Kapa Revanth Kumar Reddy-out",
    "Mahesh",
    "Manish-blr",
    "NAGA SAI KIRAN",
    "Python Data Analyst",
    "Rahul",
    "Ranjith",
    "Renan",
    "Sai Shruthi Haridasu",
    "Shiva",
    "Srija Gunda-outi",
  ].map((label) => label.toLowerCase())
);

function isCompanyLabel(label) {
  return !NON_COMPANY_LABELS.has(String(label || "").trim().toLowerCase());
}

function csvEscape(val) {
  const s = String(val ?? "");
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function slugify(name) {
  return (
    String(name || "company")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "company"
  );
}

function inferCategory(question) {
  const q = String(question || "").toLowerCase();
  if (
    /\b(tell me about yourself|about yourself|why (do you want|should we hire)|strengths?|weakness|resume|where do you see|join (us|our|the company)|hire you|relocate|gap in)\b/.test(
      q
    )
  ) {
    return "HR";
  }
  if (
    /\b(percentage|ratio|puzzle|series|clock|angle|profit|loss|average|time and work|together in|days to complete)\b/.test(
      q
    )
  ) {
    return "Aptitude";
  }
  if (/\b(explain to|non-technical|manager|stakeholder|communicate)\b/.test(q)) {
    return "Communication";
  }
  if (
    /\b(project|team|conflict|deadline|disagree|mistake|challenge|pressure|learn quickly)\b/.test(
      q
    )
  ) {
    return "Situational";
  }
  return "Technical";
}

function inferTopic(question, category) {
  const q = String(question || "").toLowerCase();
  const topics = [
    ["java", "Java"],
    ["python", "Python"],
    ["javascript", "JavaScript"],
    ["react", "React"],
    ["node", "Node.js"],
    ["sql", "SQL"],
    ["database", "DBMS"],
    ["oop", "OOP"],
    ["api", "APIs"],
    ["mern", "MERN"],
    ["spring", "Spring"],
    ["angular", "Angular"],
    ["html", "HTML/CSS"],
    ["css", "HTML/CSS"],
    ["git", "Git"],
    ["aws", "Cloud"],
    ["cloud", "Cloud"],
    ["docker", "DevOps"],
    ["kubernetes", "DevOps"],
    ["ml", "ML/AI"],
    ["machine learning", "ML/AI"],
    ["data structure", "DSA"],
    ["algorithm", "DSA"],
  ];
  for (const [needle, label] of topics) {
    if (q.includes(needle)) return label;
  }
  if (category === "HR") return "Introduction";
  if (category === "Aptitude") return "Logic";
  if (category === "Communication") return "Clarity";
  if (category === "Situational") return "Behavioral";
  return "General";
}

function inferDifficulty(question, category) {
  const q = String(question || "").toLowerCase();
  if (category === "HR" && q.length < 80) return "easy";
  if (/\b(write code|implement|optimize|design system|architecture)\b/.test(q)) {
    return "hard";
  }
  if (category === "Aptitude") return "medium";
  return "medium";
}

function importFromXlsx(xlsxPath) {
  if (!fs.existsSync(xlsxPath)) {
    throw new Error(`File not found: ${xlsxPath}`);
  }

  const workbook = XLSX.readFile(xlsxPath);
  const sheetName = workbook.SheetNames.includes("Company Questions")
    ? "Company Questions"
    : workbook.SheetNames[0];

  const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
    defval: "",
  });

  const usedIds = new Map();
  const companyMeta = new Map();

  const header =
    "company_id,company_name,role,tagline,category,topic,pattern,difficulty,question_count,fit_strong,fit_borderline";
  const outRows = [header];

  for (const row of rows) {
    const companyName = String(row["Company Name"] || row.company_name || "").trim();
    const pattern = String(
      row["Questions Asked"] || row.question || row.pattern || ""
    ).trim();

    if (!companyName || !pattern || !isCompanyLabel(companyName)) continue;

    if (!companyMeta.has(companyName)) {
      let baseId = slugify(companyName);
      if (usedIds.has(baseId) && usedIds.get(baseId) !== companyName) {
        baseId = `${baseId}-${usedIds.size}`;
      }
      usedIds.set(baseId, companyName);
      companyMeta.set(companyName, {
        id: baseId,
        count: 0,
      });
    }

    const meta = companyMeta.get(companyName);
    meta.count += 1;

    const category = inferCategory(pattern);
    const topic = inferTopic(pattern, category);
    const difficulty = inferDifficulty(pattern, category);

    outRows.push(
      [
        meta.id,
        companyName,
        "Campus / Placement",
        `Real past interview questions (${meta.count}+ collected)`,
        category,
        topic,
        pattern,
        difficulty,
        10,
        7.0,
        5.5,
      ]
        .map(csvEscape)
        .join(",")
    );
  }

  // Fix taglines with final counts
  const countByCompany = new Map();
  for (const row of rows) {
    const name = String(row["Company Name"] || "").trim();
    if (!name || !isCompanyLabel(name)) continue;
    countByCompany.set(name, (countByCompany.get(name) || 0) + 1);
  }

  const finalRows = [header];
  for (let i = 1; i < outRows.length; i++) {
    const parts = parseCsvLine(outRows[i]);
    const companyName = parts[1];
    const count = countByCompany.get(companyName) || 10;
    parts[3] = `${count} real questions from past ${companyName} interviews`;
    parts[8] = String(Math.min(12, Math.max(8, Math.ceil(count / 10))));
    finalRows.push(parts.map(csvEscape).join(","));
  }

  fs.writeFileSync(CSV_FILE, `${finalRows.join("\n")}\n`, "utf8");

  return {
    sheetName,
    questionRows: finalRows.length - 1,
    companyCount: companyMeta.size,
    companies: [...companyMeta.entries()]
      .map(([name, meta]) => ({ name, id: meta.id, questions: countByCompany.get(name) }))
      .sort((a, b) => b.questions - a.questions),
  };
}

function parseCsvLine(line) {
  const cells = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === "," && !inQuotes) {
      cells.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  cells.push(current);
  return cells;
}

const xlsxPath = process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_XLSX;
const summary = importFromXlsx(xlsxPath);

const { reloadBank, loadBank } = require("../services/companyInterviewBank");
reloadBank();
const bank = loadBank();

console.log(`Imported from: ${xlsxPath}`);
console.log(`Sheet: ${summary.sheetName}`);
console.log(`Companies: ${summary.companyCount}`);
console.log(`Questions: ${summary.questionRows}`);
console.log(`CSV: ${CSV_FILE}`);
console.log(`Active source: ${bank.source}`);
console.log("\nTop companies:");
summary.companies.slice(0, 15).forEach((c) => {
  console.log(`  ${c.name}: ${c.questions}`);
});
