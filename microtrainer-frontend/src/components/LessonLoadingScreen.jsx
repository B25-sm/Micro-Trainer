import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import BrandMark from "./BrandMark";

/** Initial estimate — AI lesson often takes 30–90s (parallel on server) */
export const LESSON_LOAD_ESTIMATE_SEC = 55;

const STATUS_STEPS = [
  { at: 40, label: "Starting your session…" },
  { at: 32, label: "Writing your lesson…" },
  { at: 24, label: "Drawing the wireframe diagram…" },
  { at: 16, label: "Preparing quick-check questions…" },
  { at: 8, label: "Almost there…" },
];

function statusForSecondsLeft(left, isSlow) {
  if (isSlow) {
    return "Still generating — AI can take 1–2 minutes. Please wait…";
  }
  if (left > 40) return "Starting your session…";
  for (const step of STATUS_STEPS) {
    if (left >= step.at) return step.label;
  }
  return "Finishing up…";
}

export default function LessonLoadingScreen({
  estimateSec = LESSON_LOAD_ESTIMATE_SEC,
  title = "Preparing your lesson…",
  statusOverride,
}) {
  const [secondsLeft, setSecondsLeft] = useState(estimateSec);

  useEffect(() => {
    setSecondsLeft(estimateSec);
    const tick = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(tick);
  }, [estimateSec]);

  const isSlow = secondsLeft === 0;
  const progress = isSlow
    ? 92
    : Math.min(92, Math.round(((estimateSec - secondsLeft) / estimateSec) * 100));
  const status = statusOverride || statusForSecondsLeft(secondsLeft, isSlow);

  return (
    <motion.div className="w-full py-16 sm:py-20 flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white shadow-lg px-6 py-8 text-center"
      >
        <BrandMark className="mx-auto mb-4 h-10 w-10 rounded-xl" alt="MicroTrainer logo" />
        <div className="relative mx-auto w-24 h-24 mb-5">
          <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100" aria-hidden>
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="url(#loadGrad)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 42}`}
              strokeDashoffset={`${2 * Math.PI * 42 * (1 - progress / 100)}`}
              className={isSlow ? "animate-pulse" : "transition-[stroke-dashoffset] duration-1000 ease-linear"}
            />
            <defs>
              <linearGradient id="loadGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#2563eb" />
              </linearGradient>
            </defs>
          </svg>
          <motion.div className="absolute inset-0 flex flex-col items-center justify-center">
            {isSlow ? (
              <span className="text-2xl" aria-hidden>
                ⏳
              </span>
            ) : (
              <>
                <span className="text-3xl font-bold tabular-nums text-gray-900 leading-none">
                  {secondsLeft}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 mt-0.5">
                  sec left
                </span>
              </>
            )}
          </motion.div>
        </div>

        <h2 className="text-lg font-semibold text-gray-900 mb-1">{title}</h2>
        <p className="text-sm text-blue-700 font-medium min-h-[2.5rem] transition-all px-1">
          {status}
        </p>
        <p className="mt-2 text-xs text-gray-500 leading-relaxed">
          {isSlow
            ? "Do not refresh — your lesson is still being created."
            : `Lesson + wireframe · often ready in ~${estimateSec}s (may take longer)`}
        </p>

        <div className="mt-5 h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
          <motion.div
            className={`h-full rounded-full bg-blue-500 ${isSlow ? "animate-pulse w-[92%]" : ""}`}
            initial={isSlow ? undefined : { width: "0%" }}
            animate={isSlow ? undefined : { width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>

        <p className="mt-4 text-[11px] text-gray-400">
          Stay on this tab while MicroTrainer loads
        </p>
      </motion.div>
    </motion.div>
  );
}
