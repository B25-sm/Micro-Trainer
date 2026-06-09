const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "../data/personal-schedules");
const SCHEDULES_FILE = path.join(DATA_DIR, "schedules.json");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(SCHEDULES_FILE)) {
  fs.writeFileSync(SCHEDULES_FILE, JSON.stringify({}, null, 2));
}

function loadAll() {
  try {
    return JSON.parse(fs.readFileSync(SCHEDULES_FILE, "utf8"));
  } catch {
    return {};
  }
}

function saveAll(data) {
  fs.writeFileSync(SCHEDULES_FILE, JSON.stringify(data, null, 2));
}

function getSchedule(studentId) {
  const all = loadAll();
  return all[studentId] || null;
}

function saveSchedule(studentId, schedule) {
  const all = loadAll();
  all[studentId] = {
    ...schedule,
    studentId,
    updatedAt: new Date().toISOString(),
  };
  saveAll(all);
  return all[studentId];
}

function deleteSchedule(studentId) {
  const all = loadAll();
  delete all[studentId];
  saveAll(all);
}

function getAllActiveSchedules() {
  const all = loadAll();
  return Object.values(all).filter((s) => s.plan && s.status === "active");
}

module.exports = {
  getSchedule,
  saveSchedule,
  deleteSchedule,
  getAllActiveSchedules,
};
