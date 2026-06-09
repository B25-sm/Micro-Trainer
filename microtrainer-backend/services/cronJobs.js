/**
 * Cron Jobs for Background Tasks
 * 
 * Scheduled tasks for:
 * - Daily assessment generation
 * - Streak calculation
 * - Status updates
 */

const cron = require('node-cron');
const { calculateAllStreaks } = require('./engagementService');
const { generateDailyAssessments } = require('./assessmentService');
const {
  sendDailyReminder,
  sendWeeklySummary,
  sendStreakCongratulations,
  sendAtRiskAlert
} = require('./emailService');

/**
 * Initialize all cron jobs
 */
function initializeCronJobs() {
  console.log('⏰ Initializing cron jobs...');
  
  // Daily streak calculation at midnight UTC
  cron.schedule('0 0 * * *', () => {
    console.log('🔄 Running daily streak calculation...');
    try {
      const result = calculateAllStreaks();
      console.log(`✅ Streak calculation complete: ${result.streaksUpdated} students updated`);
    } catch (error) {
      console.error('❌ Streak calculation failed:', error.message);
    }
  }, {
    timezone: "UTC"
  });
  
  // Daily assessment generation at midnight UTC
  cron.schedule('0 0 * * *', () => {
    console.log('🔄 Running daily assessment generation...');
    try {
      const result = generateDailyAssessments();
      console.log(`✅ Assessment generation complete: ${result.generated} assessments created`);
    } catch (error) {
      console.error('❌ Assessment generation failed:', error.message);
    }
  }, {
    timezone: "UTC"
  });
  
  // Status update job every 5 minutes (check for at-risk students)
  cron.schedule('*/5 * * * *', () => {
    console.log('🔄 Running status update check...');
    try {
      checkAtRiskStudents();
    } catch (error) {
      console.error('❌ Status update check failed:', error.message);
    }
  });
  
  // Daily email reminders at 9:00 AM UTC
  cron.schedule('0 9 * * *', () => {
    console.log('📧 Sending daily email reminders...');
    try {
      sendDailyEmailReminders();
    } catch (error) {
      console.error('❌ Daily email reminders failed:', error.message);
    }
  }, {
    timezone: "UTC"
  });

  // Personal schedule push reminders at 8:00 AM UTC
  cron.schedule('0 8 * * *', async () => {
    console.log('📅 Sending personal schedule reminders...');
    try {
      const { runDailyScheduleReminders } = require('./personalScheduleService');
      const result = await runDailyScheduleReminders();
      console.log(`✅ Schedule reminders: ${result.sent}/${result.processed} sent`);
    } catch (error) {
      console.error('❌ Schedule reminders failed:', error.message);
    }
  }, {
    timezone: "UTC"
  });
  
  // Weekly summary emails every Sunday at 8:00 AM UTC
  cron.schedule('0 8 * * 0', () => {
    console.log('📊 Sending weekly summary emails...');
    try {
      sendWeeklySummaryEmails();
    } catch (error) {
      console.error('❌ Weekly summary emails failed:', error.message);
    }
  }, {
    timezone: "UTC"
  });
  
  console.log('✅ Cron jobs initialized:');
  console.log('   - Daily streak calculation (00:00 UTC)');
  console.log('   - Daily assessment generation (00:00 UTC)');
  console.log('   - Status update check (every 5 minutes)');
  console.log('   - Daily email reminders (09:00 UTC)');
  console.log('   - Personal schedule reminders (08:00 UTC)');
  console.log('   - Weekly summary emails (Sunday 08:00 UTC)');
}

/**
 * Check for at-risk students and send alerts
 */
function checkAtRiskStudents() {
  const { getAllStudentsEngagement } = require('./engagementService');
  const { broadcastAtRiskAlert } = require('./eventBroadcaster');
  
  const students = getAllStudentsEngagement();
  const atRiskStudents = students.filter(s => s.status === 'At_Risk');
  
  if (atRiskStudents.length > 0) {
    console.log(`⚠️  Found ${atRiskStudents.length} at-risk students`);
    
    atRiskStudents.forEach(student => {
      broadcastAtRiskAlert(student.studentId, {
        status: student.status,
        lastActivity: student.lastActivity,
        currentStreak: student.currentStreak
      });
    });
  }
}

/**
 * Send daily email reminders to inactive students
 */
function sendDailyEmailReminders() {
  const { getAllStudentsEngagement } = require('./engagementService');
  const { getStudentProfile } = require('./studentProfileService');
  
  const students = getAllStudentsEngagement();
  const inactiveToday = students.filter(s => s.status === 'Inactive' || s.status === 'At_Risk');
  
  console.log(`📧 Sending reminders to ${inactiveToday.length} inactive students`);
  
  inactiveToday.forEach(async (student) => {
    // Get student email from profile (you'll need to add email field to student data)
    const email = student.email || `${student.studentId}@example.com`; // Placeholder
    const name = student.name || student.studentId;
    const technology = student.activeTechnology || 'JavaScript';
    
    await sendDailyReminder(email, name, student.currentStreak || 0, technology);
  });
}

/**
 * Send weekly summary emails to all students
 */
function sendWeeklySummaryEmails() {
  const { getAllStudentsEngagement } = require('./engagementService');
  const { getStudentDashboardAnalytics } = require('./engagementAnalyticsService');
  
  const students = getAllStudentsEngagement();
  
  console.log(`📊 Sending weekly summaries to ${students.length} students`);
  
  students.forEach(async (student) => {
    const analytics = getStudentDashboardAnalytics(student.studentId);
    const email = student.email || `${student.studentId}@example.com`; // Placeholder
    const name = student.name || student.studentId;
    
    // Calculate weekly stats
    const last7Days = analytics.last30Days?.slice(-7) || [];
    const activeDays = last7Days.filter(d => d.activitiesCompleted > 0).length;
    const totalActivities = last7Days.reduce((sum, d) => sum + d.activitiesCompleted, 0);
    const scores = last7Days.filter(d => d.averageScore > 0).map(d => d.averageScore);
    const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    
    const weeklyStats = {
      activeDays,
      totalActivities,
      averageScore,
      currentStreak: student.currentStreak || 0,
      technologiesPracticed: analytics.topicsProgress?.map(t => t.technology) || [],
      weakAreas: analytics.weakAreas || [],
      engagementScore: analytics.engagementScore || 0
    };
    
    await sendWeeklySummary(email, name, weeklyStats);
  });
}

module.exports = {
  initializeCronJobs
};
