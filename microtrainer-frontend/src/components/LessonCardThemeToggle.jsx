import { motion } from "framer-motion";
import { LESSON_CARD_THEMES } from "../utils/lessonCardTheme";

const THEME_ORDER = ["white", "yellow", "mint", "sky", "lavender"];

/**
 * Compact card background picker — sits beside Reading / Lucid controls.
 */
export default function LessonCardThemeToggle({ theme, onChange }) {
  return (
    <motion.div
      className="flex items-center justify-between gap-3 py-2 px-3 sm:px-4 mb-3 rounded-xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-600/80 read-mode:bg-[var(--read-surface-elevated)] read-mode:border-[var(--read-border)]"
      role="region"
      aria-label="Lesson card background"
    >
      <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 read-mode:text-[var(--read-text)] shrink-0">
        Card color
      </span>

      <motion.div
        className="flex flex-wrap items-center justify-end gap-2"
        role="group"
        aria-label="Choose background color"
      >
        {THEME_ORDER.map((id) => {
          const t = LESSON_CARD_THEMES[id];
          const active = theme === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              title={t.label}
              aria-label={`${t.label} background`}
              aria-pressed={active}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-full border text-[11px] font-medium transition ${
                active
                  ? "border-blue-400 dark:border-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm ring-2 ring-blue-200 dark:ring-blue-800"
                  : "border-transparent text-slate-500 dark:text-slate-400 hover:bg-white/80 dark:hover:bg-slate-700/50 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full border shrink-0 ${t.swatch}`}
                aria-hidden
              />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
