export const LESSON_CARD_THEMES = {
  white: {
    id: "white",
    label: "White",
    swatch: "bg-white border-gray-300 dark:bg-slate-700 dark:border-slate-500",
    article:
      "bg-white border-gray-200 dark:bg-slate-800 dark:border-slate-600 read-mode:bg-[var(--read-surface-elevated)] read-mode:border-[var(--read-border)]",
    divider:
      "border-gray-100 dark:border-slate-700 read-mode:border-[var(--read-border)]",
  },
  yellow: {
    id: "yellow",
    label: "Yellow",
    swatch: "bg-amber-50 border-amber-300 dark:bg-amber-950 dark:border-amber-700",
    article:
      "bg-amber-50/95 border-amber-200 dark:bg-amber-950/80 dark:border-amber-800 read-mode:bg-[var(--read-surface-elevated)] read-mode:border-[var(--read-border)]",
    divider:
      "border-amber-200/70 dark:border-amber-800 read-mode:border-[var(--read-border)]",
  },
  mint: {
    id: "mint",
    label: "Mint",
    swatch: "bg-emerald-50 border-emerald-300 dark:bg-emerald-950 dark:border-emerald-700",
    article:
      "bg-emerald-50/95 border-emerald-200 dark:bg-emerald-950/80 dark:border-emerald-800 read-mode:bg-[var(--read-surface-elevated)] read-mode:border-[var(--read-border)]",
    divider:
      "border-emerald-200/70 dark:border-emerald-800 read-mode:border-[var(--read-border)]",
  },
  sky: {
    id: "sky",
    label: "Sky",
    swatch: "bg-sky-50 border-sky-300 dark:bg-sky-950 dark:border-sky-700",
    article:
      "bg-sky-50/95 border-sky-200 dark:bg-sky-950/80 dark:border-sky-800 read-mode:bg-[var(--read-surface-elevated)] read-mode:border-[var(--read-border)]",
    divider:
      "border-sky-200/70 dark:border-sky-800 read-mode:border-[var(--read-border)]",
  },
  lavender: {
    id: "lavender",
    label: "Lavender",
    swatch: "bg-violet-50 border-violet-300 dark:bg-violet-950 dark:border-violet-700",
    article:
      "bg-violet-50/95 border-violet-200 dark:bg-violet-950/80 dark:border-violet-800 read-mode:bg-[var(--read-surface-elevated)] read-mode:border-[var(--read-border)]",
    divider:
      "border-violet-200/70 dark:border-violet-800 read-mode:border-[var(--read-border)]",
  },
};

const STORAGE_KEY = "microtrainer_lesson_card_theme";

export function loadLessonCardTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && LESSON_CARD_THEMES[saved]) return saved;
  } catch {
    /* ignore */
  }
  return "white";
}

export function saveLessonCardTheme(themeId) {
  try {
    localStorage.setItem(STORAGE_KEY, themeId);
  } catch {
    /* ignore */
  }
}

export function getLessonCardThemeStyles(themeId) {
  return LESSON_CARD_THEMES[themeId] || LESSON_CARD_THEMES.white;
}
