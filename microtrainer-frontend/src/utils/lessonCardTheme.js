/** Light-mode pastel surfaces; dark mode always uses true black (#000). */
const DARK_ARTICLE =
  "dark:!bg-black dark:border-zinc-800 dark:shadow-none";
const DARK_PROSE = "dark:text-slate-200";
const DARK_DIVIDER = "dark:border-zinc-800";

export const LESSON_CARD_THEMES = {
  silver: {
    id: "silver",
    label: "Silver",
    swatch: "lesson-card-silver-swatch border-gray-400",
    article:
      `lesson-card-surface lesson-card-silver border-gray-300 shadow-sm ${DARK_ARTICLE}`,
    prose: `text-[#171717] ${DARK_PROSE}`,
    divider:
      `border-gray-400/60 ${DARK_DIVIDER} read-mode:border-[var(--read-border)]`,
  },
  white: {
    id: "white",
    label: "White",
    swatch: "bg-white border-gray-300 dark:bg-black dark:border-zinc-600",
    article:
      `lesson-card-surface bg-white border-gray-200 shadow-sm ${DARK_ARTICLE}`,
    prose: `text-gray-800 ${DARK_PROSE}`,
    divider:
      `border-gray-100 ${DARK_DIVIDER} read-mode:border-[var(--read-border)]`,
  },
  yellow: {
    id: "yellow",
    label: "Yellow",
    swatch: "bg-amber-50 border-amber-300",
    article:
      `lesson-card-surface bg-amber-50 border-amber-200 shadow-sm ${DARK_ARTICLE}`,
    prose: `text-gray-800 ${DARK_PROSE}`,
    divider:
      `border-amber-200/80 ${DARK_DIVIDER} read-mode:border-[var(--read-border)]`,
  },
  mint: {
    id: "mint",
    label: "Mint",
    swatch: "bg-emerald-50 border-emerald-300",
    article:
      `lesson-card-surface bg-emerald-50 border-emerald-200 shadow-sm ${DARK_ARTICLE}`,
    prose: `text-gray-800 ${DARK_PROSE}`,
    divider:
      `border-emerald-200/80 ${DARK_DIVIDER} read-mode:border-[var(--read-border)]`,
  },
  sky: {
    id: "sky",
    label: "Sky",
    swatch: "bg-sky-50 border-sky-300",
    article:
      `lesson-card-surface bg-sky-50 border-sky-200 shadow-sm ${DARK_ARTICLE}`,
    prose: `text-gray-800 ${DARK_PROSE}`,
    divider:
      `border-sky-200/80 ${DARK_DIVIDER} read-mode:border-[var(--read-border)]`,
  },
  lavender: {
    id: "lavender",
    label: "Lavender",
    swatch: "bg-violet-50 border-violet-300",
    article:
      `lesson-card-surface bg-violet-50 border-violet-200 shadow-sm ${DARK_ARTICLE}`,
    prose: `text-gray-800 ${DARK_PROSE}`,
    divider:
      `border-violet-200/80 ${DARK_DIVIDER} read-mode:border-[var(--read-border)]`,
  },
};

const STORAGE_KEY = "microtrainer_lesson_card_theme";
const THEME_VERSION_KEY = "microtrainer_lesson_card_theme_version";
const THEME_VERSION = "2";

export function loadLessonCardTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const version = localStorage.getItem(THEME_VERSION_KEY);
    if (version !== THEME_VERSION && (!saved || saved === "white")) {
      return "silver";
    }
    if (saved && LESSON_CARD_THEMES[saved]) return saved;
  } catch {
    /* ignore */
  }
  return "silver";
}

export function saveLessonCardTheme(themeId) {
  try {
    localStorage.setItem(STORAGE_KEY, themeId);
    localStorage.setItem(THEME_VERSION_KEY, THEME_VERSION);
  } catch {
    /* ignore */
  }
}

export function getLessonCardThemeStyles(themeId) {
  return LESSON_CARD_THEMES[themeId] || LESSON_CARD_THEMES.silver;
}
