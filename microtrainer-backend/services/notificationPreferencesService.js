/**
 * Notification Preferences Service
 *
 * Manages student notification preferences
 */

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "../data/notifications");
const PREFERENCES_FILE = path.join(DATA_DIR, "preferences.json");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(PREFERENCES_FILE)) {
  fs.writeFileSync(PREFERENCES_FILE, JSON.stringify({}));
}

const DEFAULT_PREFERENCES = {
  browserNotifications: false,
  emailNotifications: true,
  frequency: "daily",
  quietHoursEnabled: false,
  quietHoursStart: "22:00",
  quietHoursEnd: "08:00",
  notificationTypes: {
    dailyReminders: true,
    streakAlerts: true,
    mockTestReminders: true,
    progressAlerts: true,
    badgeEarned: true,
    assessmentAvailable: true,
  },
  lastDailyEmailAt: null,
  lastWeeklyEmailAt: null,
  lastStreakAlertAt: null,
};

function loadPreferences() {
  try {
    return JSON.parse(fs.readFileSync(PREFERENCES_FILE, "utf8"));
  } catch (error) {
    console.error("Error loading preferences:", error);
    return {};
  }
}

function savePreferences(preferences) {
  fs.writeFileSync(PREFERENCES_FILE, JSON.stringify(preferences, null, 2));
}

function mergeWithDefaults(preferences) {
  return {
    ...DEFAULT_PREFERENCES,
    ...preferences,
    notificationTypes: {
      ...DEFAULT_PREFERENCES.notificationTypes,
      ...(preferences?.notificationTypes || {}),
    },
  };
}

function getNotificationPreferences(studentId) {
  const allPreferences = loadPreferences();
  return mergeWithDefaults(allPreferences[studentId]);
}

function saveNotificationPreferences(studentId, preferences) {
  const allPreferences = loadPreferences();
  const existing = allPreferences[studentId] || {};
  allPreferences[studentId] = {
    ...mergeWithDefaults(existing),
    ...preferences,
    notificationTypes: {
      ...DEFAULT_PREFERENCES.notificationTypes,
      ...(existing.notificationTypes || {}),
      ...(preferences.notificationTypes || {}),
    },
    updatedAt: new Date().toISOString(),
  };
  savePreferences(allPreferences);
  console.log(`✅ Notification preferences saved for ${studentId}`);
}

function isInQuietHours(preferences) {
  if (!preferences.quietHoursEnabled) return false;

  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const start = preferences.quietHoursStart;
  const end = preferences.quietHoursEnd;

  if (start > end) {
    return currentTime >= start || currentTime < end;
  }
  return currentTime >= start && currentTime < end;
}

function isChannelEnabled(preferences, channel, studentId = null) {
  if (channel === "browser") {
    if (preferences.browserNotifications) return true;
    if (studentId) {
      try {
        const { getSubscription } = require("./pushNotificationService");
        if (getSubscription(studentId)) return true;
      } catch {
        /* optional */
      }
    }
    return false;
  }
  if (channel === "email") return Boolean(preferences.emailNotifications);
  return false;
}

function isNotificationTypeEnabled(preferences, notificationType) {
  if (!notificationType) return true;
  return Boolean(preferences.notificationTypes?.[notificationType]);
}

/**
 * Full gate: channel + type + quiet hours
 */
function canSendNotification(studentId, notificationType, channel = "browser") {
  const preferences = getNotificationPreferences(studentId);

  if (!isChannelEnabled(preferences, channel, studentId)) {
    return false;
  }
  if (!isNotificationTypeEnabled(preferences, notificationType)) {
    return false;
  }
  if (isInQuietHours(preferences)) {
    return false;
  }
  return true;
}

/** @deprecated use canSendNotification */
function shouldSendNotification(studentId, notificationType) {
  return canSendNotification(studentId, notificationType, "browser");
}

function daysBetween(isoA, isoB) {
  const a = new Date(isoA).getTime();
  const b = new Date(isoB).getTime();
  return Math.floor(Math.abs(b - a) / (1000 * 60 * 60 * 24));
}

function shouldSendDailyEmailNow(studentId) {
  const preferences = getNotificationPreferences(studentId);
  if (!preferences.emailNotifications) return false;

  const last = preferences.lastDailyEmailAt;
  if (!last) return true;

  const days = daysBetween(last, new Date().toISOString());
  if (preferences.frequency === "every2days") return days >= 2;
  if (preferences.frequency === "weekly") return days >= 7;
  return days >= 1;
}

function shouldSendWeeklyEmailNow(studentId) {
  const preferences = getNotificationPreferences(studentId);
  if (!preferences.emailNotifications) return false;

  const last = preferences.lastWeeklyEmailAt;
  if (!last) return true;
  return daysBetween(last, new Date().toISOString()) >= 7;
}

function recordEmailSent(studentId, kind) {
  const allPreferences = loadPreferences();
  const current = mergeWithDefaults(allPreferences[studentId]);
  const now = new Date().toISOString();

  if (kind === "daily") current.lastDailyEmailAt = now;
  if (kind === "weekly") current.lastWeeklyEmailAt = now;

  allPreferences[studentId] = { ...current, updatedAt: now };
  savePreferences(allPreferences);
}

function recordStreakAlertSent(studentId) {
  const allPreferences = loadPreferences();
  const current = mergeWithDefaults(allPreferences[studentId]);
  const now = new Date().toISOString();
  allPreferences[studentId] = { ...current, lastStreakAlertAt: now, updatedAt: now };
  savePreferences(allPreferences);
}

function shouldSendStreakAlertNow(studentId) {
  const preferences = getNotificationPreferences(studentId);
  const last = preferences.lastStreakAlertAt;
  if (!last) return true;
  return daysBetween(last, new Date().toISOString()) >= 1;
}

function setBrowserNotificationsEnabled(studentId, enabled) {
  const prefs = getNotificationPreferences(studentId);
  saveNotificationPreferences(studentId, {
    ...prefs,
    browserNotifications: Boolean(enabled),
  });
}

function getStudentsForNotificationType(
  notificationType,
  channel = "browser",
  candidateIds = null
) {
  const allPreferences = loadPreferences();
  const ids =
    candidateIds && candidateIds.length > 0
      ? candidateIds
      : Object.keys(allPreferences);

  const students = [];
  for (const studentId of ids) {
    if (canSendNotification(studentId, notificationType, channel)) {
      students.push(studentId);
    }
  }
  return students;
}

module.exports = {
  getNotificationPreferences,
  saveNotificationPreferences,
  shouldSendNotification,
  canSendNotification,
  shouldSendDailyEmailNow,
  shouldSendWeeklyEmailNow,
  recordEmailSent,
  recordStreakAlertSent,
  shouldSendStreakAlertNow,
  setBrowserNotificationsEnabled,
  getStudentsForNotificationType,
  DEFAULT_PREFERENCES,
};
