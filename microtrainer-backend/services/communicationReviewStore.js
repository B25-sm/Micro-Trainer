const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "../data/communication-reviews");
const REVIEWS_FILE = path.join(DATA_DIR, "reviews.json");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(REVIEWS_FILE)) {
  fs.writeFileSync(REVIEWS_FILE, JSON.stringify({}, null, 2));
}

function loadAll() {
  try {
    return JSON.parse(fs.readFileSync(REVIEWS_FILE, "utf8"));
  } catch {
    return {};
  }
}

function saveAll(data) {
  fs.writeFileSync(REVIEWS_FILE, JSON.stringify(data, null, 2));
}

function getHistory(studentId, limit = 20) {
  const all = loadAll();
  const list = all[studentId] || [];
  return list.slice(0, limit);
}

function addReview(studentId, review) {
  const all = loadAll();
  const list = all[studentId] || [];
  const entry = {
    id: `cr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    ...review,
    createdAt: new Date().toISOString(),
  };
  list.unshift(entry);
  all[studentId] = list.slice(0, 50);
  saveAll(all);
  return entry;
}

module.exports = {
  getHistory,
  addReview,
};
