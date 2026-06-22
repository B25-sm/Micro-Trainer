/**
 * Cron Jobs for Background Tasks
 *
 * Scheduled tasks for:
 * - Daily assessment generation
 * - Streak calculation
 * - Status updates
 * - Notification delivery (respects user preferences)
 */

const cron = require("node-cron");
const { calculateAllStreaks, getAllStudentsEngagement } = require("./engagementService");
const { generateDailyAssessments } = require("./assessmentService");
const {
  notifyDailyPracticeReminder,
  notifyStreakAtRisk,
  notifyWeeklyProgress,
  notifyMockTestReminder,
} = require("./notificationOrchestratorService");
const {
  shouldSendStreakAlertNow,
  recordStreakAlertSent,
  getStudentsForNotificationType,
} = require("./notificationPreferencesService");
const { getStudentDashboardAnalytics } = require("./engagementAnalyticsService");

function initializeCronJobs() {
  console.log("⏰ Initializing cron jobs...");

  cron.schedule(
    "0 0 * * *",
    () => {
      console.log("🔄 Running daily streak calculation...");
      try {
        const result = calculateAllStreaks();
        console.log(
          `✅ Streak calculation complete: ${result.streaksUpdated} students updated`
        );
      } catch (error) {
        console.error("❌ Streak calculation failed:", error.message);
      }
    },
    { timezone: "UTC" }
  );

  cron.schedule(
    "0 0 * * *",
    async () => {
      console.log("🔄 Running daily assessment generation...");
      try {
        const result = await generateDailyAssessments();
        console.log(
          `✅ Assessment generation complete: ${result.generated} assessments, ${result.notified} notified`
        );
      } catch (error) {
        console.error("❌ Assessment generation failed:", error.message);
      }
    },
    { timezone: "UTC" }
  );

  cron.schedule("*/5 * * * *", () => {
    try {
      checkAtRiskStudents();
    } catch (error) {
      console.error("❌ Status update check failed:", error.message);
    }
  });

  cron.schedule(
    "0 9 * * *",
    async () => {
      console.log("📧 Sending daily reminders (respecting preferences)...");
      try {
        await sendDailyReminders();
      } catch (error) {
        console.error("❌ Daily reminders failed:", error.message);
      }
    },
    { timezone: "UTC" }
  );

  cron.schedule(
    "0 18 * * *",
    async () => {
      console.log("⚠️ Sending streak-at-risk reminders...");
      try {
        await sendStreakAtRiskReminders();
      } catch (error) {
        console.error("❌ Streak reminders failed:", error.message);
      }
    },
    { timezone: "UTC" }
  );

  cron.schedule(
    "0 8 * * *",
    async () => {
      console.log("📅 Sending personal schedule reminders...");
      try {
        const { runDailyScheduleReminders } = require("./personalScheduleService");
        const result = await runDailyScheduleReminders();
        console.log(`✅ Schedule reminders: ${result.sent}/${result.processed} sent`);
      } catch (error) {
        console.error("❌ Schedule reminders failed:", error.message);
      }
    },
    { timezone: "UTC" }
  );

  cron.schedule(
    "0 8 * * 0",
    async () => {
      console.log("📊 Sending weekly summary emails...");
      try {
        await sendWeeklySummaryEmails();
      } catch (error) {
        console.error("❌ Weekly summary emails failed:", error.message);
      }
    },
    { timezone: "UTC" }
  );

  cron.schedule(
    "0 10 * * 0",
    async () => {
      console.log("🎓 Sending mock test reminders...");
      try {
        await sendMockTestReminders();
      } catch (error) {
        console.error("❌ Mock test reminders failed:", error.message);
      }
    },
    { timezone: "UTC" }
  );

  // Learner intelligence: rebuild profiles, export ML features, scan at-risk
  cron.schedule(
    "30 0 * * *",
    () => {
      console.log("🧠 Rebuilding learner profiles & scanning at-risk...");
      try {
        const { runAtRiskScan } = require("./atRiskMonitorService");
        const { exportFeatureMatrix } = require("./featureStoreService");
        const result = runAtRiskScan({ broadcast: true });
        exportFeatureMatrix();
        console.log(`✅ Learner intelligence updated (${result.flagged} at-risk)`);
      } catch (error) {
        console.error("❌ Learner intelligence job failed:", error.message);
      }
    },
    { timezone: "UTC" }
  );

  console.log("✅ Cron jobs initialized:");
  console.log("   - Daily streak calculation (00:00 UTC)");
  console.log("   - Daily assessment generation (00:00 UTC)");
  console.log("   - Status update check (every 5 minutes)");
  console.log("   - Daily reminders (09:00 UTC)");
  console.log("   - Streak-at-risk reminders (18:00 UTC)");
  console.log("   - Personal schedule reminders (08:00 UTC)");
  console.log("   - Weekly summary emails (Sunday 08:00 UTC)");
  console.log("   - Mock test reminders (Sunday 10:00 UTC)");
  console.log("   - Learner profiles + at-risk scan (00:30 UTC)");
}

