import { useMemo } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import {
  normalizeLessonMarkdown,
  createLessonMarkdownComponents,
} from "../utils/lessonMarkdown";
import { getLessonCardThemeStyles } from "../utils/lessonCardTheme";

const mdComponents = createLessonMarkdownComponents();

export default function StoryLessonContent({
  content,
  isTerse = false,
  level,
  badge,
  cardTheme = "white",
}) {
  const normalized = useMemo(
    () => normalizeLessonMarkdown(content),
    [content]
  );

  if (!normalized) return null;

  const levelLabel =
    level && typeof level === "string"
      ? `${level.charAt(0).toUpperCase()}${level.slice(1)} level`
      : null;

  const themeStyles = getLessonCardThemeStyles(cardTheme);

  return (
    <article
      className={`rounded-2xl border shadow-sm w-full transition-colors duration-300 ${themeStyles.article}`}
    >
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-5 py-4 sm:px-6 sm:py-5"
      >
        {(levelLabel || badge) && (
          <motion.div
            className={`flex flex-wrap items-center gap-2 mb-4 pb-3 border-b ${themeStyles.divider}`}
          >
            {levelLabel && (
              <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-800 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-200 dark:border-blue-800">
                {levelLabel}
              </span>
            )}
            {badge && (
              <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-900 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-200 dark:border-amber-800">
                {badge}
              </span>
            )}
          </motion.div>
        )}

        {isTerse ? (
          <div className="space-y-3">
            {normalized.split("\n").filter((l) => l.trim()).map((line, i) => (
              <div
                key={i}
                className="text-[15px] leading-relaxed text-gray-800 dark:text-slate-200 read-mode:text-[var(--read-text)] read-mode:text-[1.125rem] read-mode:leading-[1.85]"
              >
                <ReactMarkdown components={mdComponents}>{line}</ReactMarkdown>
              </div>
            ))}
          </div>
        ) : (
          <motion.div className="lesson-prose prose prose-base prose-neutral max-w-none text-gray-800 dark:text-slate-200 read-mode:text-[var(--read-text)] leading-relaxed [&_p]:leading-relaxed read-mode:prose-lg">
            <ReactMarkdown components={mdComponents}>{normalized}</ReactMarkdown>
          </motion.div>
        )}
      </motion.div>
    </article>
  );
}
