/**
 * Personal Schedule — intake, diagnostic scores, plan generation, progress, reminders.
 */

const { callGroq } = require("./groqClient");
const { QUALITY_MODEL } = require("./aiModelConfig");
const {
  getCategoryList,
  getTechOptionsForCategory,
  getSyllabusForCategory,
  getInterviewSubject,
  getCategoryMeta,
} = require("./personalScheduleSyllabus");
const {
  getSchedule,
  saveSchedule,
  getAllActiveSchedules,
} = require("./personalScheduleStore");

const DIAGNOSTIC_QUESTIONS_PER_TECH = 5;
const MIN_PLAN_DAYS = 7;
const MAX_PLAN_DAYS = 90;
const DEFAULT_HOURS_PER_DAY = 2;

function createEmptySchedule(studentId) {
  return {
    studentId,
    status: "draft",
    step: "category",
    category: null,
    declaredSkills: [],
    hoursPerDay: DEFAULT_HOURS_PER_DAY,
    diagnostics: {},
    diagnosticQueue: [],
    plan: null,
    progress: {
      completedTaskIds: [],
      completedDays: 0,
      lastReminderAt: null,
      lastReminderType: null,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function getOrCreate(studentId) {
  let schedule = getSchedule(studentId);
  if (!schedule) {
    schedule = createEmptySchedule(studentId);
    saveSchedule(studentId, schedule);
  }
  return schedule;
}

function setCategory(studentId, category) {
  const meta = getCategoryMeta(category);
  if (!meta) {
    throw new Error("Invalid category. Choose fullstack, data_science, data_analyst, or ai_ml.");
  }

  const schedule = getOrCreate(studentId);
  schedule.category = category;
  schedule.step = "skills";
  schedule.declaredSkills = [];
  schedule.diagnostics = {};
  schedule.diagnosticQueue = [];
  schedule.plan = null;
  schedule.status = "draft";
  saveSchedule(studentId, schedule);

  return {
    schedule: publicView(schedule),
    techOptions: getTechOptionsForCategory(category),
    categoryMeta: meta,
  };
}

function setDeclaredSkills(studentId, { declaredSkills, hoursPerDay }) {
  if (!Array.isArray(declaredSkills) || declaredSkills.length === 0) {
    throw new Error("Add at least one technology you already know.");
  }

  const schedule = getOrCreate(studentId);
  if (!schedule.category) {
    throw new Error("Select a track category first.");
  }

  const normalized = declaredSkills.map((s) => ({
    technology: String(s.technology || s).trim(),
    selfRating: s.selfRating || "intermediate",
    notes: s.notes || "",
  }));

  schedule.declaredSkills = normalized;
  schedule.hoursPerDay = Math.min(8, Math.max(1, Number(hoursPerDay) || DEFAULT_HOURS_PER_DAY));
  schedule.diagnostics = {};
  schedule.diagnosticQueue = normalized.map((s) => s.technology);
  schedule.step = "diagnostic";
  schedule.status = "diagnostic";
  saveSchedule(studentId, schedule);

  return {
    schedule: publicView(schedule),
    diagnosticConfig: {
      questionsPerTechnology: DIAGNOSTIC_QUESTIONS_PER_TECH,
      currentTechnology: schedule.diagnosticQueue[0] || null,
      interviewSubject: schedule.diagnosticQueue[0]
        ? getInterviewSubject(schedule.diagnosticQueue[0])
        : null,
      remaining: schedule.diagnosticQueue.length,
    },
  };
}

function recordDiagnosticResult(studentId, { technology, averageScore, sessionId }) {
  const schedule = getOrCreate(studentId);
  if (!schedule.category) {
    throw new Error("Schedule not started.");
  }

  const tech = String(technology).trim();
  const score = Math.min(10, Math.max(0, Number(averageScore) || 0));

  schedule.diagnostics[tech] = {
    averageScore: score,
    sessionId: sessionId || null,
    completedAt: new Date().toISOString(),
    interviewSubject: getInterviewSubject(tech),
  };

  schedule.diagnosticQueue = (schedule.diagnosticQueue || []).filter(
    (t) => t !== tech
  );

  if (schedule.diagnosticQueue.length === 0) {
    schedule.step = "generate";
    schedule.status = "ready_to_generate";
  }

  saveSchedule(studentId, schedule);

  const nextTech = schedule.diagnosticQueue[0] || null;

  return {
    schedule: publicView(schedule),
    diagnosticComplete: schedule.diagnosticQueue.length === 0,
    nextDiagnostic: nextTech
      ? {
          technology: nextTech,
          interviewSubject: getInterviewSubject(nextTech),
          questionsPerTechnology: DIAGNOSTIC_QUESTIONS_PER_TECH,
          remaining: schedule.diagnosticQueue.length,
        }
      : null,
  };
}

/**
 * Score 0-10 → study weight: strong topics get shorter review; weak get full block.
 */
function taskPriorityForTopic(technology, concept, diagnosticScore, isDeclaredTech) {
  const score = diagnosticScore ?? (isDeclaredTech ? 5 : 0);

  if (score >= 8) {
    return { include: false, minutes: 0, type: "skip" };
  }
  if (score >= 6) {
    return { include: true, minutes: 25, type: "review" };
  }
  if (score >= 4) {
    return { include: true, minutes: 45, type: "learn" };
  }
  return { include: true, minutes: 60, type: "learn" };
}

function buildTaskList(schedule) {
  const syllabus = getSyllabusForCategory(schedule.category);
  const declaredTechs = new Set(schedule.declaredSkills.map((s) => s.technology));
  const tasks = [];

  for (const item of syllabus) {
    const diag = schedule.diagnostics[item.technology];
    const score = diag ? diag.averageScore : declaredTechs.has(item.technology) ? 5 : 0;
    const priority = taskPriorityForTopic(
      item.technology,
      item.concept,
      score,
      declaredTechs.has(item.technology)
    );

    if (!priority.include) continue;

    const minutes = Math.max(priority.minutes, Math.round(item.minutes * 0.5));

    tasks.push({
      id: `${item.technology}::${item.concept}`.replace(/\s+/g, "_").toLowerCase(),
      technology: item.technology,
      concept: item.concept,
      estimatedMinutes: minutes,
      type: priority.type,
      diagnosticScore: score,
    });
  }

  // Gap fill: technologies in category syllabus but weak/not assessed
  const syllabusTechs = [...new Set(syllabus.map((s) => s.technology))];
  for (const tech of syllabusTechs) {
    if (tasks.some((t) => t.technology === tech)) continue;
    const diag = schedule.diagnostics[tech];
    if (diag && diag.averageScore >= 8) continue;

    tasks.push({
      id: `${tech}::fundamentals`.replace(/\s+/g, "_").toLowerCase(),
      technology: tech,
      concept: `${tech} fundamentals (interview depth)`,
      estimatedMinutes: 60,
      type: "learn",
      diagnosticScore: diag?.averageScore ?? 0,
    });
  }

  // A student who already scores 8+ on every declared/syllabus technology would
  // otherwise get zero tasks and generation would fail. Give them a light
  // review + mock-interview plan instead of no plan at all.
  if (tasks.length === 0) {
    for (const item of syllabus) {
      tasks.push({
        id: `${item.technology}::${item.concept}::review`.replace(/\s+/g, "_").toLowerCase(),
        technology: item.technology,
        concept: `${item.concept} (quick review)`,
        estimatedMinutes: 20,
        type: "review",
        diagnosticScore: schedule.diagnostics[item.technology]?.averageScore ?? 8,
      });
    }
    tasks.push({
      id: "mock_interview::final_prep",
      technology: schedule.category,
      concept: "Full mock interview + weak-spot drill",
      estimatedMinutes: 60,
      type: "mock",
      diagnosticScore: null,
    });
  }

  return tasks;
}

function distributeTasksAcrossDays(tasks, totalDays, hoursPerDay) {
  const minutesPerDay = hoursPerDay * 60;
  const days = [];

  function addDay() {
    const day = {
      dayNumber: days.length + 1,
      date: null,
      tasks: [],
      completed: false,
      completedTaskIds: [],
    };
    days.push(day);
    return day;
  }

  for (let d = 0; d < totalDays; d++) addDay();

  // Linear bin-packing: every task lands on some day. If the pre-computed
  // totalDays isn't enough capacity, extend the plan instead of dropping
  // tasks (a plan that silently omits syllabus content isn't executable).
  let dayIndex = 0;
  for (const task of tasks) {
    let day = days[dayIndex] || addDay();
    let used = day.tasks.reduce((sum, t) => sum + t.estimatedMinutes, 0);

    while (day.tasks.length > 0 && used + task.estimatedMinutes > minutesPerDay) {
      dayIndex++;
      day = days[dayIndex] || addDay();
      used = day.tasks.reduce((sum, t) => sum + t.estimatedMinutes, 0);
    }

    day.tasks.push({ ...task });
    used += task.estimatedMinutes;

    if (used >= minutesPerDay * 0.85) {
      dayIndex++;
    }
  }

  while (days.length < MIN_PLAN_DAYS) addDay();

  // Assign calendar dates
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  for (const day of days) {
    const d = new Date(start);
    d.setDate(start.getDate() + (day.dayNumber - 1));
    day.date = d.toISOString().split("T")[0];
  }

  return days;
}

function calculateRecommendedDays(tasks, hoursPerDay) {
  const totalMinutes = tasks.reduce((sum, t) => sum + t.estimatedMinutes, 0);
  const minutesPerDay = hoursPerDay * 60;
  let days = Math.ceil(totalMinutes / minutesPerDay);
  days = Math.max(MIN_PLAN_DAYS, Math.min(MAX_PLAN_DAYS, days));

  // Slight buffer for revision / mock interviews
  if (days < 14 && tasks.length > 8) days += 2;
  if (days > 45 && hoursPerDay >= 3) {
    days = Math.max(MIN_PLAN_DAYS, days - 3);
  }

  return { totalDays: days, totalMinutes, totalTasks: tasks.length };
}

async function generatePlan(studentId) {
  const schedule = getOrCreate(studentId);

  if (!schedule.category) {
    throw new Error("Select a category first.");
  }
  if (!schedule.declaredSkills?.length) {
    throw new Error("Declare your skills first.");
  }

  const pending = schedule.diagnosticQueue || [];
  if (pending.length > 0) {
    throw new Error(
      `Complete skill assessments first (${pending.length} remaining: ${pending.join(", ")}).`
    );
  }

  const tasks = buildTaskList(schedule);
  if (tasks.length === 0) {
    throw new Error("Could not build a study plan. Try adding more skills or retaking diagnostics.");
  }

  const { totalDays: estimatedDays, totalMinutes, totalTasks } = calculateRecommendedDays(
    tasks,
    schedule.hoursPerDay
  );

  const days = distributeTasksAcrossDays(tasks, estimatedDays, schedule.hoursPerDay);
  const totalDays = days.length;

  const startDate = days[0]?.date;
  const endDate = days[days.length - 1]?.date;

  let summary = null;
  try {
    const categoryLabel = getCategoryMeta(schedule.category)?.label || schedule.category;
    const skillSummary = schedule.declaredSkills
      .map((s) => `${s.technology} (${schedule.diagnostics[s.technology]?.averageScore ?? "?"}/10)`)
      .join(", ");

    const prompt = `You are MicroTrainer coach. A student needs a ${totalDays}-day ${categoryLabel} interview prep plan.
Known skills (diagnostic scores): ${skillSummary}.
Total study tasks: ${totalTasks}. Hours per day: ${schedule.hoursPerDay}.

Write 3 short motivational sentences (plain text, no markdown headers):
1) Why this timeline is realistic
2) What to focus on first week
3) Interview readiness tip

Keep under 120 words total.`;

    const groqRes = await callGroq({
      model: QUALITY_MODEL,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 200,
      temperature: 0.5,
    });
    summary =
      groqRes.data?.choices?.[0]?.message?.content?.trim() || summary;
  } catch {
    summary = `Your ${totalDays}-day plan covers ${totalTasks} concepts across ${categoryLabel}. Stay consistent at ${schedule.hoursPerDay}h/day and you'll be interview-ready.`;
  }

  schedule.plan = {
    totalDays,
    totalMinutes,
    totalTasks,
    startDate,
    endDate,
    hoursPerDay: schedule.hoursPerDay,
    category: schedule.category,
    categoryLabel: getCategoryMeta(schedule.category)?.label,
    coachSummary: summary,
    days,
    generatedAt: new Date().toISOString(),
  };

  schedule.step = "active";
  schedule.status = "active";
  schedule.progress = {
    completedTaskIds: [],
    completedDays: 0,
    lastReminderAt: null,
    lastReminderType: null,
  };

  saveSchedule(studentId, schedule);

  return { schedule: publicView(schedule) };
}

function completeTask(studentId, { dayNumber, taskId }) {
  const schedule = getSchedule(studentId);
  if (!schedule?.plan) {
    throw new Error("No active schedule found.");
  }

  const day = schedule.plan.days.find((d) => d.dayNumber === Number(dayNumber));
  if (!day) {
    throw new Error("Invalid day number.");
  }

  if (!day.completedTaskIds.includes(taskId)) {
    day.completedTaskIds.push(taskId);
  }

  const allDone = day.tasks.every((t) => day.completedTaskIds.includes(t.id));
  if (allDone && day.tasks.length > 0) {
    day.completed = true;
    schedule.progress.completedDays = schedule.plan.days.filter((d) => d.completed).length;
  }

  if (!schedule.progress.completedTaskIds.includes(taskId)) {
    schedule.progress.completedTaskIds.push(taskId);
  }

  saveSchedule(studentId, schedule);
  return { schedule: publicView(schedule), dayProgress: getDayProgress(schedule, day) };
}

function getDayProgress(schedule, day) {
  const total = day.tasks.length;
  const done = day.completedTaskIds.length;
  return {
    dayNumber: day.dayNumber,
    date: day.date,
    total,
    done,
    percent: total ? Math.round((done / total) * 100) : 0,
    completed: day.completed,
  };
}

function getTodayPlan(studentId) {
  const schedule = getSchedule(studentId);
  if (!schedule?.plan) {
    return { hasPlan: false };
  }

  const todayStr = new Date().toISOString().split("T")[0];
  const today =
    schedule.plan.days.find((d) => d.date === todayStr) ||
    schedule.plan.days.find((d) => !d.completed) ||
    schedule.plan.days[schedule.plan.days.length - 1];

  const overall = {
    totalDays: schedule.plan.totalDays,
    completedDays: schedule.plan.days.filter((d) => d.completed).length,
    totalTasks: schedule.plan.days.reduce((n, d) => n + d.tasks.length, 0),
    completedTasks: schedule.progress.completedTaskIds.length,
  };

  const dayProgress = getDayProgress(schedule, today);
  const behind =
    today.date < todayStr ||
    (dayProgress.percent < 50 && new Date().getHours() >= 18);

  return {
    hasPlan: true,
    schedule: publicView(schedule),
    today: {
      ...today,
      progress: dayProgress,
    },
    overall,
    onTrack: !behind && dayProgress.percent >= 50,
    behindSchedule: behind && dayProgress.percent < 100,
  };
}

function checkAndBuildReminder(studentId) {
  const schedule = getSchedule(studentId);
  if (!schedule?.plan || schedule.status !== "active") {
    return null;
  }

  const todayInfo = getTodayPlan(studentId);
  if (!todayInfo.hasPlan) return null;

  const { today, overall, onTrack, behindSchedule } = todayInfo;
  const pending = today.tasks.filter((t) => !today.completedTaskIds.includes(t.id));

  if (pending.length === 0 && today.completed) {
    return {
      type: "celebration",
      title: "Day complete!",
      body: `You finished Day ${today.dayNumber}. Great progress toward your ${schedule.plan.categoryLabel} goal.`,
      url: "/schedule",
    };
  }

  if (behindSchedule && pending.length > 0) {
    const names = pending.slice(0, 2).map((t) => t.concept).join(", ");
    return {
      type: "behind",
      title: "Catch up on today's plan",
      body: `You still have ${pending.length} concept(s) today: ${names}${pending.length > 2 ? "…" : ""}.`,
      url: "/schedule",
    };
  }

  if (onTrack && pending.length > 0) {
    return {
      type: "on_track",
      title: "Today's study plan",
      body: `${pending.length} concept(s) left today — ${overall.completedDays}/${overall.totalDays} days done overall.`,
      url: "/schedule",
    };
  }

  if (pending.length > 0) {
    return {
      type: "daily",
      title: "Learn these today",
      body: pending[0].concept + (pending.length > 1 ? ` (+${pending.length - 1} more)` : ""),
      url: "/schedule",
    };
  }

  return null;
}

async function sendScheduleReminder(studentId) {
  const reminder = checkAndBuildReminder(studentId);
  if (!reminder) return { sent: false };

  const schedule = getSchedule(studentId);
  const last = schedule?.progress?.lastReminderAt;
  const lastType = schedule?.progress?.lastReminderType;

  if (last && lastType === reminder.type) {
    const hoursSince = (Date.now() - new Date(last).getTime()) / (1000 * 60 * 60);
    if (hoursSince < 6) return { sent: false, reason: "throttled" };
  }

  try {
    const {
      notifyScheduleReminder,
      scheduleReminderNotificationType,
    } = require("./notificationOrchestratorService");
    const { canSendNotification } = require("./notificationPreferencesService");

    const notificationType = scheduleReminderNotificationType(reminder.type);
    if (!canSendNotification(studentId, notificationType, "browser")) {
      return { sent: false, reason: "preferences" };
    }

    const result = await notifyScheduleReminder(studentId, reminder, notificationType);
    if (result.browser.skipped) {
      return { sent: false, reason: "preferences" };
    }
    if (!result.browser.sent) {
      return { sent: false, reason: result.browser.error || "push_failed" };
    }
  } catch (error) {
    console.error(`Schedule push failed for ${studentId}:`, error.message);
    return { sent: false, reason: error.message };
  }

  schedule.progress.lastReminderAt = new Date().toISOString();
  schedule.progress.lastReminderType = reminder.type;
  saveSchedule(studentId, schedule);

  return { sent: true, reminder };
}

async function runDailyScheduleReminders() {
  const active = getAllActiveSchedules();
  let sent = 0;
  for (const s of active) {
    try {
      const result = await sendScheduleReminder(s.studentId);
      if (result?.sent) sent++;
    } catch (e) {
      console.error(`Schedule reminder failed for ${s.studentId}:`, e.message);
    }
  }
  return { processed: active.length, sent };
}

function resetSchedule(studentId) {
  const { deleteSchedule } = require("./personalScheduleStore");
  deleteSchedule(studentId);
  const fresh = createEmptySchedule(studentId);
  saveSchedule(studentId, fresh);
  return fresh;
}

function getCurrentDiagnostic(schedule) {
  if (!schedule?.diagnosticQueue?.length) return null;
  const technology = schedule.diagnosticQueue[0];
  return {
    technology,
    interviewSubject: getInterviewSubject(technology),
    remaining: schedule.diagnosticQueue.length,
    questionsPerTechnology: DIAGNOSTIC_QUESTIONS_PER_TECH,
  };
}

function publicView(schedule) {
  if (!schedule) return null;
  return {
    studentId: schedule.studentId,
    status: schedule.status,
    step: schedule.step,
    category: schedule.category,
    categoryLabel: schedule.category ? getCategoryMeta(schedule.category)?.label : null,
    declaredSkills: schedule.declaredSkills,
    hoursPerDay: schedule.hoursPerDay,
    diagnostics: schedule.diagnostics,
    diagnosticQueue: schedule.diagnosticQueue,
    currentDiagnostic: getCurrentDiagnostic(schedule),
    plan: schedule.plan,
    progress: schedule.progress,
    createdAt: schedule.createdAt,
    updatedAt: schedule.updatedAt,
  };
}

module.exports = {
  DIAGNOSTIC_QUESTIONS_PER_TECH,
  getCategoryList,
  getTechOptionsForCategory,
  getInterviewSubject,
  getOrCreate,
  setCategory,
  setDeclaredSkills,
  recordDiagnosticResult,
  generatePlan,
  completeTask,
  getTodayPlan,
  checkAndBuildReminder,
  sendScheduleReminder,
  runDailyScheduleReminders,
  resetSchedule,
  publicView,
};
