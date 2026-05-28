// =======================================================
// 🎯 STUDENT PROFILE SERVICE
// Tracks both Technology Interviews and Problem-Solving scores
// =======================================================

const studentProfiles = {}; // In-memory storage (replace with database later)

// =======================================================
// 📊 INITIALIZE STUDENT PROFILE
// =======================================================
function initializeProfile(studentId) {
  if (!studentProfiles[studentId]) {
    studentProfiles[studentId] = {
      studentId,
      createdAt: new Date().toISOString(),
      
      // Technology Interview Scores (by subject)
      technologyScores: {
        // Format: { subject: { totalScore, count, average, interviews: [] } }
      },
      
      // Problem-Solving Scores (by difficulty)
      problemSolving: {
        easy: { solved: 0, attempted: 0, successRate: 0 },
        medium: { solved: 0, attempted: 0, successRate: 0 },
        hard: { solved: 0, attempted: 0, successRate: 0 },
        totalSolved: 0,
        totalAttempted: 0,
        overallScore: 0
      },
      
      // Combined Scores
      overallScore: 0,
      technologyAverage: 0,
      problemSolvingAverage: 0,
      
      // 🎯 LEVELS (NEW)
      overallLevel: "Junior",
      technologyLevel: "Junior",
      problemSolvingLevel: "Beginner",
      
      // Strengths & Weaknesses
      strengths: [],
      weaknesses: []
    };
  }
  
  return studentProfiles[studentId];
}

// =======================================================
// 📝 ADD TECHNOLOGY INTERVIEW RESULT
// =======================================================
function addTechnologyInterview(studentId, subject, score, details = {}) {
  const profile = initializeProfile(studentId);
  
  // Initialize subject if not exists
  if (!profile.technologyScores[subject]) {
    profile.technologyScores[subject] = {
      totalScore: 0,
      count: 0,
      average: 0,
      interviews: []
    };
  }
  
  const subjectData = profile.technologyScores[subject];
  
  // Add interview
  subjectData.interviews.push({
    score,
    date: new Date().toISOString(),
    ...details
  });
  
  // Update stats
  subjectData.count++;
  subjectData.totalScore += score;
  subjectData.average = (subjectData.totalScore / subjectData.count).toFixed(2);
  
  // Recalculate overall technology average
  calculateTechnologyAverage(profile);
  calculateOverallScore(profile);
  
  console.log(`✅ Added ${subject} interview for ${studentId}: ${score}/10`);
  
  return profile;
}

// =======================================================
// 🧩 ADD PROBLEM-SOLVING RESULT
// =======================================================
function addProblemSolvingResult(studentId, difficulty, solved, details = {}) {
  const profile = initializeProfile(studentId);
  
  const difficultyLevel = difficulty.toLowerCase();
  
  if (!profile.problemSolving[difficultyLevel]) {
    console.error(`Invalid difficulty: ${difficulty}`);
    return profile;
  }
  
  // Update stats
  profile.problemSolving[difficultyLevel].attempted++;
  
  if (solved) {
    profile.problemSolving[difficultyLevel].solved++;
    profile.problemSolving.totalSolved++;
  }
  
  profile.problemSolving.totalAttempted++;
  
  // Calculate success rate
  const stats = profile.problemSolving[difficultyLevel];
  stats.successRate = ((stats.solved / stats.attempted) * 100).toFixed(1);
  
  // Calculate overall problem-solving score (weighted by difficulty)
  calculateProblemSolvingScore(profile);
  calculateOverallScore(profile);
  
  console.log(`✅ Added ${difficulty} problem for ${studentId}: ${solved ? 'Solved' : 'Failed'}`);
  
  return profile;
}

// =======================================================
// 📊 CALCULATE TECHNOLOGY AVERAGE
// =======================================================
function calculateTechnologyAverage(profile) {
  const subjects = Object.keys(profile.technologyScores);
  
  if (subjects.length === 0) {
    profile.technologyAverage = 0;
    return;
  }
  
  const totalAverage = subjects.reduce((sum, subject) => {
    return sum + parseFloat(profile.technologyScores[subject].average);
  }, 0);
  
  profile.technologyAverage = (totalAverage / subjects.length).toFixed(2);
}

