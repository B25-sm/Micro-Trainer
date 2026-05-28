const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "../data/progress");
const SYNC_STATUS_FILE = path.join(DATA_DIR, "sync-status.json");
const DEFAULT_STALE_HOURS = 72;
const LICENSE_SERVER_URL = process.env.LICENSE_SERVER_URL;
const LICENSE_KEY = process.env.LICENSE_KEY;
const STUDENT_EMAIL = process.env.STUDENT_EMAIL;
const DEPLOYMENT_URL = process.env.DEPLOYMENT_URL || "localhost";

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readStore() {
  try {
    if (!fs.existsSync(SYNC_STATUS_FILE)) return {};
    return JSON.parse(fs.readFileSync(SYNC_STATUS_FILE, "utf8"));
  } catch (error) {
    console.error("SYNC STATUS READ ERROR:", error.message);
    return {};
  }
}

function writeStore(store) {
  try {
    fs.writeFileSync(SYNC_STATUS_FILE, JSON.stringify(store, null, 2));
  } catch (error) {
    console.error("SYNC STATUS WRITE ERROR:", error.message);
  }
}

function isOfficialSyncRequired() {
  return process.env.OFFICIAL_SYNC_REQUIRED !== "0";
}

function getStaleHours() {
  const parsed = Number(process.env.OFFICIAL_SYNC_STALE_HOURS);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_STALE_HOURS;
}

function normalizeStudentId(studentId) {
  return String(studentId || process.env.STUDENT_EMAIL || "anonymous").trim();
}

function getNewestTimestamp(channels = {}) {
  const timestamps = Object.values(channels)
    .map((channel) => channel?.lastSuccessAt)
    .filter(Boolean)
    .map((timestamp) => new Date(timestamp).getTime())
    .filter(Number.isFinite);

  if (timestamps.length === 0) return null;
  return new Date(Math.max(...timestamps)).toISOString();
}

function buildStatus(studentId, record = {}) {
  const staleHours = getStaleHours();
  const lastSuccessfulSyncAt = getNewestTimestamp(record.channels);
  const lastSyncMs = lastSuccessfulSyncAt
    ? new Date(lastSuccessfulSyncAt).getTime()
    : 0;
  const isRecent =
    lastSyncMs > 0 && Date.now() - lastSyncMs <= staleHours * 60 * 60 * 1000;
  const syncRequired = isOfficialSyncRequired();

  return {
    studentId,
    syncRequired,
    staleHours,
    status: !syncRequired || isRecent ? "connected" : "disconnected",
    officialBenefitsEnabled: !syncRequired || isRecent,
    lastSuccessfulSyncAt,
    lastAttemptAt: record.lastAttemptAt || null,
    lastFailureAt: record.lastFailureAt || null,
    lastFailureReason: record.lastFailureReason || null,
    channels: record.channels || {},
    message:
      !syncRequired || isRecent
        ? "Official tracking is connected."
        : "Official progress sync is required for certificates, badges, leaderboards, and trainer verification.",
  };
}

function recordSyncAttempt(studentId, channel, result = {}) {
  const id = normalizeStudentId(studentId);
  const store = readStore();
  const now = new Date().toISOString();
  const channelName = channel || "unknown";

  const existing = store[id] || { channels: {} };
  const existingChannel = existing.channels[channelName] || {};
  const success = Boolean(result.success);
  const reason = result.reason || result.error || result.message || null;

  const nextChannel = {
    ...existingChannel,
    lastAttemptAt: now,
    lastStatus: success ? "success" : "failed",
    lastReason: reason,
  };

  if (success) {
    nextChannel.lastSuccessAt = now;
  } else {
    nextChannel.lastFailureAt = now;
  }

  const nextRecord = {
    ...existing,
    studentId: id,
    lastAttemptAt: now,
    channels: {
      ...existing.channels,
      [channelName]: nextChannel,
    },
  };

  if (success) {
    nextRecord.lastSuccessfulSyncAt = now;
  } else {
    nextRecord.lastFailureAt = now;
    nextRecord.lastFailureReason = reason;
  }

  store[id] = nextRecord;
  writeStore(store);

  if (success) {
    notifyLicenseServerHeartbeat(id, channelName);
  }

  return buildStatus(id, nextRecord);
}

function notifyLicenseServerHeartbeat(studentId, channel) {
  if (!LICENSE_SERVER_URL || !LICENSE_KEY || !STUDENT_EMAIL) return;

  fetch(`${LICENSE_SERVER_URL}/api/sync/heartbeat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      license_key: LICENSE_KEY,
      student_email: STUDENT_EMAIL,
      deployment_url: DEPLOYMENT_URL,
      student_id: studentId,
      channel,
      timestamp: Date.now(),
    }),
  }).catch((error) => {
    console.warn("License sync heartbeat failed:", error.message);
  });
}

function getStudentSyncStatus(studentId) {
  const id = normalizeStudentId(studentId);
  const store = readStore();
  return buildStatus(id, store[id]);
}

function getAllSyncStatuses() {
  const store = readStore();
  return Object.keys(store)
    .map((studentId) => buildStatus(studentId, store[studentId]))
    .sort((a, b) => {
      const aTime = a.lastSuccessfulSyncAt
        ? new Date(a.lastSuccessfulSyncAt).getTime()
        : 0;
      const bTime = b.lastSuccessfulSyncAt
        ? new Date(b.lastSuccessfulSyncAt).getTime()
        : 0;
      return bTime - aTime;
    });
}

function canUseOfficialBenefits(studentId) {
  return getStudentSyncStatus(studentId).officialBenefitsEnabled;
}

module.exports = {
  recordSyncAttempt,
  getStudentSyncStatus,
  getAllSyncStatuses,
  canUseOfficialBenefits,
};
