const { getRecord, saveRecord } = require("./communicationStreakStore");

function todayStr(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

/**
 * Reads the streak, applying at most one -1 miss penalty per calendar day
 * for gaps where at least one full day was skipped. Never goes below 0.
 */
function getStreak(studentId) {
  const record = getRecord(studentId);
  const today = todayStr();
  const yesterday = todayStr(-1);

  const missedAtLeastOneDay =
    record.lastActiveDate &&
    record.lastActiveDate !== today &&
    record.lastActiveDate !== yesterday;

  if (missedAtLeastOneDay && record.lastPenaltyDate !== today) {
    record.currentStreak = Math.max(0, record.currentStreak - 1);
    record.lastPenaltyDate = today;
    saveRecord(studentId, record);
  }

  return record;
}

/** Call once per completed communication-round activity for the day. */
function recordActivity(studentId) {
  const record = getStreak(studentId);
  const today = todayStr();

  if (record.lastActiveDate === today) {
    return record;
  }

  record.currentStreak += 1;
  record.longestStreak = Math.max(record.longestStreak || 0, record.currentStreak);
  record.lastActiveDate = today;
  saveRecord(studentId, record);

  return record;
}

module.exports = { getStreak, recordActivity };