// =======================================================
// 🧩 CALCULATE PROBLEM-SOLVING SCORE
// =======================================================
function calculateProblemSolvingScore(profile) {
  const ps = profile.problemSolving;
  
  // Weighted scoring: Easy (1x), Medium (2x), Hard (3x)
  const easyScore = (ps.easy.solved / Math.max(ps.easy.attempted, 1)) * 1;
  const mediumScore = (ps.medium.solved / Math.max(ps.medium.attempted, 1)) * 2;
  const hardScore = (ps.hard.solved / Math.max(ps.hard.attempted, 1)) * 3;
  
  const totalWeight = 
    (ps.easy.attempted > 0 ? 1 : 0) +
    (ps.medium.attempted > 0 ? 2 : 0) +
    (ps.hard.attempted > 0 ? 3 : 0);
  
  if (totalWeight === 0) {
    profile.problemSolvingAverage = 0;
    ps.overallScore = 0;
    return;
  }
  
  const weightedScore = (easyScore + mediumScore + hardScore) / totalWeight;
  
  // Convert to 0-10 scale
  profile.problemSolvingAverage = (weightedScore * 10).toFixed(2);
  ps.overallScore = profile.problemSolvingAverage;
}

// =======================================================
// 🎯 CALCULATE OVERALL SCORE
// =======================================================
function calculateOverallScore(profile) {
  // Overall = (Technology × 0.6) + (Problem-Solving × 0.4)
  const techScore = parseFloat(profile.technologyAverage) || 0;
  const psScore = parseFloat(profile.problemSolvingAverage) || 0;
  
  profile.overallScore = ((techScore * 0.6) + (psScore * 0.4)).toFixed(2);
  
  // 🎯 DETERMINE LEVELS (NEW)
  profile.technologyLevel = determineTechnologyLevel(techScore);
  profile.problemSolvingLevel = determineProblemSolvingLevel(profile.problemSolving);
  profile.overallLevel = determineOverallLevel(parseFloat(profile.overallScore));
  
  // Update strengths and weaknesses
  updateStrengthsWeaknesses(profile);
}

// =======================================================
// 🏆 DETERMINE TECHNOLOGY LEVEL
// =======================================================
function determineTechnologyLevel(score) {
  if (score >= 8.5) return "Expert";
  if (score >= 7.0) return "Senior";
  if (score >= 5.0) return "Mid-Level";
  return "Junior";
}

// =======================================================
// 🧩 DETERMINE PROBLEM-SOLVING LEVEL
// =======================================================
function determineProblemSolvingLevel(ps) {
  const easyRate = parseFloat(ps.easy.successRate) || 0;
  const mediumRate = parseFloat(ps.medium.successRate) || 0;
  const hardRate = parseFloat(ps.hard.successRate) || 0;
  
  // Expert: Easy >95%, Medium >80%, Hard >60%
  if (easyRate >= 95 && mediumRate >= 80 && hardRate >= 60) {
    return "Expert";
  }
  
  // Advanced: Easy >90%, Medium >70%, Hard >40%
  if (easyRate >= 90 && mediumRate >= 70 && hardRate >= 40) {
    return "Advanced";
  }
  
  // Intermediate: Easy >80%, Medium >50%, Hard >30%
  if (easyRate >= 80 && mediumRate >= 50 && hardRate >= 30) {
    return "Intermediate";
  }
  
  // Beginner: Everything else
  return "Beginner";
}

// =======================================================
// 🎯 DETERMINE OVERALL LEVEL
// =======================================================
function determineOverallLevel(score) {
  if (score >= 8.5) return "Expert";
  if (score >= 7.0) return "Senior";
  if (score >= 5.0) return "Mid-Level";
  return "Junior";
}

