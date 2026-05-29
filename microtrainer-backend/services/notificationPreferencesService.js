/**
 * Notification Preferences Service
 * 
 * Manages student notification preferences
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data/notifications');
const PREFERENCES_FILE = path.join(DATA_DIR, 'preferences.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize preferences file
if (!fs.existsSync(PREFERENCES_FILE)) {
  fs.writeFileSync(PREFERENCES_FILE, JSON.stringify({}));
}

// Default preferences
const DEFAULT_PREFERENCES = {
  browserNotifications: false,
  emailNotifications: true,
  frequency: 'daily',
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
  notificationTypes: {
    dailyReminders: true,
    streakAlerts: true,
    mockTestReminders: true,
    progressAlerts: true,
    badgeEarned: true,
    assessmentAvailable: true
  }
};

/**
 * Load preferences from file
 */
function loadPreferences() {
  try {
    return JSON.parse(fs.readFileSync(PREFERENCES_FILE, 'utf8'));
  } catch (error) {
    console.error('Error loading preferences:', error);
    return {};
  }
}

/**
 * Save preferences to file
 */
function savePreferences(preferences) {
  fs.writeFileSync(PREFERENCES_FILE, JSON.stringify(preferences, null, 2));
}

/**
 * Get student notification preferences
 */
function getNotificationPreferences(studentId) {
  const allPreferences = loadPreferences();
  return allPreferences[studentId] || DEFAULT_PREFERENCES;
}

/**
 * Save student notification preferences
 */
function saveNotificationPreferences(studentId, preferences) {
  const allPreferences = loadPreferences();
  allPreferences[studentId] = {
    ...DEFAULT_PREFERENCES,
    ...preferences,
    notificationTypes: {
      ...DEFAULT_PREFERENCES.notificationTypes,
      ...(preferences.notificationTypes || {}),
    },
    updatedAt: new Date().toISOString()
  };
  savePreferences(allPreferences);
  console.log(`✅ Notification preferences saved for ${studentId}`);
}

/**
 * Check if student should receive notification at this time
 */
function shouldSendNotification(studentId, notificationType) {
  const preferences = getNotificationPreferences(studentId);
  
  // Check if notification type is enabled
  if (!preferences.notificationTypes[notificationType]) {
    return false;
  }
  
  // Check quiet hours
  if (preferences.quietHoursEnabled) {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const start = preferences.quietHoursStart;
    const end = preferences.quietHoursEnd;
    
    // Handle quiet hours that span midnight
    if (start > end) {
      if (currentTime >= start || currentTime < end) {
        return false; // In quiet hours
      }
    } else {
      if (currentTime >= start && currentTime < end) {
        return false; // In quiet hours
      }
    }
  }
  
  return true;
}

/**
 * Get all students who want a specific notification type
 */
function getStudentsForNotificationType(notificationType, channel = 'browser') {
  const allPreferences = loadPreferences();
  const students = [];
  
  for (const [studentId, prefs] of Object.entries(allPreferences)) {
    // Check if channel is enabled
    if (channel === 'browser' && !prefs.browserNotifications) continue;
    if (channel === 'email' && !prefs.emailNotifications) continue;
    
    // Check if notification type is enabled
    if (prefs.notificationTypes[notificationType]) {
      // Check quiet hours
      if (shouldSendNotification(studentId, notificationType)) {
        students.push(studentId);
      }
    }
  }
  
  return students;
}

module.exports = {
  getNotificationPreferences,
  saveNotificationPreferences,
  shouldSendNotification,
  getStudentsForNotificationType,
  DEFAULT_PREFERENCES
};
