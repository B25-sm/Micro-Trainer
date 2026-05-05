const { getAllStudentsHistory } = require("./readSheetsService");

// =======================================================
// 🔹 Build Student Profiles
// =======================================================
function buildProfiles(data) {
  const students = {};

  data.forEach((row) => {
    const {
      studentId,
      subject,
      score
    } = row;

    if (!students[studentId]) {
      students[studentId] = {
        studentId,
        subjects: {},
        totalScore: 0,
        totalAttempts: 0,
      };
    }

    if (!students[studentId].subjects[subject]) {
      students[studentId].subjects[subject] = {
        total: 0,
        count: 0,
      };
    }

    students[studentId].subjects[subject].total += score || 0;
    students[studentId].subjects[subject].count += 1;

    students[studentId].totalScore += score || 0;
    students[studentId].totalAttempts += 1;
  });

  // Convert to averages
  return Object.values(students).map((s) => {
    const subjectScores = {};

    Object.keys(s.subjects).forEach((sub) => {
      const d = s.subjects[sub];
      subjectScores[sub] = (d.total / d.count).toFixed(2);
    });

    return {
      studentId: s.studentId,
      subjects: subjectScores,
      fullstackScore: (s.totalScore / s.totalAttempts).toFixed(2),
    };
  });
}


// =======================================================
// 🔹 Rank Students
// =======================================================
function rankStudents(profiles, subject = null) {
  return profiles
    .map((s) => {
      const score = subject
        ? parseFloat(s.subjects[subject] || 0)
        : parseFloat(s.fullstackScore);

      return {
        ...s,
        score,
      };
    })
    .sort((a, b) => b.score - a.score)
    .map((s, i) => ({
      rank: i + 1,
      ...s,
    }));
}


// =======================================================
// 🔹 MAIN API FUNCTION
// =======================================================
async function getLeaderboard(subject = null) {
  const data = await getAllStudentsHistory();

  const profiles = buildProfiles(data);

  const ranked = rankStudents(profiles, subject);

  return ranked;
}

module.exports = { getLeaderboard };