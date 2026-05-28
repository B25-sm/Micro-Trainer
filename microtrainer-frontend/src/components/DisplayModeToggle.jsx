import { motion } from "framer-motion";
import { useDisplayMode } from "../hooks/useDisplayMode";

/**
 * Dark mode + Read mode — for comfortable night study.
 * compact: icon-only row for nav bars
 * panel: full labels (lesson toolbar)
 */
export default function DisplayModeToggle({ variant = "panel" }) {
  const { darkMode, readMode, toggleDarkMode, toggleReadMode } = useDisplayMode();

  const isCompact = variant === "compact";

  return (
    <motion.div
      className={
        isCompact
          ? "flex items-center gap-1"
          : "flex flex-wrap items-center justify-between gap-3 py-2 px-3 sm:px-4 mb-3 rounded-xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-600/80"
      }
      role="region"
      aria-label="Display settings"
    >
      {!isCompact && (
        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 shrink-0">
          Night reading
        </span>
      )}

      <div
        className={`flex items-center ${isCompact ? "gap-1" : "gap-2 flex-wrap justify-end flex-1"}`}
        role="group"
        aria-label="Dark and read mode"
      >
        <ModeButton
          active={darkMode}
          onClick={toggleDarkMode}
          label="Dark mode"
          shortLabel="Dark"
          icon="🌙"
          compact={isCompact}
        />
        <ModeButton
          active={readMode}
          onClick={toggleReadMode}
          label="Read mode — warmer colors and larger text"
          shortLabel="Read"
          icon="📖"
          compact={isCompact}
        />
      </div>

      {!isCompact && (
        <p className="text-[11px] text-slate-400 dark:text-slate-500 w-full sm:w-auto sm:text-right leading-tight">
          {readMode && darkMode
            ? "Sepia night read"
            : readMode
              ? "Easier on the eyes"
              : darkMode
                ? "Low-glare UI"
                : "Great for late-night lessons"}
        </p>
      )}
    </motion.div>
  );
}

function ModeButton({ active, onClick, label, shortLabel, icon, compact }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={`inline-flex items-center gap-1.5 rounded-full border text-[11px] font-medium transition ${
        compact ? "px-2 py-1.5" : "px-3 py-1.5"
      } ${
        active
          ? "border-blue-400 dark:border-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm ring-2 ring-blue-200 dark:ring-blue-800"
          : "border-transparent text-slate-500 dark:text-slate-400 hover:bg-white/80 dark:hover:bg-slate-700/50 hover:text-slate-700 dark:hover:text-slate-200"
      }`}
    >
      <span aria-hidden>{icon}</span>
      <span className={compact ? "sr-only sm:not-sr-only" : ""}>{shortLabel}</span>
    </button>
  );
}
