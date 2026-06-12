import { Sun, Moon, BookOpen } from "lucide-react";
import { useDisplayMode } from "../hooks/useDisplayMode";

/**
 * Theme + read mode controls.
 * compact: icon-only pill for nav bars
 * icon: stacked icon controls for narrow sidebars
 * panel: full-width bar for lesson pages
 */
export default function DisplayModeToggle({ variant = "panel" }) {
  const { darkMode, readMode, setDarkMode, toggleReadMode } = useDisplayMode();
  const isCompact = variant === "compact";
  const isIcon = variant === "icon";

  if (isIcon) {
    return (
      <div className="flex flex-col items-center gap-1" role="group" aria-label="Display settings">
        <ThemeSegment darkMode={darkMode} setDarkMode={setDarkMode} iconOnly compact />
        <ReadModeButton readMode={readMode} toggleReadMode={toggleReadMode} iconOnly compact />
      </div>
    );
  }

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

function ThemeSegment({ darkMode, setDarkMode, iconOnly = false, compact = false }) {
  const small = iconOnly && compact;
  const pad = small ? 1 : 2;

  return (
    <div
      className={`relative inline-grid grid-cols-2 items-stretch rounded-full border bg-slate-100/95 dark:bg-[#303134] ${
        small
          ? "border-slate-200/70 dark:border-slate-600/60 p-px"
          : "border-slate-200/90 dark:border-slate-600/80 p-0.5 shadow-sm"
      }`}
      role="group"
      aria-label="Theme"
    >
      <span
        className={`pointer-events-none absolute rounded-full bg-white dark:bg-[#3c4043] shadow-md ring-1 ring-slate-200/80 dark:ring-slate-500/40 transition-[left] duration-200 ease-out ${
          small ? "top-px bottom-px" : "top-0.5 bottom-0.5"
        }`}
        style={{
          width: `calc(50% - ${pad}px)`,
          left: darkMode ? `calc(50% + ${pad / 2}px)` : `${pad}px`,
        }}
        aria-hidden
      />
      <ThemeOption
        active={!darkMode}
        onClick={() => setDarkMode(false)}
        label="Light theme"
        iconOnly={iconOnly}
        compact={compact}
      >
        <Sun
          className={`transition-colors ${
            small ? "w-3.5 h-3.5" : "w-[18px] h-[18px]"
          } ${
            !darkMode
              ? "text-amber-600 dark:text-amber-400"
              : "text-slate-400 dark:text-slate-500"
          }`}
          strokeWidth={small ? 1.75 : 2}
          aria-hidden
        />
      </ThemeOption>
      <ThemeOption
        active={darkMode}
        onClick={() => setDarkMode(true)}
        label="Dark theme"
        iconOnly={iconOnly}
        compact={compact}
      >
        <Moon
          className={`transition-colors ${
            small ? "w-3.5 h-3.5" : "w-[18px] h-[18px]"
          } ${
            darkMode
              ? "text-indigo-600 dark:text-indigo-300"
              : "text-slate-400 dark:text-slate-500"
          }`}
          strokeWidth={small ? 1.75 : 2}
          aria-hidden
        />
      </ThemeOption>
    </div>
  );
}

function ThemeOption({ active, onClick, label, iconOnly, compact = false, children }) {
  const small = iconOnly && compact;

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
      className={`relative z-[1] inline-flex w-full items-center justify-center rounded-full font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a73e8] dark:focus-visible:ring-[#8ab4f8] focus-visible:ring-offset-1 dark:focus-visible:ring-offset-[#202124] ${
        small
          ? "h-6 px-2 gap-1"
          : iconOnly
            ? "h-8 px-3 gap-1"
            : "h-8 px-3 sm:px-4 gap-1.5"
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

function ReadModeButton({ readMode, toggleReadMode, iconOnly = false, compact = false }) {
  const small = iconOnly && compact;

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
        small ? "h-6 w-6" : iconOnly ? "h-8 w-8" : "h-8 gap-1.5 px-3"
      } ${
        readMode
          ? small
            ? "border-emerald-300/70 dark:border-emerald-600/50 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300"
            : "border-emerald-300/80 dark:border-emerald-600/60 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 shadow-sm"
          : "border-transparent bg-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100/90 dark:hover:bg-slate-700/50"
      }`}
    >
      <BookOpen
        className={small ? "w-3.5 h-3.5" : "w-[17px] h-[17px]"}
        strokeWidth={small ? 1.75 : 2}
        aria-hidden
      />
      {!iconOnly && (
        <span className="text-[11px] font-medium">Read</span>
      )}
    </button>
  );
}
