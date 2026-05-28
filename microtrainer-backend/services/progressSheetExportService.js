/**
 * Progress Sheet Export Service
 * 
 * Exports student engagement data to Excel and CSV formats
 */

const fs = require('fs');
const path = require('path');
const { getAllStudentsEngagement, getStudentStatus } = require('./engagementService');
const { getStudentDashboardAnalytics } = require('./engagementAnalyticsService');

const EXPORT_DIR = path.join(__dirname, '../data/exports');

// Ensure export directory exists
if (!fs.existsSync(EXPORT_DIR)) {
  fs.mkdirSync(EXPORT_DIR, { recursive: true });
}

/**
 * Generate CSV content from data
 */
function generateCSV(data, headers) {
  const csvRows = [];
  
  // Add headers
  csvRows.push(headers.join(','));
  
  // Add data rows
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header] || '';
      // Escape commas and quotes
      const escaped = String(value).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  });
  
  return csvRows.join('\n');
}

/**
 * Export daily progress sheet for a student
 */
function exportStudentDailyProgress(studentId, startDate, endDate) {
  const analytics = getStudentDashboardAnalytics(studentId);
  const status = getStudentStatus(studentId);
  
  // Filter data by date range
  const filteredDays = analytics.last30Days?.filter(day => {
    const dayDate = new Date(day.date);
    return (!startDate || dayDate >= new Date(startDate)) &&
           (!endDate || dayDate <= new Date(endDate));
  }) || [];
  
  // Prepare data rows
  const data = filteredDays.map(day => ({
    Date: day.date,
    Student_Name: studentId,
    Technology_Studied: day.technologies?.join(', ') || 'N/A',
    Concepts_Completed: day.conceptsCompleted || 0,
    Mini_Assessment_Scores: day.averageScore ? `${Math.round(day.averageScore)}%` : 'N/A',
    Time_Spent_Minutes: day.timeSpent || 0,
    Student_Status: day.status || 'Inactive',
    Activities_Completed: day.activitiesCompleted || 0
  }));
  
  // Add summary row
  const totalTimeSpent = data.reduce((sum, row) => sum + (parseInt(row.Time_Spent_Minutes) || 0), 0);
  const scores = data.filter(row => row.Mini_Assessment_Scores !== 'N/A').map(row => parseInt(row.Mini_Assessment_Scores));
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const totalConcepts = data.reduce((sum, row) => sum + (parseInt(row.Concepts_Completed) || 0), 0);
  
  data.push({
    Date: 'SUMMARY',
    Student_Name: '',
    Technology_Studied: '',
    Concepts_Completed: totalConcepts,
    Mini_Assessment_Scores: `${avgScore}%`,
    Time_Spent_Minutes: totalTimeSpent,
    Student_Status: status.status,
    Activities_Completed: data.reduce((sum, row) => sum + (parseInt(row.Activities_Completed) || 0), 0)
  });
  
  const headers = [
    'Date',
    'Student_Name',
    'Technology_Studied',
    'Concepts_Completed',
    'Mini_Assessment_Scores',
    'Time_Spent_Minutes',
    'Student_Status',
    'Activities_Completed'
  ];
  
  return {
    data,
    headers,
    csv: generateCSV(data, headers)
  };
}

/**
 * Export progress sheet for all students
 */
function exportAllStudentsProgress(startDate, endDate) {
  const students = getAllStudentsEngagement();
  const allData = [];
  
  students.forEach(student => {
    const result = exportStudentDailyProgress(student.studentId, startDate, endDate);
    // Remove summary row for combined export
    allData.push(...result.data.filter(row => row.Date !== 'SUMMARY'));
  });
  
  const headers = [
    'Date',
    'Student_Name',
    'Technology_Studied',
    'Concepts_Completed',
    'Mini_Assessment_Scores',
    'Time_Spent_Minutes',
    'Student_Status',
    'Activities_Completed'
  ];
  
  return {
    data: allData,
    headers,
    csv: generateCSV(allData, headers)
  };
}

/**
 * Export current day status for all students
 */
