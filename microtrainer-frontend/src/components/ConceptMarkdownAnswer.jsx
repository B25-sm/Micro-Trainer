/**
 * Polished markdown fallback for concept answers when parseConceptSections()
 * cannot split the AI reply into card slides — visually aligned with ConceptCards.
 */

import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  AnswerStyleToggle,
  CARD_STYLE_EVENT,
  getCardStyle,
  NEUTRAL_PALETTE,
} from "./ConceptCards";
import { normalizeLessonMarkdown } from "../utils/lessonMarkdown";
import { createConceptChatMarkdownComponents } from "../utils/conceptChatMarkdown";

const conceptMdComponents = createConceptChatMarkdownComponents();

function ConceptAnswerFrame({ theme, cardStyle, children }) {
  return (
    <div
      className={`concept-answer-frame concept-style-${cardStyle} overflow-hidden rounded-[1.25rem] bg-gradient-to-br ${theme.stage} p-2 ${theme.glow}`}
    >
      <div className="concept-text-panel rounded-xl bg-white px-4 py-3 dark:bg-[#1a1b1e] sm:px-5 sm:py-4 read-mode:bg-[var(--read-surface)]">
        <div className="learning-prose">
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

  const [cardStyle, setCardStyleState] = useState(getCardStyle);
  useEffect(() => {
    const sync = () => setCardStyleState(getCardStyle());
    window.addEventListener(CARD_STYLE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CARD_STYLE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const theme = NEUTRAL_PALETTE[0];

  return (
    <div
      className={`w-full max-w-3xl transition-shadow ${
        highlighted
          ? "shadow-[0_0_0_2px] shadow-blue-400/70 dark:shadow-blue-500/60"
          : ""
      }`}
    >
      <div className="mb-3 flex justify-end">
        <AnswerStyleToggle style={cardStyle} />
      </div>

      <ConceptAnswerFrame theme={theme} cardStyle={cardStyle}>
        <ReactMarkdown components={conceptMdComponents}>
          {normalized}
        </ReactMarkdown>
      </ConceptAnswerFrame>
    </div>
  );
}
