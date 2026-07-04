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
      className={`relative inline-grid grid-cols-2 items-stretch rounded-lg border bg-slate-100/80 dark:bg-white/[0.03] ${
        small
          ? "border-slate-200/70 dark:border-slate-700/70 p-px"
          : "border-slate-200/80 dark:border-slate-700/70 p-0.5"
      }`}
      role="group"
      aria-label="Theme"
    >
      <span
        className={`pointer-events-none absolute rounded-md bg-white dark:bg-white/[0.08] shadow-sm ring-1 ring-slate-200/70 dark:ring-white/[0.06] transition-[left] duration-200 ease-out ${
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
          className={`transition-all duration-200 ${
            small ? "w-3.5 h-3.5" : "w-[15px] h-[15px]"
          } ${
            !darkMode
              ? "text-blue-600 dark:text-blue-300 drop-shadow-[0_0_4px_rgba(37,99,235,0.35)]"
              : "text-slate-400 dark:text-slate-500"
          }`}
          strokeWidth={1.5}
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
          className={`transition-all duration-200 ${
            small ? "w-3.5 h-3.5" : "w-[15px] h-[15px]"
          } ${
            darkMode
              ? "text-blue-600 dark:text-blue-300 drop-shadow-[0_0_4px_rgba(37,99,235,0.35)]"
              : "text-slate-400 dark:text-slate-500"
          }`}
          strokeWidth={1.5}
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
      className={`relative z-[1] inline-flex w-full items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a73e8] dark:focus-visible:ring-[#8ab4f8] focus-visible:ring-offset-1 dark:focus-visible:ring-offset-[#202124] ${
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
      className={`inline-flex items-center justify-center rounded-lg border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a73e8] dark:focus-visible:ring-[#8ab4f8] focus-visible:ring-offset-1 dark:focus-visible:ring-offset-[#202124] ${
        small ? "h-6 w-6" : iconOnly ? "h-8 w-8" : "h-8 gap-1.5 px-3"
      } ${
        readMode
          ? small
            ? "border-slate-200/70 dark:border-slate-700/70 bg-slate-100/80 dark:bg-white/[0.06] text-blue-600 dark:text-blue-300"
            : "border-slate-200/80 dark:border-slate-700/70 bg-slate-100/80 dark:bg-white/[0.06] text-blue-600 dark:text-blue-300"
          : "border-transparent bg-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100/90 dark:hover:bg-slate-700/50"
      }`}
    >
      <BookOpen
        className={`transition-transform duration-200 ${small ? "w-3.5 h-3.5" : "w-4 h-4"} ${
          readMode ? "drop-shadow-[0_0_4px_rgba(37,99,235,0.35)]" : ""
        }`}
        strokeWidth={1.5}
        aria-hidden
      />
      {!iconOnly && (
        <span className="text-[11px] font-medium">Read</span>
      )}
    </button>
  );
}
