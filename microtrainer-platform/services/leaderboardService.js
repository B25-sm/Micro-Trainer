// =======================================================
// 🏆 LEADERBOARD SERVICE
// Generates leaderboards and rankings
// =======================================================

const { getAllStudents, getStudentsByInstitution } = require('./studentTrackingService');

// =======================================================
// 🏆 GET GLOBAL LEADERBOARD
// =======================================================
async function getGlobalLeaderboard(limit = 100) {
  const students = await getAllStudents();
  
  // Filter students with at least 1 interview (changed from 3 for testing)
  const eligible = students.filter(s => s.total_interviews >= 1);
  
  // Sort by average score
  eligible.sort((a, b) => b.average_score - a.average_score);
  
  // Add rank
  return eligible.slice(0, limit).map((student, index) => ({
    rank: index + 1,
    student_id: student.student_id,
    name: student.name,
    institution_id: student.institution_id,
    average_score: student.average_score.toFixed(2),
    total_interviews: student.total_interviews,
    badge: getBadge(index + 1)
  }));
}

// =======================================================
// 🏆 GET INSTITUTION LEADERBOARD
// =======================================================
async function getInstitutionLeaderboard(institution_id, limit = 50) {
  const students = await getStudentsByInstitution(institution_id);
  
  // Filter students with at least 1 interview (changed from 3 for testing)
  const eligible = students.filter(s => s.total_interviews >= 1);
  
  // Sort by average score
  eligible.sort((a, b) => b.average_score - a.average_score);
  
  // Add rank
  return eligible.slice(0, limit).map((student, index) => ({
    rank: index + 1,
    student_id: student.student_id,
    name: student.name,
    average_score: student.average_score.toFixed(2),
    total_interviews: student.total_interviews,
    badge: getBadge(index + 1)
  }));
}

// =======================================================
// 🏆 GET STUDENT RANK
// =======================================================
async function getStudentRank(student_id, scope = 'global') {
  let leaderboard;
  
  if (scope === 'global') {
    leaderboard = await getGlobalLeaderboard(1000);
  } else {
    // Institution scope
    leaderboard = await getInstitutionLeaderboard(scope, 500);
  }
  
  const position = leaderboard.findIndex(s => s.student_id === student_id);
  
  if (position === -1) {
    return {
      rank: null,
      message: 'Not ranked yet (need at least 1 interview)'
    };
  }
  
  return {
    rank: position + 1,
    total_students: leaderboard.length,
    percentile: ((leaderboard.length - position) / leaderboard.length * 100).toFixed(1),
    badge: getBadge(position + 1)
  };
}

// =======================================================
// 🏆 GET BADGE
// =======================================================
function getBadge(rank) {
  if (rank === 1) return '🥇 Champion';
  if (rank === 2) return '🥈 Runner-up';
  if (rank === 3) return '🥉 Third Place';
  if (rank <= 10) return '⭐ Top 10';
  if (rank <= 50) return '🌟 Top 50';
  if (rank <= 100) return '✨ Top 100';
  return '📊 Ranked';
}

// =======================================================
// 🏆 GET TOP PERFORMERS (This Week)
// =======================================================
async function getTopPerformersThisWeek(limit = 10) {
  const students = await getAllStudents();
  
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  // Filter students active this week
  const activeThisWeek = students.filter(s => 
    s.last_activity && new Date(s.last_activity) >= oneWeekAgo
  );
  
  // Sort by average score
  activeThisWeek.sort((a, b) => b.average_score - a.average_score);
  
  return activeThisWeek.slice(0, limit).map((student, index) => ({
    rank: index + 1,
    student_id: student.student_id,
    name: student.name,
    institution_id: student.institution_id,
    average_score: student.average_score.toFixed(2),
    total_interviews: student.total_interviews
  }));
}

module.exports = {
  getGlobalLeaderboard,
  getInstitutionLeaderboard,
  getStudentRank,
  getTopPerformersThisWeek
};
