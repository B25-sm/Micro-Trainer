const { getStudentReport } = require("./readSheetsService");


// In-memory cache for student levels (will be replaced with database)
const studentLevels = {};

async function getStudentMemory(studentId) {
  try {
    const report = await getStudentReport(studentId);

    if (!report) return null;

    return {
      weakConcepts: report.weakConcepts || [],
      strongConcepts: report.strongConcepts || [],
      avgScore: report.averageScore || 0,
      communication: report.communicationScore || 0,
      technical: report.technicalScore || 0,
      teachingLevel: studentLevels[studentId] || null, // Add teaching level
    };
  } catch (err) {
    console.error("Memory Error:", err.message);
    return null;
  }
}

// Save student's detected teaching level
function saveStudentLevel(studentId, level) {
  if (!studentId || !level) return;
  
  studentLevels[studentId] = {
    level: level,
    detectedAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString()
  };
  
  console.log(`💾 Saved level for ${studentId}: ${level}`);
}

// Get student's teaching level
function getStudentLevel(studentId) {
  if (!studentId) return null;
  return studentLevels[studentId]?.level || null;
}

// Update student level (if they improve)
function updateStudentLevel(studentId, newLevel) {
  if (!studentId || !newLevel) return;
  
  const existing = studentLevels[studentId];
  
  if (existing) {
    existing.level = newLevel;
    existing.lastUpdated = new Date().toISOString();
  } else {
    saveStudentLevel(studentId, newLevel);
  }
  
  console.log(`🔄 Updated level for ${studentId}: ${newLevel}`);
}

module.exports = { 
  getStudentMemory,
  saveStudentLevel,
  getStudentLevel,
  updateStudentLevel
};