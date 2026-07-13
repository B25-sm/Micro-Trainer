const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const testDir = fs.mkdtempSync(path.join(os.tmpdir(), "microtrainer-schedule-"));
const schedulesFile = path.join(testDir, "schedules.json");
process.env.PERSONAL_SCHEDULES_FILE = schedulesFile;
process.env.JWT_SECRET = "personal-schedule-test-secret";

const scheduleService = require("./personalScheduleService");
const scheduleStore = require("./personalScheduleStore");
const {
  createScheduleBackup,
  verifyScheduleBackup,
} = require("./personalScheduleBackupService");

test.after(() => {
  fs.rmSync(testDir, { recursive: true, force: true });
});

test("personal schedule completes the full lifecycle with an offline AI fallback", async () => {
  const studentId = "schedule_lifecycle_student";

  const category = scheduleService.setCategory(studentId, "data_analyst");
  assert.equal(category.schedule.step, "skills");

  assert.throws(
    () =>
      scheduleService.setDeclaredSkills(studentId, {
        declaredSkills: [{ technology: "React" }],
        hoursPerDay: 2,
      }),
    /Invalid technologies/
  );

  const skills = scheduleService.setDeclaredSkills(studentId, {
    declaredSkills: [
      { technology: "SQL", selfRating: "intermediate" },
      { technology: "SQL", selfRating: "intermediate" },
    ],
    hoursPerDay: 2,
  });
  assert.equal(skills.schedule.step, "diagnostic");
  assert.deepEqual(skills.schedule.diagnosticQueue, ["SQL"]);

  assert.throws(
    () =>
      scheduleService.recordDiagnosticResult(studentId, {
        technology: "SQL",
        averageScore: 12,
      }),
    /between 0 and 10/
  );

  const diagnostic = scheduleService.recordDiagnosticResult(studentId, {
    technology: "SQL",
    averageScore: 6.5,
    sessionId: "diagnostic-session",
  });
  assert.equal(diagnostic.schedule.status, "ready_to_generate");

  const generated = await scheduleService.generatePlan(studentId, {
    coachSummaryCall: async () => {
      throw new Error("AI unavailable during test");
    },
  });
  assert.equal(generated.schedule.status, "active");
  assert.ok(generated.schedule.plan.totalDays >= 7);
  assert.ok(generated.schedule.plan.totalTasks > 0);
  assert.match(generated.schedule.plan.coachSummary, /Data Analyst/);

  const firstDay = generated.schedule.plan.days.find((day) => day.tasks.length > 0);
  const firstTask = firstDay.tasks[0];
  assert.throws(
    () =>
      scheduleService.completeTask(studentId, {
        dayNumber: firstDay.dayNumber,
        taskId: "not-a-real-task",
      }),
    /does not belong/
  );

  const completed = scheduleService.completeTask(studentId, {
    dayNumber: firstDay.dayNumber,
    taskId: firstTask.id,
  });
  assert.ok(completed.schedule.progress.completedTaskIds.includes(firstTask.id));
  assert.equal(scheduleService.getTodayPlan(studentId).hasPlan, true);
});

test("signed schedule backups restore data after ephemeral storage loss", async () => {
  const studentId = "schedule_restore_student";
  scheduleService.setCategory(studentId, "fullstack");
  const beforeLoss = scheduleStore.getSchedule(studentId);
  const backupToken = createScheduleBackup(scheduleService.publicView(beforeLoss));

  assert.ok(backupToken);
  scheduleStore.deleteSchedule(studentId);
  assert.equal(scheduleStore.getSchedule(studentId), null);

  const snapshot = verifyScheduleBackup(backupToken, studentId);
  const restored = scheduleService.restoreSchedule(studentId, snapshot);
  assert.equal(restored.studentId, studentId);
  assert.equal(restored.category, "fullstack");
  assert.equal(restored.step, "skills");

  assert.throws(
    () => verifyScheduleBackup(backupToken, "different_student"),
    /different student/
  );
});

test("a beginner can generate a complete plan without claiming prior skills", async () => {
  const studentId = "schedule_beginner_student";
  scheduleService.setCategory(studentId, "ai_ml");
  const skills = scheduleService.setDeclaredSkills(studentId, {
    declaredSkills: [],
    hoursPerDay: 1,
  });

  assert.equal(skills.schedule.status, "ready_to_generate");
  assert.equal(skills.schedule.currentDiagnostic, null);

  const generated = await scheduleService.generatePlan(studentId);
  assert.equal(generated.schedule.status, "active");
  assert.ok(generated.schedule.plan.totalTasks > 0);
  assert.match(generated.schedule.plan.coachSummary, /AI \/ ML Engineer/);
});

test("schedule store recovers the previous valid snapshot if its main file is corrupt", () => {
  const studentId = "schedule_store_recovery_student";
  scheduleService.setCategory(studentId, "ai_ml");
  scheduleService.setCategory(studentId, "data_science");

  fs.writeFileSync(schedulesFile, "{broken-json");
  const recovered = scheduleStore.getSchedule(studentId);
  assert.equal(recovered.category, "ai_ml");
});
