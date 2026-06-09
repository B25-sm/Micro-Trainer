/**
 * Normalize AI lesson markdown + shared ReactMarkdown components
 * (single flowing document — cast list, section headers, alignment)
 */

export const SECTION_HEADERS = [
  "Why",
  "What",
  "How",
  "Real-time use case",
  "Key takeaway",
  "Example",
];

const markdownChildText = (node) => {
  if (node == null) return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(markdownChildText).join("");
  if (node.props?.children) return markdownChildText(node.props.children);
  return "";
};

/** Fix common Groq output so lists, headers, and bold render correctly */
export function normalizeLessonMarkdown(content) {
  let text = String(content || "").trim();
  if (!text) return "";

  text = text.replace(/\r\n/g, "\n");

  // Ensure section headers start on their own paragraph
  text = text.replace(
    /\n?(\*\*(?:Why|What|How|Real-time use case|Key takeaway|Example)\*\*)/gi,
    "\n\n$1"
  );

  // Cast mapping lines without bullets → proper list items
  text = text.replace(/^(\*\*[^*\n]+\*\*\s*=\s*.+)$/gm, "- $1");

  // Real-time sub-headers on their own line
  text = text.replace(
    /(\*\*What the user sees[^*]*\*\*)/gi,
    "\n\n$1"
  );
  text = text.replace(
    /(\*\*What happens internally[^*]*\*\*)/gi,
    "\n\n$1"
  );

  text = text.replace(/\n{3,}/g, "\n\n");
  return text.trim();
}

const CAST_LINE_CLASS =
  "lesson-cast-line mb-2 pl-3 border-l-4 border-indigo-400 bg-indigo-50 rounded-r-lg py-2.5 pr-3 list-none ml-0 text-[15px] text-gray-900 dark:text-gray-900 " +
  "read-mode:border-[var(--read-border)] read-mode:bg-[var(--read-callout-bg)] read-mode:text-[var(--read-text)]";

export function createLessonMarkdownComponents() {
  return {
    code: ({ inline, children, ...props }) =>
      inline ? (
        <code
          className="bg-gray-200 px-1.5 py-0.5 rounded text-xs font-mono text-gray-900 read-mode:bg-[var(--read-surface)] read-mode:text-[var(--read-text)]"
          {...props}
        >
          {children}
        </code>
      ) : (
        <code
          className="block bg-gray-800 text-gray-100 dark:bg-slate-950 dark:text-slate-100 p-3 rounded-lg text-xs font-mono overflow-x-auto my-3"
          {...props}
        >
          {children}
        </code>
      ),
    p: ({ children }) => (
      <p className="mb-3 last:mb-0 leading-relaxed text-[15px] text-gray-800 dark:text-slate-200 read-mode:text-[var(--read-text)]">
        {children}
      </p>
    ),
    li: ({ children }) => {
      const text = markdownChildText(children);
      const isCastMapping =
        /\*\*[^*]+\*\*\s*=\s*/.test(text) ||
        (/\s=\s/.test(text) && /\([^)]+\)/.test(text));

      return (
        <li
          className={
            isCastMapping
              ? CAST_LINE_CLASS
              : "mb-1.5 text-gray-800 dark:text-slate-200 leading-relaxed read-mode:text-[var(--read-text)]"
          }
        >
          {children}
        </li>
      );
    },
    ul: ({ children }) => (
      <ul className="mb-4 space-y-1 pl-1 list-none">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="mb-4 space-y-1.5 pl-5 list-decimal text-gray-800 dark:text-slate-200 read-mode:text-[var(--read-text)]">
        {children}
      </ol>
    ),
    strong: ({ children }) => {
      const label = String(children).trim();
      const realtimeSubHeaders = [
        "What the user sees on the app/website:",
        "What the user sees:",
        "What happens internally (user never sees this):",
        "What happens internally:",
      ];
      const isRealtimeSub =
        realtimeSubHeaders.includes(label) ||
        /^What the user sees/i.test(label) ||
        /^What happens internally/i.test(label);

      if (SECTION_HEADERS.includes(label)) {
        return (
          <strong className="lesson-section-heading block text-blue-800 dark:text-blue-300 font-bold text-base mt-6 mb-2 first:mt-0 read-mode:text-[var(--read-text-heading)]">
            {children}
          </strong>
        );
      }
      if (isRealtimeSub) {
        return (
          <strong className="block text-indigo-800 dark:text-indigo-300 font-semibold text-sm mt-4 mb-1.5 read-mode:text-[var(--read-text-heading)]">
            {children}
          </strong>
        );
      }
      return (
        <strong className="font-semibold text-gray-900 dark:text-slate-100 read-mode:text-[var(--read-text-heading)]">
          {children}
        </strong>
      );
    },
  };
}
