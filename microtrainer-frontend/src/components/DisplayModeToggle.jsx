import { useDisplayMode } from "../hooks/useDisplayMode";

/**
 * Theme + read mode controls.
 * compact: Light/Dark segment for nav bars
 * panel: full-width bar for lesson pages
 */
export default function DisplayModeToggle({ variant = "panel" }) {
  const { darkMode, readMode, setDarkMode, toggleReadMode } = useDisplayMode();
  const isCompact = variant === "compact";

  if (isCompact) {
    return (
      <div
        className="flex items-center gap-2"
        role="group"
        aria-label="Display settings"
      >
        <ThemeSegment darkMode={darkMode} setDarkMode={setDarkMode} compact />
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleReadMode();
          }}
          title="Read mode — warmer colors, easier on the eyes"
          aria-label="Toggle read mode"
          aria-pressed={readMode}
          className={`inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium transition border ${
            readMode
              ? "border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-200"
              : "border-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50"
          }`}
        >
          <span aria-hidden>📖</span>
          <span className="hidden sm:inline">Read</span>
        </button>
      </div>
    );
  }

  return (
    <div
      className="flex flex-wrap items-center justify-between gap-3 py-2 px-3 sm:px-4 mb-3 rounded-xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-600/80"
      role="region"
      aria-label="Display settings"
    >
      <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 shrink-0">
        Appearance
      </span>
      <div className="flex items-center gap-3 flex-wrap justify-end flex-1">
        <ThemeSegment darkMode={darkMode} setDarkMode={setDarkMode} compact={false} />
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleReadMode();
          }}
          title="Read mode"
          aria-pressed={readMode}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-medium transition ${
            readMode
              ? "border-blue-400 dark:border-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              : "border-transparent text-slate-500 dark:text-slate-400 hover:bg-white/80 dark:hover:bg-slate-700/50"
          }`}
        >
          <span aria-hidden>📖</span>
          Read mode
        </button>
      </div>
      <p className="text-[11px] text-slate-400 dark:text-slate-500 w-full sm:w-auto sm:text-right leading-tight">
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

function ThemeSegment({ darkMode, setDarkMode, compact }) {
  return (
    <div
      className={`inline-flex rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 p-0.5 ${
        compact ? "" : ""
      }`}
      role="group"
      aria-label="Theme"
    >
      <ThemeOption
        active={!darkMode}
        onClick={() => setDarkMode(false)}
        label="Light"
        icon="☀️"
        compact={compact}
      />
      <ThemeOption
        active={darkMode}
        onClick={() => setDarkMode(true)}
        label="Dark"
        icon="🌙"
        compact={compact}
      />
    </div>
  );
}

function ThemeOption({ active, onClick, label, icon, compact }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      aria-pressed={active}
      aria-label={`${label} theme`}
      className={`inline-flex items-center gap-1 rounded-md font-medium transition ${
        compact ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-[11px]"
      } ${
        active
          ? "bg-[#1a73e8] text-white shadow-sm dark:bg-[#8ab4f8] dark:text-gray-900"
          : "text-gray-600 dark:text-gray-400 hover:bg-gray-200/80 dark:hover:bg-gray-700/60"
      }`}
    >
      <span aria-hidden>{icon}</span>
      {label}
    </button>
  );
}
