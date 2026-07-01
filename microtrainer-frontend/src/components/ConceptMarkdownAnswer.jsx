/**
 * Polished markdown fallback for concept answers when parseConceptSections()
 * cannot split the AI reply into card slides — visually aligned with ConceptCards.
 */

import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Palette } from "lucide-react";
import {
  getColorPref,
  setColorPref,
  COLOR_PREF_EVENT,
  pickPalette,
  NEUTRAL_PALETTE,
} from "./ConceptCards";
import { normalizeLessonMarkdown } from "../utils/lessonMarkdown";
import { createConceptChatMarkdownComponents } from "../utils/conceptChatMarkdown";

const conceptMdComponents = createConceptChatMarkdownComponents();

function ConceptAnswerFrame({ theme, children }) {
  return (
    <div
      className={`overflow-hidden rounded-[2rem] bg-gradient-to-br ${theme.stage} p-4 ${theme.glow} sm:p-5`}
    >
      <div className="rounded-xl bg-white px-5 py-4 dark:bg-[#1a1b1e] sm:px-7 sm:py-6 read-mode:bg-[var(--read-surface)]">
        <div className="text-[15px] leading-relaxed text-gray-700 dark:text-slate-300">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function ConceptMarkdownAnswer({ content, highlighted }) {
  const normalized = useMemo(
    () => normalizeLessonMarkdown(content),
    [content]
  );

  const [colorOn, setColorOn] = useState(getColorPref);
  useEffect(() => {
    const sync = () => setColorOn(getColorPref());
    window.addEventListener(COLOR_PREF_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(COLOR_PREF_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const theme = useMemo(
    () =>
      colorOn ? pickPalette(content)[0] : NEUTRAL_PALETTE[0],
    [colorOn, content]
  );

  return (
    <div
      className={`w-full max-w-3xl transition-shadow ${
        highlighted
          ? "shadow-[0_0_0_2px] shadow-blue-400/70 dark:shadow-blue-500/60"
          : ""
      }`}
    >
      <div className="mb-3 flex justify-end">
        <button
          type="button"
          onClick={() => setColorPref(!colorOn)}
          title={colorOn ? "Turn off colored themes" : "Turn on colored themes"}
          aria-label={colorOn ? "Turn off colored themes" : "Turn on colored themes"}
          aria-pressed={colorOn}
          className={`flex items-center justify-center rounded-full p-1.5 transition-colors ${
            colorOn
              ? "text-[#1a73e8] hover:bg-blue-50 dark:text-[#8ab4f8] dark:hover:bg-[#2a2b2e]"
              : "text-gray-400 hover:bg-gray-100 dark:text-gray-500 dark:hover:bg-[#2a2b2e]"
          }`}
        >
          <Palette className="h-4 w-4" strokeWidth={2.2} />
        </button>
      </div>

      <ConceptAnswerFrame theme={theme}>
        <ReactMarkdown components={conceptMdComponents}>
          {normalized}
        </ReactMarkdown>
      </ConceptAnswerFrame>
    </div>
  );
}
