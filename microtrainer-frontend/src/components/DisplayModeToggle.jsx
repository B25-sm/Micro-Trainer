import { Sun, Moon, BookOpen } from "lucide-react";
import { useDisplayMode } from "../hooks/useDisplayMode";

/**
 * Theme + read mode controls.
 * icon: single stacked dock for the collapsed rail (auto theme toggle + read toggle)
 * compact: one merged pill dock for the sidebar footer
 * panel: full-width bar for lesson pages
 */
export default function DisplayModeToggle({ variant = "panel" }) {
  const { darkMode, readMode, setDarkMode, toggleReadMode } = useDisplayMode();

  if (variant === "icon") {
    return (
      <div
        className="flex flex-col items-center gap-0.5 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.04] p-1 read-mode:bg-[var(--read-surface-elevated)] read-mode:border-[var(--read-border)]"
        role="group"
        aria-label="Display settings"
      >
        <DockIconButton
          active={false}
          onClick={() => setDarkMode(!darkMode)}
          label={darkMode ? "Switch to light theme" : "Switch to dark theme"}
        >
          {darkMode ? (
            <Moon className="h-[15px] w-[15px] text-blue-300 drop-shadow-[0_0_4px_rgba(139,180,248,0.45)]" strokeWidth={1.75} aria-hidden />
          ) : (
            <Sun className="h-[15px] w-[15px] text-blue-600 drop-shadow-[0_0_4px_rgba(37,99,235,0.3)]" strokeWidth={1.75} aria-hidden />
          )}
        </DockIconButton>
        <span className="h-px w-4 bg-black/[0.07] dark:bg-white/[0.08]" aria-hidden />
        <DockIconButton active={readMode} onClick={toggleReadMode} label="Toggle read mode">
          <BookOpen
            className={`h-[15px] w-[15px] transition-colors ${
              readMode
                ? "text-blue-600 dark:text-blue-300 drop-shadow-[0_0_4px_rgba(37,99,235,0.3)]"
                : "text-gray-400 dark:text-gray-500"
            }`}
            strokeWidth={1.75}
            aria-hidden
          />
        </DockIconButton>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div
        className="inline-flex items-center gap-0.5 rounded-full border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.04] p-[3px] read-mode:bg-[var(--read-surface-elevated)] read-mode:border-[var(--read-border)]"
        role="group"
        aria-label="Display settings"
      >
        <DockPillButton active={!darkMode} onClick={() => setDarkMode(false)} label="Light theme">
          <Sun className="h-[13px] w-[13px]" strokeWidth={1.75} aria-hidden />
        </DockPillButton>
        <DockPillButton active={darkMode} onClick={() => setDarkMode(true)} label="Dark theme">
          <Moon className="h-[13px] w-[13px]" strokeWidth={1.75} aria-hidden />
        </DockPillButton>
        <span className="mx-0.5 h-3.5 w-px shrink-0 bg-black/[0.08] dark:bg-white/10" aria-hidden />
        <DockPillButton active={readMode} onClick={toggleReadMode} label="Read mode">
          <BookOpen className="h-[13px] w-[13px]" strokeWidth={1.75} aria-hidden />
        </DockPillButton>
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

/** Small circular button used inside the collapsed vertical dock */
function DockIconButton({ active, onClick, label, children }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      title={label}
      aria-label={label}
      className={`flex h-7 w-7 items-center justify-center rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 ${
        active
          ? "bg-white dark:bg-white/10 shadow-sm"
          : "hover:bg-white/70 dark:hover:bg-white/[0.06]"
      }`}
    >
      {children}
    </button>
  );
}

/** Segment button used inside the merged horizontal dock pill */
function DockPillButton({ active, onClick, label, children }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={`relative inline-flex h-6 w-6 items-center justify-center rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 ${
        active
          ? "bg-white dark:bg-white/10 text-blue-600 dark:text-blue-300 shadow-sm"
          : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
      }`}
    >
      {children}
    </button>
  );
}

function ThemeSegment({ darkMode, setDarkMode }) {
  return (
    <div
      className="relative inline-grid grid-cols-2 items-stretch rounded-lg border border-slate-200/80 dark:border-slate-700/70 bg-slate-100/80 dark:bg-white/[0.03] p-0.5"
      role="group"
      aria-label="Theme"
    >
      <span
        className="pointer-events-none absolute top-0.5 bottom-0.5 rounded-md bg-white dark:bg-white/[0.08] shadow-sm ring-1 ring-slate-200/70 dark:ring-white/[0.06] transition-[left] duration-200 ease-out"
        style={{
          width: "calc(50% - 2px)",
          left: darkMode ? "calc(50% + 1px)" : "2px",
        }}
        aria-hidden
      />
      <ThemeOption active={!darkMode} onClick={() => setDarkMode(false)} label="Light theme">
        <Sun
          className={`w-[15px] h-[15px] transition-all duration-200 ${
            !darkMode
              ? "text-blue-600 dark:text-blue-300 drop-shadow-[0_0_4px_rgba(37,99,235,0.35)]"
              : "text-slate-400 dark:text-slate-500"
          }`}
          strokeWidth={1.5}
          aria-hidden
        />
      </ThemeOption>
      <ThemeOption active={darkMode} onClick={() => setDarkMode(true)} label="Dark theme">
        <Moon
          className={`w-[15px] h-[15px] transition-all duration-200 ${
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

function ThemeOption({ active, onClick, label, children }) {
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
      className="relative z-[1] inline-flex w-full items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed] dark:focus-visible:ring-[#a78bfa] focus-visible:ring-offset-1 dark:focus-visible:ring-offset-[#202124] h-8 px-3 sm:px-4 gap-1.5"
    >
      {children}
      <span className="text-[11px] text-slate-700 dark:text-slate-200">
        {label.replace(" theme", "")}
      </span>
    </button>
  );
}

function ReadModeButton({ readMode, toggleReadMode }) {
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
      className={`inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-lg border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed] dark:focus-visible:ring-[#a78bfa] focus-visible:ring-offset-1 dark:focus-visible:ring-offset-[#202124] ${
        readMode
          ? "border-slate-200/80 dark:border-slate-700/70 bg-slate-100/80 dark:bg-white/[0.06] text-blue-600 dark:text-blue-300"
          : "border-transparent bg-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100/90 dark:hover:bg-slate-700/50"
      }`}
    >
      <BookOpen
        className={`w-4 h-4 transition-transform duration-200 ${readMode ? "drop-shadow-[0_0_4px_rgba(37,99,235,0.35)]" : ""}`}
        strokeWidth={1.5}
        aria-hidden
      />
      <span className="text-[11px] font-medium">Read</span>
    </button>
  );
}
