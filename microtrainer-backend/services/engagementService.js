/**
 * Engagement Service
 * 
 * Tracks student engagement, activity, status, and streaks.
 * All assessments are technology-specific based on active Learning Path.
 */

const fs = require('fs');
const path = require('path');

// Data storage paths
const DATA_DIR = path.join(__dirname, '../data/engagement');
const ENGAGEMENT_FILE = path.join(DATA_DIR, 'students_engagement.json');
const DAILY_ACTIVITIES_FILE = path.join(DATA_DIR, 'daily_activities.json');
const STREAKS_FILE = path.join(DATA_DIR, 'streaks.json');
const STATUS_HISTORY_FILE = path.join(DATA_DIR, 'status_history.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize data files if they don't exist
function initializeDataFiles() {
  if (!fs.existsSync(ENGAGEMENT_FILE)) {
    fs.writeFileSync(ENGAGEMENT_FILE, JSON.stringify({}));
  }
  if (!fs.existsSync(DAILY_ACTIVITIES_FILE)) {
    fs.writeFileSync(DAILY_ACTIVITIES_FILE, JSON.stringify({}));
  }
  if (!fs.existsSync(STREAKS_FILE)) {
    fs.writeFileSync(STREAKS_FILE, JSON.stringify({}));
  }
  if (!fs.existsSync(STATUS_HISTORY_FILE)) {
    fs.writeFileSync(STATUS_HISTORY_FILE, JSON.stringify({}));
  }
}

initializeDataFiles();

// Load data from files
function loadEngagementData() {
  try {
    return JSON.parse(fs.readFileSync(ENGAGEMENT_FILE, 'utf8'));
  } catch (error) {
    console.error('Error loading engagement data:', error);
    return {};
  }
}

function loadDailyActivities() {
  try {
    return JSON.parse(fs.readFileSync(DAILY_ACTIVITIES_FILE, 'utf8'));
  } catch (error) {
    console.error('Error loading daily activities:', error);
    return {};
  }
}

function loadStreaks() {
  try {
    return JSON.parse(fs.readFileSync(STREAKS_FILE, 'utf8'));
  } catch (error) {
    console.error('Error loading streaks:', error);
    return {};
  }
}

function loadStatusHistory() {
  try {
    return JSON.parse(fs.readFileSync(STATUS_HISTORY_FILE, 'utf8'));
  } catch (error) {
    console.error('Error loading status history:', error);
    return {};
  }
}

// Save data to files
function saveEngagementData(data) {
  fs.writeFileSync(ENGAGEMENT_FILE, JSON.stringify(data, null, 2));
}

function saveDailyActivities(data) {
  fs.writeFileSync(DAILY_ACTIVITIES_FILE, JSON.stringify(data, null, 2));
}

function saveStreaks(data) {
  fs.writeFileSync(STREAKS_FILE, JSON.stringify(data, null, 2));
}

function saveStatusHistory(data) {
  fs.writeFileSync(STATUS_HISTORY_FILE, JSON.stringify(data, null, 2));
}

/**
 * Get today's date string (YYYY-MM-DD)
 */
function getTodayDateString() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Calculate student status based on activity
 * 
 * Status Rules:
 * - Excelling: 5+ activities today, avg score > 85%
 * - Active: 1+ activities today
 * - At_Risk: No activity in 2+ days
 * - Inactive: No activity in 7+ days
 */
function calculateStatus(studentId) {
  const dailyActivities = loadDailyActivities();
  const today = getTodayDateString();
  const todayKey = `${studentId}_${today}`;
  const todayActivity = dailyActivities[todayKey];
  
  // Check recent activity
  const now = new Date();
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  let hasRecentActivity = false;
  let lastActivityDate = null;
  
  // Check last 7 days for any activity
  for (let i = 0; i < 7; i++) {
    const checkDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = checkDate.toISOString().split('T')[0];
    const key = `${studentId}_${dateStr}`;
    
    if (dailyActivities[key] && dailyActivities[key].totalActivities > 0) {
      hasRecentActivity = true;
      if (!lastActivityDate || checkDate > lastActivityDate) {
        lastActivityDate = checkDate;
      }
    }
  }
  
  // Determine status
  if (todayActivity && todayActivity.totalActivities >= 5 && todayActivity.averageScore >= 85) {
    return 'Excelling';
  } else if (todayActivity && todayActivity.totalActivities > 0) {
    return 'Active';
  } else if (lastActivityDate && lastActivityDate >= twoDaysAgo) {
    return 'Active'; // Active within last 2 days
  } else if (lastActivityDate && lastActivityDate >= sevenDaysAgo) {
    return 'At_Risk'; // No activity in 2-7 days
  } else {
    return 'Inactive'; // No activity in 7+ days
  }
}

/**
 * Calculate engagement score (0-100)
 * 
 * Based on:
 * - Activity frequency (40%)
 * - Average scores (30%)
 * - Streak (20%)
 * - Consistency (10%)
 */
function calculateEngagementScore(studentId) {
  const dailyActivities = loadDailyActivities();
  const streaks = loadStreaks();
  const streak = streaks[studentId] || { currentStreak: 0 };
  
  // Get last 30 days of activity
  const now = new Date();
  let totalActivities = 0;
  let totalScore = 0;
  let scoreCount = 0;
  let activeDays = 0;
  
  for (let i = 0; i < 30; i++) {
    const checkDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = checkDate.toISOString().split('T')[0];
    const key = `${studentId}_${dateStr}`;
    const activity = dailyActivities[key];
    
    if (activity && activity.totalActivities > 0) {
      totalActivities += activity.totalActivities;
      activeDays++;
      
      if (activity.averageScore) {
        totalScore += activity.averageScore;
        scoreCount++;
      }
    }
  }
  
  // Calculate components
  const activityScore = Math.min((totalActivities / 30) * 100, 40); // Max 40 points
  const averageScore = scoreCount > 0 ? (totalScore / scoreCount) * 0.3 : 0; // Max 30 points
  const streakScore = Math.min(streak.currentStreak * 2, 20); // Max 20 points
  const consistencyScore = (activeDays / 30) * 10; // Max 10 points
  
  return Math.round(activityScore + averageScore + streakScore + consistencyScore);
}

/**
 * Record student activity
 */
function recordActivity(studentId, activityType, technology, conceptId, timeSpent, score) {
  const today = getTodayDateString();
  const todayKey = `${studentId}_${today}`;
  
  // Load current data
  const dailyActivities = loadDailyActivities();
  const engagementData = loadEngagementData();
  const statusHistory = loadStatusHistory();
  
  // Get or create today's activity
  if (!dailyActivities[todayKey]) {
    dailyActivities[todayKey] = {
      studentId,
      date: today,
      activities: [],
      totalTimeSpent: 0,
      totalActivities: 0,
      averageScore: 0,
      technologiesPracticed: [],
      status: 'Active'
    };
  }
  
  const todayActivity = dailyActivities[todayKey];
  
  // Add activity
  todayActivity.activities.push({
    type: activityType,
    technology,
    conceptId,
    timeSpent,
    score,
    timestamp: new Date().toISOString()
  });
  
  // Update totals
  todayActivity.totalActivities++;
  todayActivity.totalTimeSpent += timeSpent || 0;
  
  // Update technologies practiced
  if (technology && !todayActivity.technologiesPracticed.includes(technology)) {
    todayActivity.technologiesPracticed.push(technology);
  }
  
  // Update average score
  const scores = todayActivity.activities
    .filter(a => a.score !== null && a.score !== undefined)
    .map(a => a.score);
  
  if (scores.length > 0) {
    todayActivity.averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  }
  
  // Calculate new status
  const newStatus = calculateStatus(studentId);
  todayActivity.status = newStatus;
  
  // Update engagement data
  if (!engagementData[studentId]) {
    engagementData[studentId] = {
      studentId,
      currentStatus: newStatus,
      currentStreak: 0,
      longestStreak: 0,
      lastPracticeDate: today,
      engagementScore: 0,
      activeTechnology: technology,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
  
  engagementData[studentId].currentStatus = newStatus;
  engagementData[studentId].lastPracticeDate = today;
  engagementData[studentId].activeTechnology = technology;
  engagementData[studentId].engagementScore = calculateEngagementScore(studentId);
  engagementData[studentId].updatedAt = new Date().toISOString();
  
  // Add to status history
  if (!statusHistory[studentId]) {
    statusHistory[studentId] = [];
  }
  
  statusHistory[studentId].push({
    date: today,
    status: newStatus,
    activitiesCompleted: todayActivity.totalActivities,
    scores: scores,
    timeSpent: todayActivity.totalTimeSpent,
    technologiesPracticed: todayActivity.technologiesPracticed,
    engagementScore: engagementData[studentId].engagementScore,
    createdAt: new Date().toISOString()
  });
  
  // Save all data
  saveDailyActivities(dailyActivities);
  saveEngagementData(engagementData);
  saveStatusHistory(statusHistory);
  
  // Update streak
  updateStreak(studentId);
  
  return {
    status: newStatus,
    todaySummary: {
      activitiesCompleted: todayActivity.totalActivities,
      timeSpent: todayActivity.totalTimeSpent,
      assessmentsTaken: todayActivity.activities.filter(a => 
        a.type === 'mini_assessment' || a.type === 'mock_test'
      ).length,
      averageScore: todayActivity.averageScore
    }
  };
}

/**
 * Get student engagement status
 */
function getStudentStatus(studentId) {
  const engagementData = loadEngagementData();
  const dailyActivities = loadDailyActivities();
  const streaks = loadStreaks();
  const statusHistory = loadStatusHistory();
  
  const today = getTodayDateString();
  const todayKey = `${studentId}_${today}`;
  
  const engagement = engagementData[studentId] || {
    studentId,
    currentStatus: 'Inactive',
    currentStreak: 0,
    longestStreak: 0,
    lastPracticeDate: null,
    engagementScore: 0,
    activeTechnology: null
  };
  
  const todayActivity = dailyActivities[todayKey] || {
    totalActivities: 0,
    totalTimeSpent: 0,
    averageScore: 0,
    technologiesPracticed: []
  };
  
  const streak = streaks[studentId] || {
    currentStreak: 0,
    longestStreak: 0,
    lastPracticeDate: null,
    streakHistory: []
  };
  
  const history = statusHistory[studentId] || [];
  
  return {
    status: engagement.currentStatus,
    streak: streak.currentStreak,
    longestStreak: streak.longestStreak,
    engagementScore: engagement.engagementScore,
    activeTechnology: engagement.activeTechnology,
    lastPracticeDate: engagement.lastPracticeDate,
    todaySummary: {
      activitiesCompleted: todayActivity.totalActivities,
      timeSpent: todayActivity.totalTimeSpent,
      assessmentsTaken: todayActivity.activities ? todayActivity.activities.filter(a => 
        a.type === 'mini_assessment' || a.type === 'mock_test'
      ).length : 0,
      averageScore: todayActivity.averageScore,
      technologiesPracticed: todayActivity.technologiesPracticed
    },
    statusHistory: history.slice(-30) // Last 30 days
  };
}

/**
 * Update student streak
 */
function updateStreak(studentId) {
  const streaks = loadStreaks();
  const dailyActivities = loadDailyActivities();
  const today = getTodayDateString();
  
  if (!streaks[studentId]) {
    streaks[studentId] = {
      studentId,
      currentStreak: 0,
      longestStreak: 0,
      lastPracticeDate: null,
      streakHistory: [],
      streakAtRisk: false,
      updatedAt: new Date().toISOString()
    };
  }
  
  const streak = streaks[studentId];
  const lastPracticeDate = streak.lastPracticeDate;
  
  // Check if practiced today
  const todayKey = `${studentId}_${today}`;
  const todayActivity = dailyActivities[todayKey];
  const practicedToday = todayActivity && todayActivity.totalActivities > 0;
  
  if (practicedToday) {
    // Check if this is a new day
    if (lastPracticeDate !== today) {
      // Check if yesterday was practiced (streak continues)
      const yesterday = new Date(new Date().getTime() - 24 * 60 * 60 * 1000)
        .toISOString().split('T')[0];
      
      if (lastPracticeDate === yesterday) {
        // Streak continues
        streak.currentStreak++;
      } else if (!lastPracticeDate) {
        // First day
        streak.currentStreak = 1;
      } else {
        // Streak broken, start new
        streak.currentStreak = 1;
      }
      
      // Update longest streak
      if (streak.currentStreak > streak.longestStreak) {
        streak.longestStreak = streak.currentStreak;
      }
      
      // Update last practice date
      streak.lastPracticeDate = today;
      
      // Add to history
      streak.streakHistory.push({
        date: today,
        practiced: true,
        activitiesCompleted: todayActivity.totalActivities
      });
      
      // Keep only last 90 days of history
      if (streak.streakHistory.length > 90) {
        streak.streakHistory = streak.streakHistory.slice(-90);
      }
    }
    
    streak.streakAtRisk = false;
  } else {
    // Check if streak is at risk (no practice today)
    const yesterday = new Date(new Date().getTime() - 24 * 60 * 60 * 1000)
      .toISOString().split('T')[0];
    
    if (lastPracticeDate === yesterday) {
      streak.streakAtRisk = true;
    } else if (lastPracticeDate && lastPracticeDate < yesterday) {
      // Streak broken
      streak.currentStreak = 0;
      streak.streakAtRisk = false;
    }
  }
  
  streak.updatedAt = new Date().toISOString();
  
  // Update engagement data with streak
  const engagementData = loadEngagementData();
  if (engagementData[studentId]) {
    engagementData[studentId].currentStreak = streak.currentStreak;
    engagementData[studentId].longestStreak = streak.longestStreak;
    saveEngagementData(engagementData);
  }
  
  saveStreaks(streaks);
  
  return streak;
}

/**
 * Get student streak information
 */
function getStudentStreak(studentId) {
  const streaks = loadStreaks();
  const streak = streaks[studentId] || {
    currentStreak: 0,
    longestStreak: 0,
    lastPracticeDate: null,
    streakHistory: [],
    streakAtRisk: false
  };
  
  // Generate 30-day calendar
  const calendar = [];
  const now = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];
    
    const historyEntry = streak.streakHistory.find(h => h.date === dateStr);
    
    calendar.push({
      date: dateStr,
      practiced: historyEntry ? historyEntry.practiced : false,
      activitiesCompleted: historyEntry ? historyEntry.activitiesCompleted : 0
    });
  }
  
  return {
    currentStreak: streak.currentStreak,
    longestStreak: streak.longestStreak,
    streakAtRisk: streak.streakAtRisk,
    lastPracticeDate: streak.lastPracticeDate,
    calendar
  };
}

/**
 * Calculate streaks for all students (run at midnight)
 */
function calculateAllStreaks() {
  const engagementData = loadEngagementData();
  const studentIds = Object.keys(engagementData);
  
  let streaksUpdated = 0;
  
  studentIds.forEach(studentId => {
    updateStreak(studentId);
    streaksUpdated++;
  });
  
  console.log(`✅ Calculated streaks for ${streaksUpdated} students`);
  
  return {
    studentsProcessed: studentIds.length,
    streaksUpdated
  };
}

/**
 * Get all students' engagement data (for admin dashboard)
 */
function getAllStudentsEngagement() {
  const engagementData = loadEngagementData();
  const dailyActivities = loadDailyActivities();
  const today = getTodayDateString();
  
  return Object.keys(engagementData).map(studentId => {
    const engagement = engagementData[studentId];
    const todayKey = `${studentId}_${today}`;
    const todayActivity = dailyActivities[todayKey] || {
      totalActivities: 0,
      totalTimeSpent: 0,
      averageScore: 0
    };
    
    return {
      studentId,
      status: engagement.currentStatus,
      lastActivity: engagement.lastPracticeDate,
      todayActivities: todayActivity.totalActivities,
      currentStreak: engagement.currentStreak,
      todayScore: todayActivity.averageScore,
      timeSpentToday: todayActivity.totalTimeSpent,
      engagementScore: engagement.engagementScore,
      activeTechnology: engagement.activeTechnology
    };
  });
}

module.exports = {
  recordActivity,
  getStudentStatus,
  getStudentStreak,
  updateStreak,
  calculateAllStreaks,
  getAllStudentsEngagement,
  calculateStatus,
  calculateEngagementScore
};
