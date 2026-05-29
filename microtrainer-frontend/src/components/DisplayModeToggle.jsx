import { Sun, Moon, BookOpen } from "lucide-react";
import { useDisplayMode } from "../hooks/useDisplayMode";

/**
 * Theme + read mode controls.
 * compact: icon-only pill for nav bars
 * panel: full-width bar for lesson pages
 */
export default function DisplayModeToggle({ variant = "panel" }) {
  const { darkMode, readMode, setDarkMode, toggleReadMode } = useDisplayMode();
  const isCompact = variant === "compact";

  if (isCompact) {
    return (
      <div
        className="flex items-center gap-1.5"
        role="group"
        aria-label="Display settings"
      >
        <ThemeSegment darkMode={darkMode} setDarkMode={setDarkMode} iconOnly />
        <ReadModeButton readMode={readMode} toggleReadMode={toggleReadMode} iconOnly />
      </div>
    );
  }

  return (
    <div
      className="flex flex-wrap items-center justify-between gap-3 py-2.5 px-3 sm:px-4 mb-3 rounded-xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-600/80 read-mode:bg-[var(--read-surface-elevated)] read-mode:border-[var(--read-border)]"
      role="region"
      aria-label="Display settings"
    >
      <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 read-mode:text-[var(--read-text)] shrink-0">
        Appearance
      </span>
      <div className="flex items-center gap-3 flex-wrap justify-end flex-1">
        <ThemeSegment darkMode={darkMode} setDarkMode={setDarkMode} />
        <ReadModeButton readMode={readMode} toggleReadMode={toggleReadMode} />
      </div>
      <p className="text-[11px] text-slate-400 dark:text-slate-500 read-mode:text-[var(--read-text)] w-full sm:w-auto sm:text-right leading-tight opacity-80">
        {readMode && darkMode
          ? "Sepia night read"
          : readMode
            ? "Easier on the eyes"
            : darkMode
              ? "Dark theme"
              : "Light theme"}
      </p>
    </div>
  );
}

function ThemeSegment({ darkMode, setDarkMode, iconOnly = false }) {
  return (
    <div
      className="relative inline-flex items-center rounded-full border border-slate-200/90 dark:border-slate-600/80 bg-slate-100/95 dark:bg-[#303134] p-0.5 shadow-sm"
      role="group"
      aria-label="Theme"
    >
      <span
        className={`pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-9 rounded-full bg-white dark:bg-[#3c4043] shadow-md ring-1 ring-slate-200/80 dark:ring-slate-500/40 transition-transform duration-200 ease-out ${
          darkMode ? "translate-x-9" : "translate-x-0"
        }`}
        aria-hidden
      />
      <ThemeOption
        active={!darkMode}
        onClick={() => setDarkMode(false)}
        label="Light theme"
        iconOnly={iconOnly}
      >
        <Sun
          className={`w-[18px] h-[18px] transition-colors ${
            !darkMode
              ? "text-amber-600 dark:text-amber-400"
              : "text-slate-400 dark:text-slate-500"
          }`}
          strokeWidth={2}
          aria-hidden
        />
      </ThemeOption>
      <ThemeOption
        active={darkMode}
        onClick={() => setDarkMode(true)}
        label="Dark theme"
        iconOnly={iconOnly}
      >
        <Moon
          className={`w-[18px] h-[18px] transition-colors ${
            darkMode
              ? "text-indigo-600 dark:text-indigo-300"
              : "text-slate-400 dark:text-slate-500"
          }`}
          strokeWidth={2}
          aria-hidden
        />
      </ThemeOption>
    </div>
  );
}

function ThemeOption({ active, onClick, label, iconOnly, children }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      aria-pressed={active}
      aria-label={label}
      title={label}
      className={`relative z-[1] inline-flex items-center justify-center rounded-full font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a73e8] dark:focus-visible:ring-[#8ab4f8] focus-visible:ring-offset-1 dark:focus-visible:ring-offset-[#202124] ${
        iconOnly ? "h-8 w-9" : "h-8 px-3 gap-1.5 min-w-[2.75rem]"
      }`}
    >
      {children}
      {!iconOnly && (
        <span className="text-[11px] text-slate-700 dark:text-slate-200">
          {label.replace(" theme", "")}
        </span>
      )}
    </button>
  );
}

function ReadModeButton({ readMode, toggleReadMode, iconOnly = false }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleReadMode();
      }}
      title="Read mode — dim, low-glare colors"
      aria-label="Toggle read mode"
      aria-pressed={readMode}
      className={`inline-flex items-center justify-center rounded-full border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a73e8] dark:focus-visible:ring-[#8ab4f8] focus-visible:ring-offset-1 dark:focus-visible:ring-offset-[#202124] ${
        iconOnly ? "h-8 w-8" : "h-8 gap-1.5 px-3"
      } ${
        readMode
          ? "border-emerald-300/80 dark:border-emerald-600/60 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 shadow-sm"
          : "border-transparent bg-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100/90 dark:hover:bg-slate-700/50"
      }`}
    >
      <BookOpen className="w-[17px] h-[17px]" strokeWidth={2} aria-hidden />
      {!iconOnly && (
        <span className="text-[11px] font-medium">Read</span>
      )}
    </button>
  );
}
