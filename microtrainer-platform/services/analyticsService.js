// =======================================================
// 📊 ANALYTICS SERVICE
// Generates analytics and insights
// =======================================================

const { getAllStudents, getStudentsByInstitution } = require('./studentTrackingService');

// =======================================================
// 📊 GET INSTITUTION ANALYTICS
// =======================================================
function getInstitutionAnalytics(institution_id) {
  const students = getStudentsByInstitution(institution_id);
  
  if (students.length === 0) {
    return {
      institution_id,
      total_students: 0,
      message: 'No data available'
    };
  }
  
  const totalInterviews = students.reduce((sum, s) => sum + s.total_interviews, 0);
  const totalScore = students.reduce((sum, s) => sum + (s.average_score * s.total_interviews), 0);
  const averageScore = totalScore / totalInterviews;
  
  const flaggedStudents = students.filter(s => s.cheating_incidents > 0).length;
  
  // Get score distribution
  const scoreRanges = {
    excellent: students.filter(s => s.average_score >= 80).length,
    good: students.filter(s => s.average_score >= 60 && s.average_score < 80).length,
    average: students.filter(s => s.average_score >= 40 && s.average_score < 60).length,
    poor: students.filter(s => s.average_score < 40).length
  };
  
  // Get top performers
  const topPerformers = students
    .sort((a, b) => b.average_score - a.average_score)
    .slice(0, 5)
    .map(s => ({
      student_id: s.student_id,
      name: s.name,
      average_score: s.average_score.toFixed(2)
    }));
  
  // Get students at risk
  const atRisk = students
    .filter(s => s.average_score < 50 || s.cheating_incidents > 0)
    .map(s => ({
      student_id: s.student_id,
      name: s.name,
      average_score: s.average_score.toFixed(2),
      cheating_incidents: s.cheating_incidents,
      reason: s.cheating_incidents > 0 ? 'Cheating incidents' : 'Low performance'
    }));
  
  return {
    institution_id,
    total_students: students.length,
    total_interviews: totalInterviews,
    average_score: averageScore.toFixed(2),
    flagged_students: flaggedStudents,
    score_distribution: scoreRanges,
    top_performers: topPerformers,
    students_at_risk: atRisk
  };
}

// =======================================================
// 📊 GET PLATFORM ANALYTICS
// =======================================================
function getPlatformAnalytics() {
  const students = getAllStudents();
  
  if (students.length === 0) {
    return {
      total_students: 0,
      message: 'No data available'
    };
  }
  
  const totalInterviews = students.reduce((sum, s) => sum + s.total_interviews, 0);
  const totalScore = students.reduce((sum, s) => sum + (s.average_score * s.total_interviews), 0);
  const averageScore = totalScore / totalInterviews;
  
  const flaggedStudents = students.filter(s => s.cheating_incidents > 0).length;
  
  // Get institutions
  const institutions = new Set(students.map(s => s.institution_id));
  
  // Get score distribution
  const scoreRanges = {
    excellent: students.filter(s => s.average_score >= 80).length,
    good: students.filter(s => s.average_score >= 60 && s.average_score < 80).length,
    average: students.filter(s => s.average_score >= 40 && s.average_score < 60).length,
    poor: students.filter(s => s.average_score < 40).length
  };
  
  // Get activity by day (last 7 days)
  const activityByDay = getActivityByDay(7);
  
  return {
    total_students: students.length,
    total_interviews: totalInterviews,
    total_institutions: institutions.size,
    platform_average_score: averageScore.toFixed(2),
    flagged_students: flaggedStudents,
    score_distribution: scoreRanges,
    activity_last_7_days: activityByDay
  };
}

// =======================================================
// 📊 GET ACTIVITY BY DAY
// =======================================================
function getActivityByDay(days = 7) {
  const students = getAllStudents();
  const activity = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    
    const activeCount = students.filter(s => {
      if (!s.last_activity) return false;
      const lastActivity = new Date(s.last_activity);
      return lastActivity >= date && lastActivity < nextDate;
    }).length;
    
    activity.push({
      date: date.toISOString().split('T')[0],
      active_students: activeCount
    });
  }
  
  return activity;
}

// =======================================================
// 📊 GET CHEATING ANALYTICS
// =======================================================
function getCheatingAnalytics(institution_id = null) {
  let students;
  
  if (institution_id) {
    students = getStudentsByInstitution(institution_id);
  } else {
    students = getAllStudents();
  }
  
  const flaggedStudents = students.filter(s => s.cheating_incidents > 0);
  const totalWarnings = students.reduce((sum, s) => sum + s.total_warnings, 0);
  
  const riskLevels = {
    high: flaggedStudents.filter(s => s.cheating_incidents >= 3).length,
    medium: flaggedStudents.filter(s => s.cheating_incidents === 2).length,
    low: flaggedStudents.filter(s => s.cheating_incidents === 1).length
  };
  
  return {
    total_flagged: flaggedStudents.length,
    total_warnings: totalWarnings,
    risk_levels: riskLevels,
    flagged_students: flaggedStudents.map(s => ({
      student_id: s.student_id,
      name: s.name,
      institution_id: s.institution_id,
      cheating_incidents: s.cheating_incidents,
      total_warnings: s.total_warnings,
      risk_level: s.cheating_incidents >= 3 ? 'high' : s.cheating_incidents === 2 ? 'medium' : 'low'
    }))
  };
}

// =======================================================
// 📊 GET PERFORMANCE TRENDS
// =======================================================
function getPerformanceTrends(student_id) {
  const { getStudentProfile } = require('./studentTrackingService');
  const student = getStudentProfile(student_id);
  
  if (!student || student.interview_history.length === 0) {
    return {
      student_id,
      message: 'No interview history available'
    };
  }
  
  const history = student.interview_history.map(h => ({
    date: h.date,
    score: h.overall_score,
    subject: h.subject
  }));
  
  // Calculate moving average
  const movingAverage = [];
  const window = 3;
  
  for (let i = 0; i < history.length; i++) {
    const start = Math.max(0, i - window + 1);
    const subset = history.slice(start, i + 1);
    const avg = subset.reduce((sum, h) => sum + h.score, 0) / subset.length;
    movingAverage.push(avg.toFixed(2));
  }
  
  return {
    student_id,
    total_interviews: history.length,
    current_average: student.average_score.toFixed(2),
    trend: student.performance_trend,
    history: history.map((h, i) => ({
      ...h,
      moving_average: movingAverage[i]
    }))
  };
}

module.exports = {
  getInstitutionAnalytics,
  getPlatformAnalytics,
  getCheatingAnalytics,
  getPerformanceTrends
};
