const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "../data/company-interviews");
const HISTORY_FILE = path.join(DATA_DIR, "history.json");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(HISTORY_FILE)) {
  fs.writeFileSync(HISTORY_FILE, JSON.stringify({}, null, 2));
}

function loadAll() {
  try {
    return JSON.parse(fs.readFileSync(HISTORY_FILE, "utf8"));
  } catch {
    return {};
  }
}

function saveAll(data) {
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(data, null, 2));
}

function getHistory(studentId, limit = 20) {
  const all = loadAll();
  return (all[studentId] || []).slice(0, limit);
}

function addAttempt(studentId, attempt) {
  const all = loadAll();
  const list = all[studentId] || [];
  const entry = {
    id: `ci_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    ...attempt,
    createdAt: new Date().toISOString(),
  };
  list.unshift(entry);
  all[studentId] = list.slice(0, 30);
  saveAll(all);
  return entry;
}

module.exports = {
  getHistory,
  addAttempt,
};
