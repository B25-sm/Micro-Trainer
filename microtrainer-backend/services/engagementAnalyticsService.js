/**
 * Engagement Analytics Service
 * 
 * Provides analytics for student engagement dashboard and admin monitoring
 */

const fs = require('fs');
const path = require('path');
const { getStudentStatus, getAllStudentsEngagement } = require('./engagementService');
const { getStudentBadges } = require('./badgeService');

const DATA_DIR = path.join(__dirname, '../data/engagement');
const DAILY_ACTIVITIES_FILE = path.join(DATA_DIR, 'daily_activities.json');
const ASSESSMENTS_FILE = path.join(DATA_DIR, 'mini_assessments.json');

/**
 * Load data files
 */
function loadDailyActivities() {
  try {
    return JSON.parse(fs.readFileSync(DAILY_ACTIVITIES_FILE, 'utf8'));
  } catch (error) {
    return {};
  }
}

function loadAssessments() {
  try {
    return JSON.parse(fs.readFileSync(ASSESSMENTS_FILE, 'utf8'));
  } catch (error) {
    return {};
  }
}

/**
 * Get student dashboard analytics
 */
function getStudentDashboardAnalytics(studentId) {
  const status = getStudentStatus(studentId);
  const badges = getStudentBadges(studentId);
  const dailyActivities = loadDailyActivities();
  const assessments = loadAssessments();
  
  // Get last 30 days of activity
  const last30Days = [];
  const now = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];
    const key = `${studentId}_${dateStr}`;
    const activity = dailyActivities[key];
    
    last30Days.push({
      date: dateStr,
      activitiesCompleted: activity ? activity.totalActivities : 0,
      timeSpent: activity ? activity.totalTimeSpent : 0,
      averageScore: activity ? activity.averageScore : 0
    });
  }
  
  // Get topics progress (from assessments)
  const topicsProgress = {};
  Object.values(assessments)
    .filter(a => a.studentId === studentId && a.status === 'completed')
    .forEach(assessment => {
      const tech = assessment.technology;
      if (!topicsProgress[tech]) {
        topicsProgress[tech] = {
          technology: tech,
          assessmentsTaken: 0,
          averageScore: 0,
          totalScore: 0
        };
      }
      topicsProgress[tech].assessmentsTaken++;
      topicsProgress[tech].totalScore += assessment.result.score;
      topicsProgress[tech].averageScore = 
        topicsProgress[tech].totalScore / topicsProgress[tech].assessmentsTaken;
    });
  
  // Identify weak areas
  const weakAreas = [];
  Object.values(assessments)
    .filter(a => a.studentId === studentId && a.status === 'completed')
    .forEach(assessment => {
      if (assessment.result && assessment.result.weakAreas) {
        weakAreas.push(...assessment.result.weakAreas);
      }
    });
  
  const uniqueWeakAreas = [...new Set(weakAreas)].slice(0, 5);
  
  return {
    engagementScore: status.engagementScore,
    todayActivity: {
      status: status.status,
      activitiesCompleted: status.todaySummary.activitiesCompleted,
      timeSpent: status.todaySummary.timeSpent,
      score: status.todaySummary.averageScore
    },
    last30Days,
    topicsProgress: Object.values(topicsProgress),
    weakAreas: uniqueWeakAreas,
    upcomingMockTests: [], // TODO: Implement mock test scheduling
    badges: badges.map(b => ({
      id: b.id,
      name: b.name,
      description: b.description,
      icon: b.icon,
      earnedAt: b.earnedAt
    })),
    streak: {
      current: status.streak,
      longest: status.longestStreak
    }
  };
}

/**
 * Get admin dashboard - all students
 */
