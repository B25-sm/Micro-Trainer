const { getAllRows } = require("./readSheetsService");

// =======================================================
// 🔹 OVERVIEW
// =======================================================
async function getOverview() {
  const data = await getAllRows();

  if (!data.length) return { message: "No data" };

  const totalInterviews = data.length;

  const students = new Set(data.map(d => d.studentId));
  const totalStudents = students.size;

  const avgScore =
    data.reduce((sum, d) => sum + d.score, 0) / totalInterviews;

  const selectedCount =
    data.filter(d => d.verdict === "Selected").length;

  const selectionRate =
    ((selectedCount / totalInterviews) * 100).toFixed(2);

  return {
    totalStudents,
    totalInterviews,
    averageScore: avgScore.toFixed(2),
    selectionRate: `${selectionRate}%`
  };
}


// =======================================================
// 🔹 WEAK STUDENTS (LOW PERFORMANCE)
// =======================================================
async function getWeakStudents() {
  const data = await getAllRows();

  const map = {};

  data.forEach(row => {
    if (!map[row.studentId]) {
      map[row.studentId] = [];
    }
    map[row.studentId].push(row.score);
  });

  const weak = [];

  Object.keys(map).forEach(studentId => {
    const scores = map[studentId];
    const avg =
      scores.reduce((a, b) => a + b, 0) / scores.length;

    if (avg < 5) {
      weak.push({
        studentId,
        averageScore: avg.toFixed(2)
      });
    }
  });

  return weak.sort((a, b) => a.averageScore - b.averageScore);
}


// =======================================================
// 🔹 PERFORMANCE TRENDS (DAY-WISE)
// =======================================================
async function getTrends() {
  const data = await getAllRows();

  const map = {};

  data.forEach(row => {
    const date = new Date(row.timestamp).toISOString().split("T")[0];

    if (!map[date]) {
      map[date] = [];
    }

    map[date].push(row.score);
  });

  const trends = Object.keys(map).map(date => {
    const scores = map[date];

    const avg =
      scores.reduce((a, b) => a + b, 0) / scores.length;

    return {
      date,
      averageScore: avg.toFixed(2)
    };
  });

  return trends.sort((a, b) => new Date(a.date) - new Date(b.date));
}

module.exports = {
  getOverview,
  getWeakStudents,
  getTrends
};