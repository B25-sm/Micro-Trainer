// =======================================================
// 🎓 PLACEMENT SCORECARD
// A forwardable, per-candidate skill summary for the placement team.
// Reuses the technology-readiness engine for tech bands and adds
// Problem-solving + Communication rows, mapped to plain-English levels:
//   Not yet started / Below average / Average / Above average
// =======================================================

const {
  buildStudentReadiness,
  scoreToBand,
} = require("./technologyReadinessService");
const { normalizeTechnology } = require("./studentLearningLedgerService");
const { getStudentProfile: getIdentityProfile } = require("./studentProfileStore");
const { getTechnologyMasteryMap } = require("./conceptMasteryService");

const LEVEL = {
  NOT_STARTED: "Not yet started",
  BELOW: "Below average",
  AVG: "Average",
  ABOVE: "Above average",
};

// Numeric weights for computing an overall readiness signal (untouched skips).
const LEVEL_WEIGHT = {
  [LEVEL.BELOW]: 1,
  [LEVEL.AVG]: 2,
  [LEVEL.ABOVE]: 3,
};

// Fixed fullstack row list — always rendered in this order so untouched
// skills surface as "Not yet started" rather than silently disappearing.
const SKILL_ROWS = [
  { key: "html-css", label: "HTML/CSS", techs: ["html", "css", "htmlcss", "html/css"] },
  { key: "javascript", label: "JavaScript", techs: ["javascript"] },
  { key: "react", label: "React", techs: ["react"] },
  { key: "nodejs", label: "Node.js", techs: ["nodejs"] },
  { key: "python", label: "Python", techs: ["python"] },
  { key: "java", label: "Java", techs: ["java"] },
  { key: "sql", label: "SQL / Databases", techs: ["sql"] },
];

function bandToLevel(band) {
  if (band === "Good") return LEVEL.ABOVE;
  if (band === "Average") return LEVEL.AVG;
  if (band === "Weak") return LEVEL.BELOW;
  return LEVEL.NOT_STARTED;
}

/** Combine one or more readiness technologies into a single scorecard row. */
function combineTechs(readinessTechs, techKeys) {
  const wanted = new Set(techKeys.map((t) => normalizeTechnology(t)));
  const matches = (readinessTechs || []).filter((t) =>
    wanted.has(normalizeTechnology(t.technology))
  );

  const assessed = matches.filter((t) => t.eventCount > 0 && t.score != null);
  if (assessed.length === 0) {
    return { level: LEVEL.NOT_STARTED, score: null, eventCount: 0 };
  }

  let weightedSum = 0;
  let weightTotal = 0;
  let eventCount = 0;
  for (const t of assessed) {
    weightedSum += Number(t.score) * t.eventCount;
    weightTotal += t.eventCount;
    eventCount += t.eventCount;
  }
  const score = Math.round(weightedSum / weightTotal);
  return { level: bandToLevel(scoreToBand(score, eventCount)), score, eventCount };
}

/**
 * Combine per-concept understanding (mastery) across a row's technologies.
 * This is the behavioral judgement — it reflects HOW well the student
 * answered, concept by concept, not just how much activity happened.
 */
function combineMastery(masteryMap, techKeys) {
  const wanted = new Set(techKeys.map((t) => normalizeTechnology(t)));
  let wSum = 0;
  let wTot = 0;
  let attempts = 0;
  const weakConcepts = [];
  for (const [tech, m] of Object.entries(masteryMap || {})) {
    if (!wanted.has(normalizeTechnology(tech))) continue;
    const w = Math.max(1, m.attempts || 0);
    wSum += m.mastery * w;
    wTot += w;
    attempts += m.attempts || 0;
    weakConcepts.push(...(m.weakConcepts || []));
  }
  if (attempts === 0) return { level: LEVEL.NOT_STARTED, score: null, attempts: 0, weakConcepts: [] };
  const score = Math.round(wSum / wTot);
  return {
    level: bandToLevel(scoreToBand(score, attempts)),
    score,
    attempts,
    weakConcepts: [...new Set(weakConcepts)].slice(0, 4),
  };
}

