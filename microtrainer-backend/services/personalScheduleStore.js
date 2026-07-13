const fs = require("fs");
const path = require("path");

const DEFAULT_DATA_DIR = path.join(__dirname, "../data/personal-schedules");
const SCHEDULES_FILE = process.env.PERSONAL_SCHEDULES_FILE || path.join(DEFAULT_DATA_DIR, "schedules.json");
const DATA_DIR = path.dirname(SCHEDULES_FILE);
const BACKUP_FILE = `${SCHEDULES_FILE}.bak`;

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(SCHEDULES_FILE)) {
  fs.writeFileSync(SCHEDULES_FILE, JSON.stringify({}, null, 2));
}

function loadAll() {
  try {
    return JSON.parse(fs.readFileSync(SCHEDULES_FILE, "utf8"));
  } catch (error) {
    try {
      const backup = JSON.parse(fs.readFileSync(BACKUP_FILE, "utf8"));
      console.warn(`Recovered personal schedules from backup: ${error.message}`);
      return backup;
    } catch {
      return {};
    }
  }
}

function saveAll(data) {
  const tempFile = `${SCHEDULES_FILE}.${process.pid}.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify(data, null, 2));
  if (fs.existsSync(SCHEDULES_FILE)) {
    fs.copyFileSync(SCHEDULES_FILE, BACKUP_FILE);
  }
  fs.renameSync(tempFile, SCHEDULES_FILE);
}

function getSchedule(studentId) {
  const all = loadAll();
  return all[studentId] || null;
}

function saveSchedule(studentId, schedule) {
  const all = loadAll();
  const saved = {
    ...schedule,
    studentId,
    updatedAt: new Date().toISOString(),
  };
  all[studentId] = saved;
  saveAll(all);
  return saved;
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
