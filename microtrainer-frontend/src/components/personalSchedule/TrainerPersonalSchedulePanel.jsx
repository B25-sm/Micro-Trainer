import { Calendar, CheckCircle2, Clock, AlertTriangle, Target } from "lucide-react";

const STEP_LABELS = {
  category: "Choosing interview track",
  skills: "Declaring known skills",
  diagnostic: "Skill check in progress",
  generate: "Ready to generate plan",
  ready_to_generate: "Ready to generate plan",
  active: "Active plan",
};

function scoreTone(score) {
  const n = Number(score);
  if (n >= 8) return "text-green-600 dark:text-green-400";
  if (n >= 6) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

function StatusPill({ onTrack, behind, completed }) {
  if (completed) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200">
        <CheckCircle2 className="w-3.5 h-3.5" />
        Today complete
      </span>
    );
  }
  if (behind) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
        <AlertTriangle className="w-3.5 h-3.5" />
        Behind today
      </span>
    );
  }
  if (onTrack) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200">
        <Target className="w-3.5 h-3.5" />
        On track
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
      <Clock className="w-3.5 h-3.5" />
      In progress
    </span>
  );
}

export default function TrainerPersonalSchedulePanel({ schedule, todayInfo }) {
  if (!schedule) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-[#292a2d] p-6 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-5 h-5 text-gray-400" />
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            Personal Schedule
          </h2>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          This student has not started a Personal Schedule yet (track selection, skill check,
          or day-by-day plan).
        </p>
      </div>
    );
  }

  const plan = schedule.plan;
  const diagnostics = schedule.diagnostics || {};
  const diagEntries = Object.entries(diagnostics);
  const isActive = schedule.status === "active" && plan;
  const overallPct =
    plan && plan.days?.length
      ? Math.round(
          ((schedule.progress?.completedTaskIds?.length || 0) /
            plan.days.reduce((n, d) => n + d.tasks.length, 0)) *
            100
        ) || 0
      : 0;

  const today = todayInfo?.hasPlan ? todayInfo.today : null;
  const pendingToday =
    today?.tasks?.filter((t) => !today.completedTaskIds?.includes(t.id)) || [];

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#292a2d] p-6 mb-6">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
              Personal Schedule
            </h2>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {schedule.categoryLabel || schedule.category || "—"} ·{" "}
            {STEP_LABELS[schedule.step] || schedule.step}
            {schedule.hoursPerDay ? ` · ${schedule.hoursPerDay}h/day` : ""}
          </p>
        </div>
        {isActive && todayInfo?.hasPlan && (
          <StatusPill
            onTrack={todayInfo.onTrack}
            behind={todayInfo.behindSchedule}
            completed={today?.progress?.completed}
          />
        )}
      </div>

      {isActive && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-3">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Plan length</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 tabular-nums">
              {plan.totalDays} days
            </div>
            <div className="text-xs text-gray-400 mt-0.5">
              {plan.startDate} → {plan.endDate}
            </div>
          </div>
          <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-3">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Overall progress</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 tabular-nums">
              {overallPct}%
            </div>
            <div className="text-xs text-gray-400 mt-0.5">
              {schedule.progress?.completedTaskIds?.length || 0} tasks done
            </div>
          </div>
          <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-3">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Days completed</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 tabular-nums">
              {todayInfo?.overall?.completedDays ?? 0} / {plan.totalDays}
            </div>
          </div>
          <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-3">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Today (Day {today?.dayNumber})</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 tabular-nums">
              {today?.progress?.percent ?? 0}%
            </div>
            <div className="text-xs text-gray-400 mt-0.5">{today?.date}</div>
          </div>
        </div>
      )}

      {isActive && (
        <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden mb-5">
          <div
            className="h-full bg-blue-600 dark:bg-blue-500 transition-all"
            style={{ width: `${overallPct}%` }}
          />
        </div>
      )}

      {diagEntries.length > 0 && (
        <div className="mb-5">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Skill check scores (diagnostic)
          </h3>
          <div className="flex flex-wrap gap-2">
            {diagEntries.map(([tech, d]) => (
              <span
                key={tech}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-[#1e1f22] text-sm"
              >
                <span className="text-gray-700 dark:text-gray-300">{tech}</span>
                <span className={`font-semibold tabular-nums ${scoreTone(d.averageScore)}`}>
                  {Number(d.averageScore).toFixed(1)}/10
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      {schedule.declaredSkills?.length > 0 && !isActive && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Declared skills
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {schedule.declaredSkills.map((s) => s.technology).join(", ")}
          </p>
          {schedule.diagnosticQueue?.length > 0 && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
              Pending skill checks: {schedule.diagnosticQueue.join(", ")}
            </p>
          )}
        </div>
      )}

      {isActive && today && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Today&apos;s assigned concepts
          </h3>
          {today.tasks?.length === 0 ? (
            <p className="text-sm text-gray-500">No tasks scheduled for this day.</p>
          ) : (
            <ul className="space-y-2">
              {today.tasks.map((task) => {
                const done = today.completedTaskIds?.includes(task.id);
                return (
                  <li
                    key={task.id}
                    className={`flex items-start gap-2 text-sm rounded-lg px-3 py-2 border ${
                      done
                        ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30"
                        : "border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-[#1e1f22]"
                    }`}
                  >
                    {done ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                    ) : (
                      <span className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-500 shrink-0 mt-0.5" />
                    )}
                    <span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {task.concept}
                      </span>
                      <span className="block text-xs text-gray-500 dark:text-gray-400">
                        {task.technology} · ~{task.estimatedMinutes} min · {task.type}
                        {task.diagnosticScore != null && (
                          <> · assessed {Number(task.diagnosticScore).toFixed(1)}/10</>
                        )}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
          {pendingToday.length > 0 && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
              {pendingToday.length} concept(s) still open for today.
            </p>
          )}
        </div>
      )}

      {!isActive && schedule.step === "diagnostic" && schedule.currentDiagnostic && (
        <p className="text-sm text-blue-600 dark:text-blue-400">
          Currently assessing: <strong>{schedule.currentDiagnostic.technology}</strong>
          {schedule.currentDiagnostic.remaining > 1 &&
            ` (${schedule.currentDiagnostic.remaining} technologies left)`}
        </p>
      )}
    </div>
  );
}
