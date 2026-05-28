// =======================================================
// 👨‍🏫 TRAINER — Learning path progress (local + Sheets)
// =======================================================

const { getCurriculum } = require("./curriculumService");
const {
  getAllStudentsProgressRaw,
  enrichProgressForTechnology,
} = require("./learningPathService");
const { getLatestProgressByStudentTechnology } = require("./readLearningProgressService");
const { getStudentProfile } = require("./studentProfileStore");
const { getStudentSyncStatus } = require("./syncStatusService");

function attachProfile(studentId, record) {
  const profile = getStudentProfile(studentId);
  return {
    ...record,
    name: profile?.name || null,
    initial: profile?.initial || null,
    batch: profile?.batch || null,
    displayName: profile?.displayName || profile?.name || studentId,
    syncStatus: getStudentSyncStatus(studentId),
  };
}

function buildTechnologySummary(studentId, technology, progress, source) {
  const enriched = enrichProgressForTechnology(technology, progress);
  const conceptScores = progress.conceptScores || {};
  const scores = Object.values(conceptScores).filter((n) => Number.isFinite(n));
  const avgQuizScore =
    scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : null;

  return {
    studentId,
    technology,
    source,
    currentConceptOrder: progress.currentConceptOrder ?? 1,
    currentLessonLabel: `Lesson ${progress.currentConceptOrder ?? 1}`,
    completedConcepts: progress.completedConcepts || [],
    completedCount: (progress.completedConcepts || []).length,
    totalConcepts: enriched.totalConcepts,
    overallProgress: enriched.overallProgress,
    conceptScores,
    averageQuizScore: avgQuizScore,
    lastUpdated: progress.lastUpdated || null,
  };
}

function mergeProgressRecord(local, remote) {
  if (!local && !remote) return null;
  if (!local) {
    return {
      currentConceptOrder: remote.currentConceptOrder,
      completedConcepts: remote.completedConcepts || [],
      conceptScores: {},
      overallProgress: remote.overallProgress,
      lastUpdated: remote.timestamp,
      source: "sheets",
    };
  }
  if (!remote) {
    return { ...local, source: "local" };
  }

  const localTime = local.lastUpdated ? new Date(local.lastUpdated).getTime() : 0;
  const remoteTime = remote.timestamp ? new Date(remote.timestamp).getTime() : 0;
  const remoteWins =
    remoteTime > localTime ||
    (remote.completedConcepts?.length || 0) >
      (local.completedConcepts?.length || 0);

  if (remoteWins) {
    return {
      currentConceptOrder: Math.max(
        local.currentConceptOrder || 1,
        remote.currentConceptOrder || 1
      ),
      completedConcepts:
        (remote.completedConcepts?.length || 0) >=
        (local.completedConcepts?.length || 0)
          ? remote.completedConcepts
          : local.completedConcepts || [],
      conceptScores: local.conceptScores || {},
      overallProgress: Math.max(
        local.overallProgress || 0,
        remote.overallProgress || 0
      ),
      lastUpdated: remote.timestamp,
      source: "merged",
    };
  }

  return { ...local, source: "local" };
}

async function getMergedProgressForStudent(studentId) {
  const allLocal = getAllStudentsProgressRaw();
  const localTech = allLocal[studentId] || {};

  const latestMap = await getLatestProgressByStudentTechnology();
  const technologies = new Set(Object.keys(localTech));

  Object.keys(latestMap).forEach((key) => {
    const [sid, tech] = key.split("::");
    if (sid === studentId) technologies.add(tech);
  });

  const paths = [];

  for (const technology of technologies) {
    const local = localTech[technology];
    const remote = latestMap[`${studentId}::${technology}`];
    const merged = mergeProgressRecord(
      local
        ? {
            ...local,
            overallProgress: enrichProgressForTechnology(technology, local)
              .overallProgress,
          }
        : null,
      remote
    );

    if (merged) {
      paths.push(
        buildTechnologySummary(studentId, technology, merged, merged.source)
      );
    }
  }

  paths.sort((a, b) => b.overallProgress - a.overallProgress);

  const maxOverall =
    paths.length > 0
      ? Math.max(...paths.map((p) => p.overallProgress))
      : 0;

  return attachProfile(studentId, {
    studentId,
    technologies: paths,
    summary: {
      technologiesStudied: paths.length,
      maxOverallProgress: maxOverall,
      totalConceptsCompleted: paths.reduce(
        (sum, p) => sum + p.completedCount,
        0
      ),
    },
  });
}

async function getAllStudentsLearningProgress() {
  const allLocal = getAllStudentsProgressRaw();
  const latestMap = await getLatestProgressByStudentTechnology();

  const studentIds = new Set(Object.keys(allLocal));
  Object.keys(latestMap).forEach((key) => {
    studentIds.add(key.split("::")[0]);
  });

  const students = [];

  for (const studentId of studentIds) {
    const detail = await getMergedProgressForStudent(studentId);
    const primary =
      detail.technologies.length > 0
        ? detail.technologies.reduce((best, t) =>
            t.overallProgress > (best?.overallProgress ?? -1) ? t : best
          )
        : null;

    students.push(
      attachProfile(studentId, {
        studentId,
        learningProgress: detail.summary.maxOverallProgress,
        technologiesStudied: detail.summary.technologiesStudied,
        conceptsCompleted: detail.summary.totalConceptsCompleted,
        currentTechnology: primary?.technology || null,
        currentLesson: primary?.currentLessonLabel || null,
        technologies: detail.technologies,
      })
    );
  }

  students.sort(
    (a, b) => (b.learningProgress || 0) - (a.learningProgress || 0)
  );

  return students;
}

module.exports = {
  getMergedProgressForStudent,
  getAllStudentsLearningProgress,
};
