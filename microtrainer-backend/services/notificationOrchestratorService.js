/**
 * Central notification dispatcher — respects user preferences before sending.
 */

const {
  getNotificationPreferences,
  canSendNotification,
  shouldSendDailyEmailNow,
  recordEmailSent,
} = require("./notificationPreferencesService");
const { getContactByStudentId } = require("./studentContactService");
const {
  sendPushNotification,
  sendDailyPracticeReminder,
  sendStreakRiskAlert,
  sendBadgeEarnedNotification,
  sendAssessmentAvailableNotification,
  sendMockTestReminder,
  sendSchedulePlanReminder,
  sendTestNotification,
} = require("./pushNotificationService");
const {
  sendDailyReminder,
  sendWeeklySummary,
  sendAtRiskAlert,
} = require("./emailService");

const TYPE = {
  DAILY: "dailyReminders",
  STREAK: "streakAlerts",
  MOCK: "mockTestReminders",
  PROGRESS: "progressAlerts",
  BADGE: "badgeEarned",
  ASSESSMENT: "assessmentAvailable",
};

async function dispatch(studentId, notificationType, options = {}) {
  const {
    channels = ["browser", "email"],
    force = false,
    emailKind = null,
    pushSend,
    emailSend,
  } = options;

  const result = {
    studentId,
    notificationType,
    browser: { sent: false, skipped: false, error: null },
    email: { sent: false, skipped: false, error: null },
  };

  const wantBrowser = channels.includes("browser");
  const wantEmail = channels.includes("email");

  const browserOk =
    force || (wantBrowser && canSendNotification(studentId, notificationType, "browser"));
  const emailOk =
    force ||
    (wantEmail &&
      canSendNotification(studentId, notificationType, "email") &&
      (!emailKind || emailKind !== "daily" || shouldSendDailyEmailNow(studentId)));

  if (wantBrowser) {
    if (!browserOk) {
      result.browser.skipped = true;
    } else if (pushSend) {
      try {
        const pushResult = await pushSend();
        result.browser.sent = Boolean(pushResult?.success !== false);
        result.browser.error = pushResult?.error || null;
      } catch (error) {
        result.browser.error = error.message;
      }
    }
  }

  if (wantEmail) {
    if (!emailOk) {
      result.email.skipped = true;
    } else if (emailSend) {
      try {
        const emailResult = await emailSend();
        result.email.sent = Boolean(emailResult?.success);
        result.email.error = emailResult?.error || null;
        if (result.email.sent && emailKind) {
          recordEmailSent(studentId, emailKind);
        }
      } catch (error) {
        result.email.error = error.message;
      }
    }
  }

  return result;
}

async function notifyTest(studentId) {
  return dispatch(studentId, TYPE.DAILY, {
    channels: ["browser"],
    force: true,
    pushSend: () => sendTestNotification(studentId),
  });
}

async function notifyDailyPracticeReminder(studentId, { streak = 0, technology = "JavaScript" } = {}) {
  const { email, name } = getContactByStudentId(studentId);
  return dispatch(studentId, TYPE.DAILY, {
    emailKind: "daily",
    pushSend: () => sendDailyPracticeReminder(studentId, streak, technology),
    emailSend: email
      ? () => sendDailyReminder(email, name, streak, technology)
      : null,
  });
}

async function notifyStreakAtRisk(studentId, { streak = 0, hoursRemaining = 6, daysSincePractice = 2 } = {}) {
  const { email, name } = getContactByStudentId(studentId);
  return dispatch(studentId, TYPE.STREAK, {
    pushSend: () => sendStreakRiskAlert(studentId, streak, hoursRemaining),
    emailSend: email
      ? () => sendAtRiskAlert(email, name, daysSincePractice, streak)
      : null,
  });
}

async function notifyBadgeEarned(studentId, { badgeName, badgeIcon }) {
  return dispatch(studentId, TYPE.BADGE, {
    channels: ["browser"],
    pushSend: () =>
      sendBadgeEarnedNotification(studentId, badgeName || "Achievement", badgeIcon),
  });
}

async function notifyAssessmentAvailable(studentId, { technology }) {
  return dispatch(studentId, TYPE.ASSESSMENT, {
    channels: ["browser"],
    pushSend: () => sendAssessmentAvailableNotification(studentId, technology),
  });
}

async function notifyMockTestReminder(studentId, { technologies = [], timeUntilTest = "this week" } = {}) {
  return dispatch(studentId, TYPE.MOCK, {
    channels: ["browser"],
    pushSend: () => sendMockTestReminder(studentId, technologies, timeUntilTest),
  });
}

async function notifyScheduleReminder(studentId, reminder, notificationType = TYPE.DAILY) {
  return dispatch(studentId, notificationType, {
    channels: ["browser"],
    pushSend: () =>
      sendSchedulePlanReminder(studentId, {
        title: reminder.title,
        body: reminder.body,
        reminderType: reminder.type,
      }),
  });
}

async function notifyWeeklyProgress(studentId, weeklyStats) {
  const { email, name } = getContactByStudentId(studentId);
  return dispatch(studentId, TYPE.PROGRESS, {
    channels: ["email"],
    emailKind: "weekly",
    emailSend: email ? () => sendWeeklySummary(email, name, weeklyStats) : null,
  });
}

async function notifyProgressPush(studentId, { title, body, url = "/engagement" }) {
  return dispatch(studentId, TYPE.PROGRESS, {
    channels: ["browser"],
    pushSend: () =>
      sendPushNotification(studentId, {
        title,
        body,
        icon: "/notification-icon.png",
        badge: "/notification-icon.png",
        tag: "progress-alert",
        url,
        data: { type: "progress_alert" },
      }),
  });
}

function scheduleReminderNotificationType(reminderType) {
  if (reminderType === "behind" || reminderType === "on_track") {
    return TYPE.PROGRESS;
  }
  return TYPE.DAILY;
}

module.exports = {
  TYPE,
  dispatch,
  notifyTest,
  notifyDailyPracticeReminder,
  notifyStreakAtRisk,
  notifyBadgeEarned,
  notifyAssessmentAvailable,
  notifyMockTestReminder,
  notifyScheduleReminder,
  notifyWeeklyProgress,
  notifyProgressPush,
  scheduleReminderNotificationType,
};
