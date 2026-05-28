import { motion } from "framer-motion";

/**
 * Compact Lucid ↔ Terse switch — single slim row (Gemini / modern product UI).
 */
export default function ExplanationModeToggle({ mode, onChange }) {
  const isTerse = mode === "terse";

  return (
    <motion.div
      className="flex items-center justify-between gap-3 py-2 px-3 sm:px-4 mb-3 rounded-xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-600/80 read-mode:bg-[var(--read-surface-elevated)] read-mode:border-[var(--read-border)]"
      role="region"
      aria-label="Lesson length"
    >
      <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 shrink-0 hidden sm:inline">
        Length
      </span>

      <div
        className="relative flex p-0.5 rounded-full bg-slate-200/80 shrink-0"
        role="group"
        aria-label="Lesson length"
      >
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="absolute top-0.5 bottom-0.5 rounded-full bg-white shadow-sm"
          style={{
            width: "calc(50% - 2px)",
            left: isTerse ? "calc(50% + 1px)" : "2px",
          }}
        />
        <button
          type="button"
          onClick={() => onChange("lucid")}
          className={`relative z-10 px-4 sm:px-5 py-1.5 text-sm font-medium rounded-full transition-colors ${
            !isTerse ? "text-slate-900" : "text-slate-500 hover:text-slate-700"
          }`}
          aria-pressed={!isTerse}
        >
          Lucid
        </button>
        <button
          type="button"
          onClick={() => onChange("terse")}
          className={`relative z-10 px-4 sm:px-5 py-1.5 text-sm font-medium rounded-full transition-colors ${
            isTerse ? "text-slate-900" : "text-slate-500 hover:text-slate-700"
          }`}
          aria-pressed={isTerse}
        >
          Terse
        </button>
      </div>

      <p
        className={`text-[11px] truncate min-w-0 flex-1 text-right leading-tight ${
          isTerse ? "text-amber-700 font-medium" : "text-slate-400"
        }`}
      >
        <span className="hidden md:inline">
          {isTerse ? "4-line skim" : "Full lesson"}
          {" · "}
        </span>
        {isTerse
          ? "Read Lucid before the quiz for best results"
          : "Recommended for Quick Check"}
      </p>
    </motion.div>
  );
}
