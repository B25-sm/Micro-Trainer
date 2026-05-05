const { getStudentReport, getStudentHistory } = require("./readSheetsService");

// =======================================================
// 🔹 Utility: Normalize Score
// =======================================================
function normalizeScore(val) {
  if (!val) return 0;
  return typeof val === "string" ? parseFloat(val) : val;
}

// =======================================================
// 🔹 Utility: Detect Trend (Last 5 Answers)
// =======================================================
function getTrend(history = []) {
  if (history.length < 2) return "stable";

  const recent = history.slice(-5);
  const scores = recent.map(h => normalizeScore(h.score));

  const first = scores[0];
  const last = scores[scores.length - 1];

  if (last > first) return "improving";
  if (last < first) return "declining";
  return "stable";
}

// =======================================================
// 🔹 Utility: Consistency Score
// =======================================================
function getConsistency(history = []) {
  if (!history.length) return 0;

  const scores = history.map(h => normalizeScore(h.score));
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;

  const variance =
    scores.reduce((sum, s) => sum + Math.pow(s - avg, 2), 0) /
    scores.length;

  return (10 - Math.sqrt(variance)).toFixed(2); // higher = consistent
}

// =======================================================
// 🔹 Utility: Performance Level
// =======================================================
function getLevel(avgScore) {
  if (avgScore >= 8) return "Advanced";
  if (avgScore >= 6) return "Intermediate";
  if (avgScore >= 4) return "Beginner";
  return "Weak";
}

// =======================================================
// 🔹 MAIN MEMORY FUNCTION (UPGRADED)
// =======================================================
async function getStudentMemory(studentId) {
  try {
    const report = await getStudentReport(studentId);
    const history = await getStudentHistory(studentId);

    if (!report && !history?.length) {
      return null;
    }

    const avgScore = normalizeScore(report?.averageScore);
    const communication = normalizeScore(report?.communicationScore);
    const technical = normalizeScore(report?.technicalScore);

    const trend = getTrend(history);
    const consistency = getConsistency(history);
    const level = getLevel(avgScore);

    return {
      // Core metrics
      avgScore,
      communication,
      technical,

      // Concepts
      weakConcepts: report?.weakConcepts || [],
      strongConcepts: report?.strongConcepts || [],

      // Intelligence layer
      trend,            // improving | declining | stable
      consistency,      // stability score
      level,            // Beginner | Intermediate | Advanced

      // Raw meta
      totalAttempts: history?.length || 0,
      lastUpdated: new Date().toISOString(),
    };
  } catch (err) {
    console.error("Memory Error:", err.message);
    return null;
  }
}

module.exports = { getStudentMemory };