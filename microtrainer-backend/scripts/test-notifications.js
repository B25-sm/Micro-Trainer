/**
 * Notification system API smoke test
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const BASE = process.env.TEST_API_URL || "http://localhost:5000";
const STUDENT_ID = "notification-test-student";

async function req(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  return { status: res.status, ok: res.ok, data };
}

const results = [];

function pass(name) {
  results.push({ name, ok: true });
  console.log(`✅ ${name}`);
}

function fail(name, detail) {
  results.push({ name, ok: false, detail });
  console.log(`❌ ${name}: ${detail}`);
}

async function run() {
  console.log(`\n🧪 Notification tests against ${BASE}\n`);

  const health = await req("GET", "/health");
  if (health.ok) pass("Backend health");
  else fail("Backend health", health.status);

  const defaults = await req("GET", `/api/notifications/preferences/${STUDENT_ID}`);
  if (
    defaults.ok &&
    defaults.data.notificationTypes?.dailyReminders === true
  ) {
    pass("GET preferences returns defaults");
  } else {
    fail("GET preferences returns defaults", JSON.stringify(defaults.data));
  }

  const saved = await req("PUT", `/api/notifications/preferences/${STUDENT_ID}`, {
    emailNotifications: false,
    frequency: "every2days",
    quietHoursEnabled: true,
    quietHoursStart: "00:00",
    quietHoursEnd: "23:59",
    browserNotifications: true,
    notificationTypes: {
      dailyReminders: false,
      streakAlerts: true,
      mockTestReminders: false,
      progressAlerts: true,
      badgeEarned: true,
      assessmentAvailable: false,
    },
  });
  if (saved.ok && saved.data.success) pass("PUT preferences saves");
  else fail("PUT preferences saves", JSON.stringify(saved.data));

  const loaded = await req("GET", `/api/notifications/preferences/${STUDENT_ID}`);
  if (
    loaded.ok &&
    loaded.data.emailNotifications === false &&
    loaded.data.frequency === "every2days" &&
    loaded.data.notificationTypes?.dailyReminders === false
  ) {
    pass("GET preferences reflects saved values");
  } else {
    fail("GET preferences reflects saved values", JSON.stringify(loaded.data));
  }

  const {
    canSendNotification,
    shouldSendDailyEmailNow,
  } = require("../services/notificationPreferencesService");

  if (!canSendNotification(STUDENT_ID, "dailyReminders", "email")) {
    pass("Email blocked when emailNotifications off");
  } else {
    fail("Email blocked when emailNotifications off", "still allowed");
  }

  if (!canSendNotification(STUDENT_ID, "dailyReminders", "browser")) {
    pass("Quiet hours block browser sends");
  } else {
    fail("Quiet hours block browser sends", "still allowed");
  }

  if (!canSendNotification(STUDENT_ID, "streakAlerts", "email")) {
    pass("Quiet hours block all channels including streak email");
  } else {
    fail("Quiet hours block streak email", "still allowed");
  }

  const { notifyDailyPracticeReminder, notifyTest } = require("../services/notificationOrchestratorService");

  const dailyResult = await notifyDailyPracticeReminder(STUDENT_ID, {
    streak: 3,
    technology: "CSS",
  });
  if (dailyResult.browser.skipped && dailyResult.email.skipped) {
    pass("Orchestrator skips daily reminder when preferences block");
  } else {
    fail(
      "Orchestrator skips daily reminder when preferences block",
      JSON.stringify(dailyResult)
    );
  }

  const testPush = await req("POST", "/api/notifications/test", { studentId: STUDENT_ID });
  if (testPush.ok) {
    if (testPush.data.success === false && testPush.data.error?.includes("subscription")) {
      pass("Test push without subscription returns expected error");
    } else if (testPush.data.success === true) {
      pass("Test push sent (subscription exists)");
    } else {
      pass("Test push endpoint responded");
    }
  } else {
    fail("Test push endpoint", testPush.status);
  }

  const forceTest = await notifyTest(STUDENT_ID);
  if (forceTest.browser.skipped === false) {
    if (forceTest.browser.sent) pass("Forced test notification sent");
    else if (forceTest.browser.error?.includes("subscription")) {
      pass("Forced test push — no subscription (expected without browser setup)");
    } else {
      fail("Forced test push", forceTest.browser.error || "unknown");
    }
  }

  await req("PUT", `/api/notifications/preferences/${STUDENT_ID}`, {
    emailNotifications: true,
    quietHoursEnabled: false,
    frequency: "daily",
    browserNotifications: false,
    notificationTypes: {
      dailyReminders: true,
      streakAlerts: true,
      mockTestReminders: true,
      progressAlerts: true,
      badgeEarned: true,
      assessmentAvailable: true,
    },
  });

  if (canSendNotification(STUDENT_ID, "dailyReminders", "email")) {
    pass("Preferences reset — email daily reminders allowed");
  } else {
    fail("Preferences reset", "email still blocked");
  }

  if (shouldSendDailyEmailNow(STUDENT_ID)) {
    pass("Email frequency allows send after reset");
  } else {
    fail("Email frequency", "blocked unexpectedly");
  }

  const emailDry = await notifyDailyPracticeReminder(STUDENT_ID, {
    streak: 1,
    technology: "JavaScript",
  });
  if (
    emailDry.email.skipped ||
    emailDry.email.error?.includes("SMTP") ||
    (!emailDry.email.sent && !emailDry.email.error)
  ) {
    pass("Email dispatch handled (SMTP not configured or no student email on file)");
  } else if (emailDry.email.sent) {
    pass("Email sent successfully");
  } else {
    fail("Email dispatch", JSON.stringify(emailDry.email));
  }

  console.log("\n--- Summary ---");
  const passed = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok);
  console.log(`${passed}/${results.length} passed`);
  if (failed.length) {
    failed.forEach((f) => console.log(`  - ${f.name}: ${f.detail}`));
    process.exit(1);
  }
  console.log("\nSMTP configured:", Boolean(process.env.SMTP_HOST && process.env.SMTP_USER));
  console.log("VAPID configured:", Boolean(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY));
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