function checkAtRiskStudents() {
  const { broadcastAtRiskAlert } = require("./eventBroadcaster");
  const students = getAllStudentsEngagement();
  const atRiskStudents = students.filter((s) => s.status === "At_Risk");

  if (atRiskStudents.length > 0) {
    atRiskStudents.forEach((student) => {
      broadcastAtRiskAlert(student.studentId, {
        status: student.status,
        lastActivity: student.lastActivity,
        currentStreak: student.currentStreak,
      });
    });
  }
}

async function sendDailyReminders() {
  const engagementStudents = getAllStudentsEngagement();
  const allIds = engagementStudents.map((s) => s.studentId);
  const eligibleIds = new Set([
    ...getStudentsForNotificationType("dailyReminders", "browser", allIds),
    ...getStudentsForNotificationType("dailyReminders", "email", allIds),
  ]);

  const inactiveToday = engagementStudents.filter(
    (s) =>
      (s.status === "Inactive" || s.status === "At_Risk") &&
      eligibleIds.has(s.studentId)
  );

  console.log(`📬 Processing daily reminders for ${inactiveToday.length} students`);

  for (const student of inactiveToday) {
    await notifyDailyPracticeReminder(student.studentId, {
      streak: student.currentStreak || 0,
      technology: student.activeTechnology || "JavaScript",
    });
  }
}

async function sendStreakAtRiskReminders() {
  const fs = require("fs");
  const path = require("path");
  const STREAKS_FILE = path.join(__dirname, "../data/engagement/streaks.json");

  let streaks = {};
  try {
    if (fs.existsSync(STREAKS_FILE)) {
      streaks = JSON.parse(fs.readFileSync(STREAKS_FILE, "utf8"));
    }
  } catch {
    return;
  }

  for (const [studentId, streak] of Object.entries(streaks)) {
    if (!streak?.streakAtRisk || (streak.currentStreak || 0) < 1) continue;
    if (!shouldSendStreakAlertNow(studentId)) continue;

    const result = await notifyStreakAtRisk(studentId, {
      streak: streak.currentStreak,
      hoursRemaining: 6,
      daysSincePractice: 1,
    });

    if (result.browser.sent || result.email.sent) {
      recordStreakAlertSent(studentId);
    }
  }
}

async function sendWeeklySummaryEmails() {
  const { shouldSendWeeklyEmailNow, canSendNotification } = require("./notificationPreferencesService");
  const students = getAllStudentsEngagement();

  for (const student of students) {
    if (!canSendNotification(student.studentId, "progressAlerts", "email")) continue;
    if (!shouldSendWeeklyEmailNow(student.studentId)) continue;

    const analytics = getStudentDashboardAnalytics(student.studentId);
    const last7Days = analytics.last30Days?.slice(-7) || [];
    const activeDays = last7Days.filter((d) => d.activitiesCompleted > 0).length;
    const totalActivities = last7Days.reduce(
      (sum, d) => sum + d.activitiesCompleted,
      0
    );
    const scores = last7Days.filter((d) => d.averageScore > 0).map((d) => d.averageScore);
    const averageScore =
      scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

    await notifyWeeklyProgress(student.studentId, {
      activeDays,
      totalActivities,
      averageScore,
      currentStreak: student.currentStreak || 0,
      technologiesPracticed:
        analytics.topicsProgress?.map((t) => t.technology) || [],
      weakAreas: analytics.weakAreas || [],
      engagementScore: analytics.engagementScore || 0,
    });
  }
}

async function sendMockTestReminders() {
  const engagementStudents = getAllStudentsEngagement();
  const allIds = engagementStudents.map((s) => s.studentId);
  const students = getStudentsForNotificationType("mockTestReminders", "browser", allIds);

  for (const studentId of students) {
    const student = engagementStudents.find((s) => s.studentId === studentId);
    if (!student || student.status === "Inactive") continue;

    await notifyMockTestReminder(studentId, {
      technologies: [student.activeTechnology || "JavaScript"],
      timeUntilTest: "this week",
    });
  }
}

module.exports = {
  initializeCronJobs,
};
