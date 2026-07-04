const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "../data/communication-reviews");
const STREAKS_FILE = path.join(DATA_DIR, "streaks.json");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(STREAKS_FILE)) {
  fs.writeFileSync(STREAKS_FILE, JSON.stringify({}, null, 2));
}

function loadAll() {
  try {
    return JSON.parse(fs.readFileSync(STREAKS_FILE, "utf8"));
  } catch {
    return {};
  }
}

function saveAll(data) {
  fs.writeFileSync(STREAKS_FILE, JSON.stringify(data, null, 2));
}

function getRecord(studentId) {
  const all = loadAll();
  return (
    all[studentId] || {
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      lastPenaltyDate: null,
    }
  );
}

function saveRecord(studentId, record) {
  const all = loadAll();
  all[studentId] = record;
  saveAll(all);
}

module.exports = { getRecord, saveRecord };
