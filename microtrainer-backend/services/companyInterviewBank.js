const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "../data/company-interviews");
const BANK_FILE = path.join(DATA_DIR, "companies.json");
const CSV_FILE = path.join(DATA_DIR, "company-questions.csv");

let cache = null;

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function parseCsvLine(line) {
  const cells = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
      continue;
    }
    current += ch;
  }
  cells.push(current.trim());
  return cells;
}

function loadFromCsv() {
  if (!fs.existsSync(CSV_FILE)) return null;

  const raw = fs.readFileSync(CSV_FILE, "utf8");
  const lines = raw.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return null;

  const header = parseCsvLine(lines[0]).map((h) => h.toLowerCase());
  const idx = (name) => header.indexOf(name);

  const companiesMap = {};

  for (let i = 1; i < lines.length; i++) {
    const row = parseCsvLine(lines[i]);
    const companyId = row[idx("company_id")] || row[idx("companyid")];
    const companyName = row[idx("company_name")] || row[idx("companyname")];
    if (!companyId || !companyName) continue;

    if (!companiesMap[companyId]) {
      companiesMap[companyId] = {
        id: companyId,
        name: companyName,
        tagline: row[idx("tagline")] || `${companyName} placement mock`,
        role: row[idx("role")] || "Campus hire",
        defaultQuestionCount: Number(row[idx("question_count")] || 10) || 10,
        fitThresholds: {
          strong: Number(row[idx("fit_strong")] || 7.5) || 7.5,
          borderline: Number(row[idx("fit_borderline")] || 6.0) || 6.0,
        },
        topics: [],
        questions: [],
      };
    }

    const company = companiesMap[companyId];
    const topic = row[idx("topic")] || "General";
    if (topic && !company.topics.includes(topic)) {
      company.topics.push(topic);
    }

    company.questions.push({
      id: row[idx("question_id")] || `${companyId}-csv-${i}`,
      category: row[idx("category")] || "Technical",
      topic,
      pattern: row[idx("pattern")] || row[idx("question")] || "",
      difficulty: row[idx("difficulty")] || "medium",
    });
  }

  const companies = Object.values(companiesMap).filter((c) => c.questions.length > 0);
  const totalQuestions = companies.reduce((n, c) => n + c.questions.length, 0);
  return totalQuestions >= 5 ? { version: 1, source: "csv", companies } : null;
}

function loadBank() {
  if (cache) return cache;

  const fromCsv = loadFromCsv();
  if (fromCsv) {
    cache = fromCsv;
    return cache;
  }

  if (!fs.existsSync(BANK_FILE)) {
    cache = { version: 1, source: "empty", companies: [] };
    return cache;
  }

  cache = JSON.parse(fs.readFileSync(BANK_FILE, "utf8"));
  return cache;
}

function reloadBank() {
  cache = null;
  return loadBank();
}

function listCompanies() {
  return loadBank()
    .companies.map((c) => ({
      id: c.id,
      name: c.name,
      tagline: c.tagline,
      role: c.role,
      questionCount: c.questions?.length || 0,
      defaultQuestionCount: c.defaultQuestionCount || 10,
      topics: c.topics || [],
      fitThresholds: c.fitThresholds || { strong: 7.5, borderline: 6.0 },
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function getCompanyById(companyId) {
  return loadBank().companies.find((c) => c.id === companyId) || null;
}

function pickQuestionsForSession(company, totalQuestions) {
  const pool = [...(company.questions || [])];
  const count = Math.min(totalQuestions || company.defaultQuestionCount || 10, pool.length);

  const byCategory = {};
  pool.forEach((q) => {
    const cat = q.category || "General";
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(q);
  });

  const categories = Object.keys(byCategory);
  const picked = [];
  const used = new Set();

  while (picked.length < count && used.size < pool.length) {
    for (const cat of shuffle(categories)) {
      if (picked.length >= count) break;
      const items = shuffle(byCategory[cat]);
      const next = items.find((q) => !used.has(q.id));
      if (next) {
        used.add(next.id);
        picked.push(next);
      }
    }
    if (categories.every((cat) => byCategory[cat].every((q) => used.has(q.id)))) {
      break;
    }
  }

  return shuffle(picked).slice(0, count);
}

module.exports = {
  loadBank,
  reloadBank,
  listCompanies,
  getCompanyById,
  pickQuestionsForSession,
  BANK_FILE,
  CSV_FILE,
};
