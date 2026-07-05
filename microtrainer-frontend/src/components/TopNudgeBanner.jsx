import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Rocket, BookOpen, X } from "lucide-react";
import { getRecommendations } from "../api";
import { getStudentId } from "../utils/studentAuth";

const NUDGE_TYPES = new Set(["ready_for_mock", "course_after_mock_fail"]);

/**
 * Shows the single most important adaptive-loop nudge (ready for mock / take a
 * course) as a prominent, dismissible banner. Renders nothing when there is none.
 */
export default function TopNudgeBanner() {
  const navigate = useNavigate();
  const [nudge, setNudge] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const id = getStudentId();
    if (!id) return;
    let cancelled = false;
    getRecommendations(id)
      .then((res) => {
        if (cancelled) return;
        const recs = res.data?.recommendations || [];
        const top = recs.find((r) => NUDGE_TYPES.has(r.type));
        if (top) setNudge(top);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (!nudge || dismissed) return null;

  const isMock = nudge.type === "ready_for_mock";
  const Icon = isMock ? Rocket : BookOpen;
  const frame = isMock
    ? "border-violet-300/60 dark:border-violet-400/20 bg-violet-50 dark:bg-violet-400/[0.07]"
    : "border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40";
  const btn = isMock
    ? "bg-[#7c3aed] dark:bg-[#a78bfa] text-white dark:text-gray-900"
    : "bg-amber-500 text-white";

  return (
    <div className={`w-full rounded-xl border ${frame} px-4 py-3 flex items-center justify-between gap-3`}>
      <div className="flex items-start gap-3 min-w-0">
        <Icon className="h-5 w-5 shrink-0 mt-0.5 text-gray-700 dark:text-gray-200" strokeWidth={1.75} />
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{nudge.title}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{nudge.reason}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {nudge.action?.path && (
          <button
            type="button"
            onClick={() => navigate(nudge.action.path)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium hover:opacity-90 ${btn}`}
          >
            {nudge.action.label || "Go"}
          </button>
        )}
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="rounded-md p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