function getAdminStudentsList(filter = null, sortBy = 'last_activity', limit = 50, offset = 0) {
  const allStudents = getAllStudentsEngagement();
  
  // Apply filter
  let filtered = allStudents;
  if (filter) {
    switch (filter) {
      case 'active_today':
        filtered = allStudents.filter(s => s.todayActivities > 0);
        break;
      case 'inactive_today':
        filtered = allStudents.filter(s => s.todayActivities === 0);
        break;
      case 'at_risk':
        filtered = allStudents.filter(s => s.status === 'At_Risk');
        break;
      case 'high_performers':
        filtered = allStudents.filter(s => s.status === 'Excelling');
        break;
    }
  }
  
  // Apply sorting
  switch (sortBy) {
    case 'last_activity':
      filtered.sort((a, b) => {
        const dateA = new Date(a.lastActivity || 0);
        const dateB = new Date(b.lastActivity || 0);
        return dateB - dateA;
      });
      break;
    case 'streak':
      filtered.sort((a, b) => b.currentStreak - a.currentStreak);
      break;
    case 'score':
      filtered.sort((a, b) => b.todayScore - a.todayScore);
      break;
    case 'time_spent':
      filtered.sort((a, b) => b.timeSpentToday - a.timeSpentToday);
      break;
  }
  
  // Apply pagination
  const paginated = filtered.slice(offset, offset + limit);
  
  // Calculate aggregate metrics
  const aggregateMetrics = {
    totalActiveToday: allStudents.filter(s => s.todayActivities > 0).length,
    averageEngagementScore: allStudents.length > 0
      ? Math.round(allStudents.reduce((sum, s) => sum + s.engagementScore, 0) / allStudents.length)
      : 0,
    totalAssessmentsCompleted: 0 // TODO: Calculate from assessments
  };
  
  return {
    students: paginated.map(s => ({
      studentId: s.studentId,
      name: s.studentId, // TODO: Get actual name from student profile
      status: s.status,
      lastActivity: s.lastActivity,
      todayActivities: s.todayActivities,
      currentStreak: s.currentStreak,
      todayScore: Math.round(s.todayScore),
      timeSpentToday: s.timeSpentToday,
      engagementScore: s.engagementScore,
      activeTechnology: s.activeTechnology
    })),
    aggregateMetrics,
    total: filtered.length,
    limit,
    offset
  };
}

/**
 * Get activity feed for admin dashboard
 */
function getActivityFeed(limit = 20, since = null) {
  const dailyActivities = loadDailyActivities();
  const activities = [];
  
  // Get all activities
  Object.values(dailyActivities).forEach(dayActivity => {
    if (dayActivity.activities) {
      dayActivity.activities.forEach(activity => {
        activities.push({
          studentId: dayActivity.studentId,
          studentName: dayActivity.studentId, // TODO: Get actual name
          action: activity.type,
          technology: activity.technology,
          score: activity.score,
          timestamp: activity.timestamp
        });
      });
    }
  });
  
  // Sort by timestamp (most recent first)
  activities.sort((a, b) => {
    const dateA = new Date(a.timestamp);
    const dateB = new Date(b.timestamp);
    return dateB - dateA;
  });
  
  // Filter by since if provided
  let filtered = activities;
  if (since) {
    const sinceDate = new Date(since);
    filtered = activities.filter(a => new Date(a.timestamp) > sinceDate);
  }
  
  // Limit results
  return filtered.slice(0, limit);
}

/**
 * Get student detail for admin modal
 */
function getStudentDetail(studentId) {
  const status = getStudentStatus(studentId);
  const dailyActivities = loadDailyActivities();
  const today = new Date().toISOString().split('T')[0];
  const todayKey = `${studentId}_${today}`;
  const todayActivity = dailyActivities[todayKey];
  
  // Get today's activities breakdown
  const todayActivities = todayActivity && todayActivity.activities
    ? todayActivity.activities.map(a => ({
        type: a.type,
        technology: a.technology,
        conceptId: a.conceptId,
        timeSpent: a.timeSpent,
        score: a.score,
        timestamp: a.timestamp
      }))
    : [];
  
  // Get technologies studied
  const technologiesStudied = todayActivity && todayActivity.technologiesPracticed
    ? todayActivity.technologiesPracticed
    : [];
  
  // Get concepts completed (from activities)
  const conceptsCompleted = todayActivities
    .filter(a => a.conceptId)
    .map(a => a.conceptId);
  
  // Get assessment scores
  const assessments = loadAssessments();
  const assessmentScores = Object.values(assessments)
    .filter(a => a.studentId === studentId && a.status === 'completed')
    .slice(-5) // Last 5 assessments
    .map(a => ({
      technology: a.technology,
      score: a.result.score,
      date: a.generatedDate
    }));
  
  // Time breakdown by technology
  const timeBreakdown = {};
  todayActivities.forEach(a => {
    if (a.technology) {
      if (!timeBreakdown[a.technology]) {
        timeBreakdown[a.technology] = 0;
      }
      timeBreakdown[a.technology] += a.timeSpent || 0;
    }
  });
  
  return {
    studentId,
    status: status.status,
    engagementScore: status.engagementScore,
    streak: status.streak,
    todayActivities,
    technologiesStudied,
    conceptsCompleted: [...new Set(conceptsCompleted)],
    assessmentScores,
    timeBreakdown: Object.entries(timeBreakdown).map(([tech, time]) => ({
      technology: tech,
      timeSpent: time
    })),
    todaySummary: status.todaySummary
  };
}

module.exports = {
  getStudentDashboardAnalytics,
  getAdminStudentsList,
  getActivityFeed,
  getStudentDetail
};
