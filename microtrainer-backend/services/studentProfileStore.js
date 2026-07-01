// =======================================================
// 👤 STUDENT PROFILE (Initial + Batch) — persisted on server
// =======================================================

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "../data/progress");
const PROFILES_FILE = path.join(DATA_DIR, "student-profiles.json");

let profiles = {};

function loadProfiles() {
  try {
    if (fs.existsSync(PROFILES_FILE)) {
      profiles = JSON.parse(fs.readFileSync(PROFILES_FILE, "utf8"));
    }
  } catch (err) {
    console.error("Error loading student profiles:", err.message);
    profiles = {};
  }
}

function saveProfiles() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(PROFILES_FILE, JSON.stringify(profiles, null, 2));
  } catch (err) {
    console.error("Error saving student profiles:", err.message);
  }
}

loadProfiles();

function normalizePart(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_-]/g, "");
}

function buildDisplayName(name, initial, batch) {
  const full = String(name || "").trim();
  const ini = String(initial || "").trim();
  const bat = String(batch || "").trim();
  if (full && ini && bat) return `${full} (${ini} · ${bat})`;
  if (full) return full;
  if (ini && bat) return `${ini} · ${bat}`;
  return "";
}

const VALID_TRACKS = new Set(["fullstack", "data_science", "data_analyst", "ai_ml"]);

function registerStudentProfile({ studentId, name, initial, batch, careerTrack }) {
  if (!studentId || !name || !initial || !batch) {
    throw new Error("studentId, name, initial, and batch are required");
  }

  const existing = profiles[studentId] || {};
  const track = VALID_TRACKS.has(careerTrack)
    ? careerTrack
    : existing.careerTrack || null;

  profiles[studentId] = {
    studentId,
    name: String(name).trim(),
    initial: String(initial).trim(),
    batch: String(batch).trim(),
    careerTrack: track,
    displayName: buildDisplayName(name, initial, batch),
    updatedAt: new Date().toISOString(),
  };

  saveProfiles();
  return profiles[studentId];
}

function getStudentProfile(studentId) {
  return profiles[studentId] || null;
}

function getAllStudentProfiles() {
  return { ...profiles };
}

module.exports = {
  registerStudentProfile,
  getStudentProfile,
  getAllStudentProfiles,
  normalizePart,
  buildDisplayName,
  VALID_TRACKS,
};
