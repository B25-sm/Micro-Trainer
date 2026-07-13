const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const DATA_FILE = path.join(__dirname, "../data/quick-check-progress.json");
const DAY_MS = 24 * 60 * 60 * 1000;
const ABANDON_AFTER_MS = 30 * 60 * 1000;
const RETENTION_RECHECK_MS = 7 * DAY_MS;

function loadStore() {
  try {
    if (!fs.existsSync(DATA_FILE)) return {};
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8")) || {};
  } catch (error) {
    console.error("Quick-check progress read error:", error.message);
    return {};
  }
}

function saveStore(store) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  const tempFile = `${DATA_FILE}.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify(store, null, 2), "utf8");
  fs.renameSync(tempFile, DATA_FILE);
}

function topicKey(topic) {
  return crypto.createHash("sha1").update(String(topic || "").trim().toLowerCase()).digest("hex").slice(0, 16);
}

function dismissalDelay(count) {
  if (count <= 1) return DAY_MS;
  if (count === 2) return 3 * DAY_MS;
  return 7 * DAY_MS;
}

function effectiveStatus(record, now = Date.now()) {
  if (
    (record.status === "started" || record.status === "offered") &&
    now - new Date(record.updatedAt).getTime() >= ABANDON_AFTER_MS
  ) {
    return record.status === "started" ? "abandoned" : "ignored";
  }
  return record.status;
}

function recordQuickCheckEvent({ studentId, topic, event, sessionId = null, score = null }) {
  if (!studentId || studentId === "anonymous") return null;
  const cleanTopic = String(topic || "").trim().slice(0, 300);
  if (!cleanTopic) return null;

  const store = loadStore();
  const key = topicKey(cleanTopic);
  const student = store[studentId] || {};
  const now = new Date();
  const previous = student[key] || {
    topic: cleanTopic,
    dismissCount: 0,
    attemptCount: 0,
    history: [],
  };

  const next = {
    ...previous,
    topic: cleanTopic,
    status: event,
    sessionId,
    updatedAt: now.toISOString(),
  };

  if (event === "offered") next.lastOfferedAt = now.toISOString();
  if (event === "started") {
    next.startedAt = now.toISOString();
    next.attemptCount = Number(previous.attemptCount || 0) + 1;
  }
  if (event === "dismissed" || event === "abandoned") {
    next.dismissCount = Number(previous.dismissCount || 0) + 1;
    next.nextEligibleAt = new Date(now.getTime() + dismissalDelay(next.dismissCount)).toISOString();
  }
  if (event === "submitted") {
    const numericScore = Math.max(0, Math.min(100, Number(score) || 0));
    next.score = numericScore;
    next.status = numericScore >= 60 ? "verified" : "needs_revision";
    next.verifiedAt = numericScore >= 60 ? now.toISOString() : previous.verifiedAt || null;
    next.nextEligibleAt = new Date(
      now.getTime() + (numericScore >= 60 ? RETENTION_RECHECK_MS : 15 * 60 * 1000)
    ).toISOString();
  }

  next.history = [
    ...(Array.isArray(previous.history) ? previous.history : []),
    { event, at: now.toISOString(), sessionId, score: score == null ? null : Number(score) },
  ].slice(-40);

  student[key] = next;
  store[studentId] = student;
  saveStore(store);
  return next;
}

function getQuickCheckStatus(studentId, topic) {
  const record = loadStore()?.[studentId]?.[topicKey(topic)] || null;
  if (!record) {
    return { hasHistory: false, status: "not_offered", eligible: true, nextEligibleAt: null };
  }

  const status = effectiveStatus(record);
  const derivedNextEligibleAt =
    !record.nextEligibleAt && (status === "ignored" || status === "abandoned")
      ? new Date(new Date(record.updatedAt).getTime() + DAY_MS).toISOString()
      : null;
  const nextEligibleAt = record.nextEligibleAt || derivedNextEligibleAt;
  const eligible = !nextEligibleAt || Date.now() >= new Date(nextEligibleAt).getTime();
  return {
    hasHistory: true,
    status,
    eligible,
    nextEligibleAt: nextEligibleAt || null,
    dismissCount: Number(record.dismissCount || 0),
    attemptCount: Number(record.attemptCount || 0),
    lastScore: record.score ?? null,
  };
}

function getStudentQuickCheckSummary(studentId) {
  const records = Object.values(loadStore()?.[studentId] || {});
  const counts = {
    pending: 0,
    deferred: 0,
    abandoned: 0,
    needsRevision: 0,
    verified: 0,
  };

  const topics = records.map((record) => {
    const status = effectiveStatus(record);
    if (status === "verified") counts.verified += 1;
    else if (status === "needs_revision") counts.needsRevision += 1;
    else if (status === "dismissed") counts.deferred += 1;
    else if (status === "abandoned" || status === "ignored") counts.abandoned += 1;
    else counts.pending += 1;
    return {
      topic: record.topic,
      status,
      score: record.score ?? null,
      dismissCount: Number(record.dismissCount || 0),
      updatedAt: record.updatedAt,
      nextEligibleAt: record.nextEligibleAt || null,
    };
  });

  return {
    ...counts,
    unverified: counts.pending + counts.deferred + counts.abandoned + counts.needsRevision,
    topics: topics.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 20),
  };
}

module.exports = {
  recordQuickCheckEvent,
  getQuickCheckStatus,
  getStudentQuickCheckSummary,
  effectiveStatus,
  dismissalDelay,
};
