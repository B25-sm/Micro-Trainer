const { getStudentReport } = require("./readSheetsService");


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
    };
  } catch (err) {
    console.error("Memory Error:", err.message);
    return null;
  }
}

module.exports = { getStudentMemory };