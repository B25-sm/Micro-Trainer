import { useState } from "react";
import { personalScheduleAPI } from "../../api/personalSchedule";
import { btnSecondary, card, textMuted } from "../../lib/ui";

export default function SchedulePlanView({ studentId, schedule, onTaskComplete, onRefresh }) {
  const [expandedDay, setExpandedDay] = useState(null);
  const [loadingTask, setLoadingTask] = useState(null);

  const plan = schedule?.plan;
  if (!plan) return null;

  const handleToggleTask = async (dayNumber, taskId, alreadyDone) => {
    if (alreadyDone) return;
    setLoadingTask(taskId);
    try {
      await personalScheduleAPI.completeTask(studentId, { dayNumber, taskId });
      onTaskComplete?.();
      onRefresh?.();
    } catch (err) {
      alert(err?.error || "Could not update progress.");
    } finally {
      setLoadingTask(null);
    }
  };

  const totalTasks = plan.days.reduce((n, d) => n + d.tasks.length, 0);
  const doneTasks = schedule.progress?.completedTaskIds?.length || 0;
  const pct = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className={`${card} p-6`}>
        <h2 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-1">
          Your {plan.totalDays}-day {plan.categoryLabel} plan
        </h2>
        <p className={`${textMuted} text-sm mb-4`}>
          {plan.startDate} → {plan.endDate} · {plan.hoursPerDay}h/day · {plan.totalTasks}{" "}
          concepts
        </p>
        <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden mb-4">
          <div
            className="h-full bg-blue-600 dark:bg-blue-500 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300">{pct}% complete overall</p>
        {plan.coachSummary && (
          <p className="mt-4 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line border-t border-gray-100 dark:border-gray-700 pt-4">
            {plan.coachSummary}
          </p>
        )}
      </div>

      <div className="space-y-3">
        {plan.days.map((day) => {
          const isOpen = expandedDay === day.dayNumber;
          const dayDone = day.tasks.filter((t) =>
            day.completedTaskIds?.includes(t.id)
          ).length;
          const dayPct = day.tasks.length
            ? Math.round((dayDone / day.tasks.length) * 100)
            : 0;

          return (
            <div
              key={day.dayNumber}
              className={`${card} overflow-hidden ${day.completed ? "ring-1 ring-green-400/50" : ""}`}
            >
              <button
                type="button"
                onClick={() => setExpandedDay(isOpen ? null : day.dayNumber)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    Day {day.dayNumber}
                  </span>
                  <span className={`${textMuted} text-sm ml-2`}>{day.date}</span>
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {dayDone}/{day.tasks.length} · {dayPct}%
                  {day.completed ? " ✓" : ""}
                </span>
              </button>

              {isOpen && (
                <ul className="border-t border-gray-100 dark:border-gray-700 px-4 pb-4 space-y-2">
                  {day.tasks.map((task) => {
                    const done = day.completedTaskIds?.includes(task.id);
                    return (
                      <li
                        key={task.id}
                        className="flex items-start gap-3 py-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={done}
                          disabled={loadingTask === task.id}
                          onChange={() =>
                            handleToggleTask(day.dayNumber, task.id, done)
                          }
                          className="mt-1 rounded border-gray-300"
                        />
                        <span className="flex-1">
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {task.concept}
                          </span>
                          <span className={`${textMuted} block text-xs`}>
                            {task.technology} · ~{task.estimatedMinutes} min · {task.type}
                          </span>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        className={btnSecondary}
        onClick={() => {
          if (window.confirm("Start over with a new Personal Schedule?")) {
            personalScheduleAPI.reset(studentId).then(() => onRefresh?.());
          }
        }}
      >
        Start new schedule
      </button>
    </div>
  );
}