/** Problem-solving from the coding-practice profile (0–100 average). */
function problemSolvingRow(studentId) {
  try {
    const { getStudentProfile } = require("./studentProfileService");
    const profile = getStudentProfile(studentId);
    const attempted = profile?.problemSolving?.totalAttempted || 0;
    const avg = parseFloat(profile?.problemSolvingAverage);
    if (!attempted || Number.isNaN(avg)) {
      return { level: LEVEL.NOT_STARTED, score: null, eventCount: 0 };
    }
    return {
      level: bandToLevel(scoreToBand(avg, attempted)),
      score: Math.round(avg),
      eventCount: attempted,
    };
  } catch {
    return { level: LEVEL.NOT_STARTED, score: null, eventCount: 0 };
  }
}

/** Communication from interview ratings (Good/Average/Poor → 3/2/1 avg). */
async function communicationRow(studentId) {
  try {
    const { getStudentReport } = require("./analyticsService");
    const report = await getStudentReport(studentId);
    const comm = parseFloat(report?.communicationScore);
    const total = Number(report?.totalInterviews) || 0;
    if (!total || Number.isNaN(comm)) {
      return { level: LEVEL.NOT_STARTED, score: null, eventCount: 0 };
    }
    let level = LEVEL.BELOW;
    if (comm >= 2.5) level = LEVEL.ABOVE;
    else if (comm >= 1.8) level = LEVEL.AVG;
    // Report communication on the 0–100 scale used elsewhere for consistency.
    return { level, score: Math.round((comm / 3) * 100), eventCount: total };
  } catch {
    return { level: LEVEL.NOT_STARTED, score: null, eventCount: 0 };
  }
}

function overallVerdict(skills) {
  const weights = skills
    .map((s) => LEVEL_WEIGHT[s.level])
    .filter((w) => w != null);
  if (weights.length === 0) {
    return { level: LEVEL.NOT_STARTED, score: null, message: "Not enough activity yet to assess." };
  }
  const avg = weights.reduce((a, b) => a + b, 0) / weights.length;
  let message;
  if (avg >= 2.5) message = "Strong — recommend for placement drives.";
  else if (avg >= 2.0) message = "Placement-ready — a few minor gaps to close.";
  else if (avg >= 1.5) message = "Developing — needs focused practice before drives.";
  else message = "Early stage — not yet placement-ready.";
  const score = Math.round((avg / 3) * 100);
  return {
    level: avg >= 2.5 ? LEVEL.ABOVE : avg >= 1.8 ? LEVEL.AVG : LEVEL.BELOW,
    score,
    message,
  };
}

/**
 * Build the full placement scorecard for one student.
 * @returns {Promise<object>} { studentId, name, batch, generatedAt, skills[], overall, assessedCount }
 */
async function buildScorecard(studentId) {
  const readiness = await buildStudentReadiness(studentId);
  const readinessTechs = readiness?.technologies || [];
  const identity = getIdentityProfile(studentId);
  const { map: masteryMap, topWeakConcepts } = getTechnologyMasteryMap(studentId);

  const techSkills = SKILL_ROWS.map((row) => {
    const readinessCombined = combineTechs(readinessTechs, row.techs);
    const mastery = combineMastery(masteryMap, row.techs);
    // Prefer the understanding judgement (mastery) when we actually have
    // graded answers; fall back to activity-based readiness otherwise.
    const useMastery = mastery.attempts > 0;
    return {
      key: row.key,
      label: row.label,
      level: useMastery ? mastery.level : readinessCombined.level,
      score: useMastery ? mastery.score : readinessCombined.score,
      eventCount: readinessCombined.eventCount,
      answersJudged: mastery.attempts,
      weakConcepts: mastery.weakConcepts,
      basis: useMastery ? "understanding" : "activity",
    };
  });

  const skills = [
    ...techSkills,
    { key: "problem-solving", label: "Problem-solving", ...problemSolvingRow(studentId) },
    { key: "communication", label: "Communication", ...(await communicationRow(studentId)) },
  ];

  const assessedCount = skills.filter((s) => s.level !== LEVEL.NOT_STARTED).length;

  return {
    studentId,
    name: identity?.name || readiness?.displayName || studentId,
    batch: identity?.batch || readiness?.batch || "",
    careerTrack: identity?.careerTrack || null,
    generatedAt: new Date().toISOString(),
    skills,
    assessedCount,
    topWeakConcepts: topWeakConcepts || [],
    overall: overallVerdict(skills),
  };
}

module.exports = {
  buildScorecard,
  SKILL_ROWS,
  LEVEL,
};