// =======================================================
// 💪 UPDATE STRENGTHS & WEAKNESSES
// =======================================================
function updateStrengthsWeaknesses(profile) {
  const strengths = [];
  const weaknesses = [];
  
  // Technology strengths/weaknesses
  Object.entries(profile.technologyScores).forEach(([subject, data]) => {
    const avg = parseFloat(data.average);
    
    if (avg >= 7.5) {
      strengths.push(subject);
    } else if (avg < 6.0) {
      weaknesses.push(subject);
    }
  });
  
  // Problem-solving strengths/weaknesses
  const ps = profile.problemSolving;
  
  if (ps.easy.successRate >= 80) strengths.push("Easy Problems");
  else if (ps.easy.successRate < 50 && ps.easy.attempted > 5) weaknesses.push("Easy Problems");
  
  if (ps.medium.successRate >= 60) strengths.push("Medium Problems");
  else if (ps.medium.successRate < 40 && ps.medium.attempted > 5) weaknesses.push("Medium Problems");
  
  if (ps.hard.successRate >= 40) strengths.push("Hard Problems");
  else if (ps.hard.successRate < 20 && ps.hard.attempted > 3) weaknesses.push("Hard Problems");
  
  profile.strengths = strengths;
  profile.weaknesses = weaknesses;
}

// =======================================================
// 📖 GET STUDENT PROFILE
// =======================================================
function getStudentProfile(studentId) {
  return studentProfiles[studentId] || null;
}

// =======================================================
// 📊 GET ALL PROFILES (for leaderboard)
// =======================================================
function getAllProfiles() {
  return Object.values(studentProfiles);
}

// =======================================================
// 🏆 GET LEADERBOARD
// =======================================================
function getLeaderboard(sortBy = 'overall') {
  const profiles = getAllProfiles();
  
  profiles.sort((a, b) => {
    if (sortBy === 'technology') {
      return parseFloat(b.technologyAverage) - parseFloat(a.technologyAverage);
    } else if (sortBy === 'problemSolving') {
      return parseFloat(b.problemSolvingAverage) - parseFloat(a.problemSolvingAverage);
    } else {
      return parseFloat(b.overallScore) - parseFloat(a.overallScore);
    }
  });
  
  return profiles.map((profile, index) => ({
    rank: index + 1,
    studentId: profile.studentId,
    overallScore: profile.overallScore,
    overallLevel: profile.overallLevel,
    technologyAverage: profile.technologyAverage,
    technologyLevel: profile.technologyLevel,
    problemSolvingAverage: profile.problemSolvingAverage,
    problemSolvingLevel: profile.problemSolvingLevel,
    strengths: profile.strengths,
    weaknesses: profile.weaknesses
  }));
}

// =======================================================
// 📋 GET LEVEL DESCRIPTION
// =======================================================
function getLevelDescription(level, category = 'overall') {
  const descriptions = {
    technology: {
      "Junior": {
        description: "Basic understanding of concepts. Needs guidance and mentorship.",
        recommendation: "Focus on fundamentals. Practice more interviews and study core concepts."
      },
      "Mid-Level": {
        description: "Solid grasp of fundamentals. Can work independently on most tasks.",
        recommendation: "Deepen your knowledge. Learn advanced patterns and best practices."
      },
      "Senior": {
        description: "Strong expertise. Can mentor others and make architectural decisions.",
        recommendation: "Master edge cases and system design. Contribute to technical leadership."
      },
      "Expert": {
        description: "Deep mastery of the technology. Thought leader and innovator.",
        recommendation: "Share your knowledge. Mentor others and contribute to the community."
      }
    },
    problemSolving: {
      "Beginner": {
        description: "Learning fundamental algorithms and data structures.",
        recommendation: "Practice easy problems daily. Focus on arrays, strings, and basic patterns."
      },
      "Intermediate": {
        description: "Comfortable with common patterns. Can solve most medium problems.",
        recommendation: "Practice medium problems. Learn dynamic programming and graph algorithms."
      },
      "Advanced": {
        description: "Strong problem-solving skills. Can tackle hard problems systematically.",
        recommendation: "Master advanced algorithms. Practice competitive programming."
      },
      "Expert": {
        description: "Exceptional algorithmic thinking. Can solve complex problems efficiently.",
        recommendation: "Compete in contests. Mentor others and create educational content."
      }
    }
  };
  
  return descriptions[category]?.[level] || {
    description: "Assessment in progress",
    recommendation: "Keep practicing to establish your level"
  };
}

module.exports = {
  initializeProfile,
  addTechnologyInterview,
  addProblemSolvingResult,
  getStudentProfile,
  getAllProfiles,
  getLeaderboard,
  getLevelDescription
};
