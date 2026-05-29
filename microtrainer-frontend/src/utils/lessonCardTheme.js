export const LESSON_CARD_THEMES = {
  white: {
    id: "white",
    label: "White",
    swatch: "bg-white border-gray-300",
    article:
      "lesson-card-surface bg-white border-gray-200 shadow-sm dark:bg-white dark:border-slate-400",
    prose: "text-gray-800 dark:text-gray-900",
    divider:
      "border-gray-100 dark:border-gray-200 read-mode:border-[var(--read-border)]",
  },
  yellow: {
    id: "yellow",
    label: "Yellow",
    swatch: "bg-amber-50 border-amber-300",
    article:
      "lesson-card-surface bg-amber-50 border-amber-200 shadow-sm dark:bg-amber-50 dark:border-amber-300",
    prose: "text-gray-800 dark:text-gray-900",
    divider:
      "border-amber-200/80 dark:border-amber-200 read-mode:border-[var(--read-border)]",
  },
  mint: {
    id: "mint",
    label: "Mint",
    swatch: "bg-emerald-50 border-emerald-300",
    article:
      "lesson-card-surface bg-emerald-50 border-emerald-200 shadow-sm dark:bg-emerald-50 dark:border-emerald-300",
    prose: "text-gray-800 dark:text-gray-900",
    divider:
      "border-emerald-200/80 dark:border-emerald-200 read-mode:border-[var(--read-border)]",
  },
  sky: {
    id: "sky",
    label: "Sky",
    swatch: "bg-sky-50 border-sky-300",
    article:
      "lesson-card-surface bg-sky-50 border-sky-200 shadow-sm dark:bg-sky-50 dark:border-sky-300",
    prose: "text-gray-800 dark:text-gray-900",
    divider:
      "border-sky-200/80 dark:border-sky-200 read-mode:border-[var(--read-border)]",
  },
  lavender: {
    id: "lavender",
    label: "Lavender",
    swatch: "bg-violet-50 border-violet-300",
    article:
      "lesson-card-surface bg-violet-50 border-violet-200 shadow-sm dark:bg-violet-50 dark:border-violet-300",
    prose: "text-gray-800 dark:text-gray-900",
    divider:
      "border-violet-200/80 dark:border-violet-200 read-mode:border-[var(--read-border)]",
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
