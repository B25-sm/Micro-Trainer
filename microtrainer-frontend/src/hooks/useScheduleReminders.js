import { useEffect, useState, useCallback } from "react";
import { personalScheduleAPI } from "../api/personalSchedule";

/**
 * In-app schedule reminders + optional push check on load.
 */
export function useScheduleReminders(studentId, { enabled = true } = {}) {
  const [banner, setBanner] = useState(null);

  const refresh = useCallback(async () => {
    if (!studentId || !enabled) return;
    try {
      const todayRes = await personalScheduleAPI.getToday(studentId);
      const data = todayRes.data;
      if (!data.hasPlan) {
        setBanner(null);
        return;
      }

      const pending = (data.today?.tasks || []).filter(
        (t) => !data.today.completedTaskIds?.includes(t.id)
      );

      if (data.today?.progress?.completed) {
        setBanner({
          type: "success",
          title: "Day complete!",
          message: `You finished Day ${data.today.dayNumber}. Keep the momentum going tomorrow.`,
        });
      } else if (data.behindSchedule && pending.length > 0) {
        setBanner({
          type: "warning",
          title: "Catch up today",
          message: `${pending.length} concept(s) still on your plan for today.`,
        });
      } else if (pending.length > 0) {
        setBanner({
          type: "info",
          title: "Today's plan",
          message: `Next up: ${pending[0].concept} (${pending[0].technology})`,
        });
      } else {
        setBanner(null);
      }
    } catch {
      setBanner(null);
    }
  }, [studentId, enabled]);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [refresh]);

  useEffect(() => {
    if (!studentId || !enabled) return;
    personalScheduleAPI.checkReminder(studentId).catch(() => {});
  }, [studentId, enabled]);

  return { banner, refresh };
}
