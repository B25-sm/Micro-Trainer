const { getAllRows } = require("./readSheetsService");

async function getLeaderboard() {
  const data = await getAllRows();

  if (!data || data.length === 0) {
    return [];
  }

  // 🔹 Group by student
  const map = {};

  data.forEach(row => {
    if (!map[row.studentId]) {
      map[row.studentId] = [];
    }
    map[row.studentId].push(row.score);
  });

  // 🔹 Calculate averages
  const leaderboard = Object.keys(map).map(studentId => {
    const scores = map[studentId];

    const avg =
      scores.reduce((sum, s) => sum + s, 0) / scores.length;

    return {
      studentId,
      averageScore: parseFloat(avg.toFixed(2))
    };
  });

  // 🔹 Sort descending
  leaderboard.sort((a, b) => b.averageScore - a.averageScore);

  // 🔹 Add rank
  return leaderboard.map((item, index) => ({
    ...item,
    rank: index + 1
  }));
}

module.exports = { getLeaderboard };