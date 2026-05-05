const { getAllRows } = require("./readSheetsService");

// 🔹 Detect known concepts (upgrade over raw keywords)
function detectConcepts(textArray) {
  const text = textArray.join(" ").toLowerCase();

  const concepts = [
    "closure",
    "scope",
    "variable",
    "function",
    "array",
    "object",
    "promise",
    "async",
    "hooks",
    "state",
    "props",
    "sql",
    "join",
    "api",
  ];

  return concepts.filter(c => text.includes(c));
}

// 🔹 Progress calculation
function calculateProgress(scores) {
  if (scores.length < 2) return "Not enough data";

  const first = scores[0];
  const last = scores[scores.length - 1];

  if (last > first) return "Improving 📈";
  if (last < first) return "Declining 📉";
  return "Stable ➖";
}

async function getStudentReport(studentId) {
  const data = await getAllRows();

  const studentData = data
    .filter(d => d.studentId === studentId)
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  if (studentData.length === 0) {
    return { message: "No data found" };
  }

  const total = studentData.length;

  const scores = studentData.map(d => d.score);

  const avgScore =
    scores.reduce((sum, s) => sum + s, 0) / total;

  const communicationMap = { Good: 3, Average: 2, Poor: 1 };
  const technicalMap = { Good: 3, Average: 2, Poor: 1 };

  const avgComm =
    studentData.reduce((sum, d) => sum + communicationMap[d.communication], 0) / total;

  const avgTech =
    studentData.reduce((sum, d) => sum + technicalMap[d.technical], 0) / total;

  const verdictTrend =
    studentData.filter(d => d.verdict === "Selected").length > total / 2
      ? "Mostly Selected"
      : "Mostly Not Selected";

  // 🔥 SMART CONCEPT DETECTION
  const weakConcepts = detectConcepts(studentData.map(d => d.mistakes));
  const strongConcepts = detectConcepts(studentData.map(d => d.strengths));

  // 🔥 PROGRESS TRACKING
  const progress = calculateProgress(scores);

  return {
    studentId,
    totalInterviews: total,
    averageScore: avgScore.toFixed(2),
    communicationScore: avgComm.toFixed(2),
    technicalScore: avgTech.toFixed(2),
    verdictTrend,
    weakConcepts,
    strongConcepts,
    progress
  };
}

module.exports = { getStudentReport };