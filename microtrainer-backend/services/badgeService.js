/**
 * Badge Service
 * 
 * Manages student badges and achievements
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data/engagement');
const BADGES_FILE = path.join(DATA_DIR, 'badges.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize badges file
if (!fs.existsSync(BADGES_FILE)) {
  fs.writeFileSync(BADGES_FILE, JSON.stringify({}));
}

// Badge definitions
const BADGE_DEFINITIONS = {
  // Streak badges
  streak_3: {
    id: 'streak_3',
    name: '3-Day Streak',
    description: 'Practice for 3 days in a row',
    type: 'streak',
    criteria: { type: 'streak', value: 3 },
    icon: '🔥'
  },
  streak_7: {
    id: 'streak_7',
    name: 'Week Warrior',
    description: 'Practice for 7 days in a row',
    type: 'streak',
    criteria: { type: 'streak', value: 7 },
    icon: '⚡'
  },
  streak_30: {
    id: 'streak_30',
    name: 'Month Master',
    description: 'Practice for 30 days in a row',
    type: 'streak',
    criteria: { type: 'streak', value: 30 },
    icon: '🏆'
  },
  
  // Score badges
  perfect_score: {
    id: 'perfect_score',
    name: 'Perfect Score',
    description: 'Score 100% on an assessment',
    type: 'score',
    criteria: { type: 'score', value: 100 },
    icon: '💯'
  },
  high_achiever: {
    id: 'high_achiever',
    name: 'High Achiever',
    description: 'Score 90%+ on 5 assessments',
    type: 'score',
    criteria: { type: 'high_scores', value: 5 },
    icon: '⭐'
  },
  
  // Activity badges
  early_bird: {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Complete 10 activities',
    type: 'completion',
    criteria: { type: 'activities', value: 10 },
    icon: '🐦'
  },
  dedicated: {
    id: 'dedicated',
    name: 'Dedicated Learner',
    description: 'Complete 50 activities',
    type: 'completion',
    criteria: { type: 'activities', value: 50 },
    icon: '📚'
  },
  master: {
    id: 'master',
    name: 'Master',
    description: 'Complete 100 activities',
    type: 'completion',
    criteria: { type: 'activities', value: 100 },
    icon: '👑'
  }
};

// Load/Save functions
function loadBadges() {
  try {
    return JSON.parse(fs.readFileSync(BADGES_FILE, 'utf8'));
  } catch (error) {
    console.error('Error loading badges:', error);
    return {};
  }
}

function saveBadges(data) {
  fs.writeFileSync(BADGES_FILE, JSON.stringify(data, null, 2));
}

/**
 * Check and award badges to a student
 */
function checkAndAwardBadges(studentId, stats) {
  const { canUseOfficialBenefits } = require("./syncStatusService");
  if (!canUseOfficialBenefits(studentId)) {
    console.warn(
      `🏆 Official badges locked for ${studentId}: progress sync is not connected`
    );
    return [];
  }

  const badges = loadBadges();
  
  if (!badges[studentId]) {
    badges[studentId] = [];
  }
  
  const studentBadges = badges[studentId];
  const newBadges = [];
  
  // Check streak badges
  if (stats.currentStreak >= 3 && !studentBadges.find(b => b.badgeId === 'streak_3')) {
    const badge = {
      ...BADGE_DEFINITIONS.streak_3,
      earnedAt: new Date().toISOString()
    };
    studentBadges.push(badge);
    newBadges.push(badge);
  }
  
  if (stats.currentStreak >= 7 && !studentBadges.find(b => b.badgeId === 'streak_7')) {
    const badge = {
      ...BADGE_DEFINITIONS.streak_7,
      earnedAt: new Date().toISOString()
    };
    studentBadges.push(badge);
    newBadges.push(badge);
  }
  
  if (stats.currentStreak >= 30 && !studentBadges.find(b => b.badgeId === 'streak_30')) {
    const badge = {
      ...BADGE_DEFINITIONS.streak_30,
      earnedAt: new Date().toISOString()
    };
    studentBadges.push(badge);
    newBadges.push(badge);
  }
  
  // Check score badges
  if (stats.lastScore === 100 && !studentBadges.find(b => b.badgeId === 'perfect_score')) {
    const badge = {
      ...BADGE_DEFINITIONS.perfect_score,
      earnedAt: new Date().toISOString()
    };
    studentBadges.push(badge);
    newBadges.push(badge);
  }
  
  // Check activity badges
  if (stats.totalActivities >= 10 && !studentBadges.find(b => b.badgeId === 'early_bird')) {
    const badge = {
      ...BADGE_DEFINITIONS.early_bird,
      earnedAt: new Date().toISOString()
    };
    studentBadges.push(badge);
    newBadges.push(badge);
  }
  
  if (stats.totalActivities >= 50 && !studentBadges.find(b => b.badgeId === 'dedicated')) {
    const badge = {
      ...BADGE_DEFINITIONS.dedicated,
      earnedAt: new Date().toISOString()
    };
    studentBadges.push(badge);
    newBadges.push(badge);
  }
  
  if (stats.totalActivities >= 100 && !studentBadges.find(b => b.badgeId === 'master')) {
    const badge = {
      ...BADGE_DEFINITIONS.master,
      earnedAt: new Date().toISOString()
    };
    studentBadges.push(badge);
    newBadges.push(badge);
  }
  
  // Save if new badges were awarded
  if (newBadges.length > 0) {
    saveBadges(badges);
    console.log(`🏆 Awarded ${newBadges.length} new badge(s) to ${studentId}`);
  }
  
  return newBadges;
}

/**
 * Get student badges
 */
function getStudentBadges(studentId) {
  const badges = loadBadges();
  return badges[studentId] || [];
}

/**
 * Get all badge definitions
 */
function getAllBadgeDefinitions() {
  return Object.values(BADGE_DEFINITIONS);
}

module.exports = {
  checkAndAwardBadges,
  getStudentBadges,
  getAllBadgeDefinitions,
  BADGE_DEFINITIONS
};