function exportCurrentDayStatus() {
  const students = getAllStudentsEngagement();
  
  const data = students.map(student => {
    const status = getStudentStatus(student.studentId);
    const analytics = getStudentDashboardAnalytics(student.studentId);
    
    return {
      Student_Name: student.studentId,
      Current_Status: status.status,
      Current_Streak: status.streak || 0,
      Engagement_Score: analytics.engagementScore || 0,
      Today_Activities: status.todaySummary?.activitiesCompleted || 0,
      Today_Score: status.todaySummary?.averageScore ? `${Math.round(status.todaySummary.averageScore)}%` : 'N/A',
      Today_Time_Minutes: status.todaySummary?.timeSpent || 0,
      Active_Technology: status.activeTechnology || 'N/A',
      Last_Activity: status.lastActivity || 'Never'
    };
  });
  
  const headers = [
    'Student_Name',
    'Current_Status',
    'Current_Streak',
    'Engagement_Score',
    'Today_Activities',
    'Today_Score',
    'Today_Time_Minutes',
    'Active_Technology',
    'Last_Activity'
  ];
  
  return {
    data,
    headers,
    csv: generateCSV(data, headers)
  };
}

/**
 * Save CSV to file
 */
function saveCSVToFile(csv, filename) {
  const filepath = path.join(EXPORT_DIR, filename);
  fs.writeFileSync(filepath, csv);
  return filepath;
}

/**
 * Generate Excel-compatible CSV (with UTF-8 BOM)
 */
function generateExcelCSV(data, headers) {
  const csv = generateCSV(data, headers);
  // Add UTF-8 BOM for Excel compatibility
  return '\uFEFF' + csv;
}

/**
 * Export with metadata
 */
function exportWithMetadata(type, startDate, endDate) {
  let result;
  
  switch (type) {
    case 'student_daily':
      result = exportStudentDailyProgress(startDate, endDate);
      break;
    case 'all_students':
      result = exportAllStudentsProgress(startDate, endDate);
      break;
    case 'current_status':
      result = exportCurrentDayStatus();
      break;
    default:
      throw new Error('Invalid export type');
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${type}_${timestamp}.csv`;
  
  // Save to file
  const filepath = saveCSVToFile(result.csv, filename);
  
  return {
    success: true,
    filename,
    filepath,
    rowCount: result.data.length,
    exportDate: new Date().toISOString(),
    dateRange: {
      start: startDate || 'N/A',
      end: endDate || 'N/A'
    }
  };
}

/**
 * Schedule automated daily exports
 */
function scheduleAutomatedExports() {
  const cron = require('node-cron');
  
  // Daily export at midnight UTC
  cron.schedule('0 0 * * *', () => {
    console.log('📊 Running automated daily export...');
    try {
      const result = exportWithMetadata('current_status');
      console.log(`✅ Daily export complete: ${result.filename}`);
    } catch (error) {
      console.error('❌ Automated export failed:', error.message);
    }
  }, {
    timezone: "UTC"
  });
  
  console.log('✅ Automated daily exports scheduled (00:00 UTC)');
}

/**
 * Clean up old exports (keep last 90 days)
 */
function cleanupOldExports() {
  const files = fs.readdirSync(EXPORT_DIR);
  const now = Date.now();
  const ninetyDaysAgo = now - (90 * 24 * 60 * 60 * 1000);
  
  let deletedCount = 0;
  
  files.forEach(file => {
    const filepath = path.join(EXPORT_DIR, file);
    const stats = fs.statSync(filepath);
    
    if (stats.mtimeMs < ninetyDaysAgo) {
      fs.unlinkSync(filepath);
      deletedCount++;
    }
  });
  
  if (deletedCount > 0) {
    console.log(`🗑️  Cleaned up ${deletedCount} old export files`);
  }
}

/**
 * Get list of available exports
 */
function getAvailableExports() {
  const files = fs.readdirSync(EXPORT_DIR);
  
  return files.map(file => {
    const filepath = path.join(EXPORT_DIR, file);
    const stats = fs.statSync(filepath);
    
    return {
      filename: file,
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime
    };
  }).sort((a, b) => b.modified - a.modified);
}

/**
 * Download export file
 */
function getExportFile(filename) {
  const filepath = path.join(EXPORT_DIR, filename);
  
  if (!fs.existsSync(filepath)) {
    throw new Error('Export file not found');
  }
  
  return {
    filepath,
    content: fs.readFileSync(filepath, 'utf8')
  };
}

module.exports = {
  exportStudentDailyProgress,
  exportAllStudentsProgress,
  exportCurrentDayStatus,
  exportWithMetadata,
  scheduleAutomatedExports,
  cleanupOldExports,
  getAvailableExports,
  getExportFile,
  generateCSV,
  generateExcelCSV
};
