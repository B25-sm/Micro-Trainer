/**
 * Push Notification Service
 * 
 * Handles browser push notifications using web-push library
 */

const webpush = require('web-push');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data/notifications');
const SUBSCRIPTIONS_FILE = path.join(DATA_DIR, 'push-subscriptions.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize subscriptions file
if (!fs.existsSync(SUBSCRIPTIONS_FILE)) {
  fs.writeFileSync(SUBSCRIPTIONS_FILE, JSON.stringify({}));
}

// Configure web-push with VAPID keys
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@microtrainer.com';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    VAPID_SUBJECT,
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
  console.log('✅ Web Push configured with VAPID keys');
} else {
  console.warn('⚠️  VAPID keys not configured. Push notifications will not work.');
  console.warn('   Generate keys with: npx web-push generate-vapid-keys');
}

/**
 * Load subscriptions from file
 */
function loadSubscriptions() {
  try {
    return JSON.parse(fs.readFileSync(SUBSCRIPTIONS_FILE, 'utf8'));
  } catch (error) {
    console.error('Error loading subscriptions:', error);
    return {};
  }
}

/**
 * Save subscriptions to file
 */
function saveSubscriptions(subscriptions) {
  fs.writeFileSync(SUBSCRIPTIONS_FILE, JSON.stringify(subscriptions, null, 2));
}

/**
 * Subscribe a student to push notifications
 */
function subscribe(studentId, subscription) {
  const subscriptions = loadSubscriptions();
  subscriptions[studentId] = {
    subscription,
    subscribedAt: new Date().toISOString()
  };
  saveSubscriptions(subscriptions);
  console.log(`✅ Student ${studentId} subscribed to push notifications`);
  return true;
}

/**
 * Unsubscribe a student from push notifications
 */
function unsubscribe(studentId) {
  const subscriptions = loadSubscriptions();
  delete subscriptions[studentId];
  saveSubscriptions(subscriptions);
  console.log(`✅ Student ${studentId} unsubscribed from push notifications`);
  return true;
}

/**
 * Get student's subscription
 */
function getSubscription(studentId) {
  const subscriptions = loadSubscriptions();
  return subscriptions[studentId]?.subscription || null;
}

/**
 * Send push notification to a student
 */
async function sendPushNotification(studentId, payload) {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.warn('⚠️  Cannot send push notification: VAPID keys not configured');
    return { success: false, error: 'VAPID keys not configured' };
  }

  const subscription = getSubscription(studentId);
  
  if (!subscription) {
    console.warn(`⚠️  No push subscription found for student ${studentId}`);
    return { success: false, error: 'No subscription found' };
  }

  try {
    const payloadString = JSON.stringify(payload);
    
    await webpush.sendNotification(subscription, payloadString);
    
    console.log(`✅ Push notification sent to ${studentId}`);
    return { success: true };
  } catch (error) {
    console.error(`❌ Failed to send push notification to ${studentId}:`, error);
    
    // If subscription is invalid, remove it
    if (error.statusCode === 410) {
      console.log(`🗑️  Removing invalid subscription for ${studentId}`);
      unsubscribe(studentId);
    }
    
    return { success: false, error: error.message };
  }
}

/**
 * Send daily practice reminder
 */
async function sendDailyPracticeReminder(studentId, streak, technology) {
  const payload = {
    title: '🎯 Time to Practice!',
    body: `Keep your ${streak}-day streak alive! Practice ${technology} today.`,
    icon: '/notification-icon.png',
    badge: '/notification-icon.png',
    tag: 'daily-reminder',
    url: '/engagement',
    data: {
      type: 'daily_reminder',
      streak,
      technology
    }
  };
  
  return sendPushNotification(studentId, payload);
}

/**
 * Send streak risk alert
 */
async function sendStreakRiskAlert(studentId, streak, hoursRemaining) {
  const payload = {
    title: '⚠️ Streak at Risk!',
    body: `Your ${streak}-day streak ends in ${hoursRemaining} hours! Practice now to keep it alive.`,
    icon: '/notification-icon.png',
    badge: '/notification-icon.png',
    tag: 'streak-risk',
    requireInteraction: true,
    url: '/engagement',
    data: {
      type: 'streak_risk',
      streak,
      hoursRemaining
    }
  };
  
  return sendPushNotification(studentId, payload);
}

/**
 * Send badge earned notification
 */
async function sendBadgeEarnedNotification(studentId, badgeName, badgeIcon) {
  const payload = {
    title: '🎉 Badge Earned!',
    body: `Congratulations! You earned the "${badgeName}" badge!`,
    icon: '/notification-icon.png',
    badge: '/notification-icon.png',
    tag: 'badge-earned',
    url: '/engagement',
    data: {
      type: 'badge_earned',
      badgeName,
      badgeIcon
    }
  };
  
  return sendPushNotification(studentId, payload);
}

/**
 * Send assessment available notification
 */
async function sendAssessmentAvailableNotification(studentId, technology) {
  const payload = {
    title: '📝 New Assessment Available!',
    body: `Your ${technology} mini-assessment is ready. Take it now!`,
    icon: '/notification-icon.png',
    badge: '/notification-icon.png',
    tag: 'assessment-available',
    url: '/engagement',
    data: {
      type: 'assessment_available',
      technology
    }
  };
  
  return sendPushNotification(studentId, payload);
}

/**
 * Send mock test reminder
 */
async function sendMockTestReminder(studentId, technologies, timeUntilTest) {
  const payload = {
    title: '🎓 Mock Test Reminder',
    body: `Your ${technologies.join(', ')} mock test starts in ${timeUntilTest}!`,
    icon: '/notification-icon.png',
    badge: '/notification-icon.png',
    tag: 'mock-test-reminder',
    requireInteraction: true,
    url: '/engagement',
    data: {
      type: 'mock_test_reminder',
      technologies,
      timeUntilTest
    }
  };
  
  return sendPushNotification(studentId, payload);
}

/**
 * Personal schedule daily / progress reminder
 */
async function sendSchedulePlanReminder(studentId, { title, body, reminderType }) {
  const payload = {
    title: title || "📅 Your study plan",
    body: body || "Check today's concepts on your Personal Schedule.",
    icon: "/notification-icon.png",
    badge: "/notification-icon.png",
    tag: `schedule-${reminderType || "daily"}`,
    url: "/schedule",
    data: {
      type: "personal_schedule",
      reminderType: reminderType || "daily",
    },
  };

  return sendPushNotification(studentId, payload);
}

/**
 * Send test notification
 */
async function sendTestNotification(studentId) {
  const payload = {
    title: '✅ Test Notification',
    body: 'Push notifications are working! You will receive reminders and updates here.',
    icon: '/notification-icon.png',
    badge: '/notification-icon.png',
    tag: 'test-notification',
    url: '/engagement',
    data: {
      type: 'test'
    }
  };
  
  return sendPushNotification(studentId, payload);
}

/**
 * Get all subscribed students
 */
function getAllSubscribedStudents() {
  const subscriptions = loadSubscriptions();
  return Object.keys(subscriptions);
}

module.exports = {
  subscribe,
  unsubscribe,
  getSubscription,
  sendPushNotification,
  sendDailyPracticeReminder,
  sendStreakRiskAlert,
  sendBadgeEarnedNotification,
  sendAssessmentAvailableNotification,
  sendMockTestReminder,
  sendSchedulePlanReminder,
  sendTestNotification,
  getAllSubscribedStudents
};
