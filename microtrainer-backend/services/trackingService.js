const sheets = require("./sheetsService");

// =======================================================
// 🔹 Update Student Stats (REAL-TIME)
// =======================================================
async function updateStudentStats(studentId, result) {
  try {
    const today = new Date().toISOString().split("T")[0];

    await sheets.logInterview({
      studentId,
      date: today,
      ...result,
    });

    return true;
  } catch (err) {
    console.error("Tracking Error:", err.message);
    return false;
  }
}


// =======================================================
// 🔹 Aggregate Student Performance (ON-DEMAND)
// =======================================================
function aggregateStudent(history = []) {
  if (!history.length) return null;

  const total = history.length;

  const avgScore =
    history.reduce((sum, h) => sum + (h.score || 0), 0) / total;

  const commMap = { Poor: 1, Average: 2, Good: 3 };

  const avgComm =
    history.reduce((sum, h) => sum + (commMap[h.communication] || 0), 0) / total;

  const avgTech =
    history.reduce((sum, h) => sum + (commMap[h.technical] || 0), 0) / total;

  // 🔥 Weak area detection
  const mistakeText = history.map(h => h.mistakes || "").join(" ").toLowerCase();

  const weakAreas = [];
  if (mistakeText.includes("state")) weakAreas.push("State");
  if (mistakeText.includes("hook")) weakAreas.push("Hooks");
  if (mistakeText.includes("api")) weakAreas.push("API");
  if (mistakeText.includes("render")) weakAreas.push("Rendering");
  if (mistakeText.includes("props")) weakAreas.push("Props");

  return {
    totalQuestions: total,
    averageScore: avgScore.toFixed(2),
    communicationScore: avgComm.toFixed(2),
    technicalScore: avgTech.toFixed(2),
    weakAreas: [...new Set(weakAreas)],
  };
}

module.exports = {
  updateStudentStats,
  aggregateStudent,
};