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

  // Keep fenced code blocks separated from surrounding prose
  text = text.replace(/([^\n])\n(```)/g, "$1\n\n$2");
  text = text.replace(/(```[^\n]*\n[\s\S]*?```)\n([^\n])/g, "$1\n\n$2");

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
  "lesson-cast-line mb-2 pl-3 border-l-4 border-indigo-400 bg-indigo-50 rounded-r-lg py-2.5 pr-3 list-none ml-0 text-[15px] text-gray-900 dark:bg-zinc-900 dark:text-slate-200 " +
  "read-mode:border-[var(--read-border)] read-mode:bg-[var(--read-callout-bg)] read-mode:text-[var(--read-text)]";

export function createLessonMarkdownComponents() {
  return {
    pre: ({ children }) => (
      <div className="my-5 overflow-hidden rounded-xl border border-gray-200/80 shadow-sm dark:border-slate-800 read-mode:border-[var(--read-border)]">
        <div className="flex items-center gap-2 border-b border-gray-200/80 bg-gray-100 px-3.5 py-2 dark:border-slate-800 dark:bg-slate-900 read-mode:border-[var(--read-border)] read-mode:bg-[var(--read-surface)]">
          <span className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
          </span>
          <span className="ml-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-slate-400 read-mode:text-[var(--read-text-muted)]">
            Code snippet
          </span>
        </div>
        <pre className="m-0 overflow-x-auto bg-gray-900 p-4 text-[13px] leading-relaxed text-gray-100 dark:bg-slate-950 dark:text-slate-100">
          {children}
        </pre>
      </div>
    ),
    code: ({ inline, className, children, ...props }) => {
      // react-markdown v9+ no longer passes the `inline` prop, so detect it:
      // block code is fenced (has a `language-` class) or spans multiple lines.
      const text = markdownChildText(children);
      const isBlock =
        inline === false ||
        /language-/.test(className || "") ||
        text.includes("\n");

      return isBlock ? (
        <code
          className={`${className || ""} block whitespace-pre font-mono`}
          {...props}
        >
          {children}
        </code>
      ) : (
        <code
          className="rounded-md border border-indigo-200/70 bg-indigo-50 px-1.5 py-0.5 font-mono text-[0.85em] font-medium text-indigo-700 before:content-none after:content-none dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300 read-mode:border-[var(--read-border)] read-mode:bg-[var(--read-surface)] read-mode:text-[var(--read-text)]"
          {...props}
        >
          {children}
        </code>
      );
    },
    h1: ({ children }) => (
      <h1 className="mb-3 mt-6 text-xl font-bold tracking-tight text-gray-900 first:mt-0 dark:text-slate-100 read-mode:text-[var(--read-text-heading)]">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="mb-2.5 mt-6 text-lg font-bold tracking-tight text-gray-900 first:mt-0 dark:text-slate-100 read-mode:text-[var(--read-text-heading)]">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mb-2 mt-5 text-base font-semibold text-gray-900 first:mt-0 dark:text-slate-100 read-mode:text-[var(--read-text-heading)]">
        {children}
      </h3>
    ),
    p: ({ children }) => (
      <p className="mb-4 text-[15px] leading-7 tracking-[0.003em] text-gray-700 last:mb-0 dark:text-slate-300 read-mode:text-[var(--read-text)]">
        {children}
      </p>
    ),
    em: ({ children }) => (
      <em className="italic text-gray-700 dark:text-slate-300 read-mode:text-[var(--read-text)]">
        {children}
      </em>
    ),
    a: ({ children, href }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-blue-600 underline decoration-blue-400/40 underline-offset-2 transition-colors hover:text-blue-700 hover:decoration-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
      >
        {children}
      </a>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-4 rounded-r-lg border-l-4 border-blue-300 bg-blue-50/60 py-2 pl-4 pr-3 text-[15px] italic leading-7 text-gray-700 dark:border-blue-500/40 dark:bg-blue-500/5 dark:text-slate-300 read-mode:border-[var(--read-border)] read-mode:bg-[var(--read-callout-bg)] read-mode:text-[var(--read-text)]">
        {children}
      </blockquote>
    ),
    hr: () => (
      <hr className="my-6 border-0 border-t border-gray-200 dark:border-slate-800 read-mode:border-[var(--read-border)]" />
    ),
    li: ({ children }) => {
      const text = markdownChildText(children);
      const isCastMapping =
        /\*\*[^*]+\*\*\s*=\s*/.test(text) ||
        (/\s=\s/.test(text) && /\([^)]+\)/.test(text));

      if (isCastMapping) {
        return <li className={`${CAST_LINE_CLASS} list-none`}>{children}</li>;
      }

      return (
        <li className="pl-1.5 text-[15px] leading-7 text-gray-700 dark:text-slate-300 read-mode:text-[var(--read-text)]">
          {children}
        </li>
      );
    },
    ul: ({ children }) => (
      <ul className="mb-4 space-y-1.5 pl-5 list-disc marker:text-blue-400 last:mb-0 dark:marker:text-blue-500 read-mode:marker:text-[var(--read-border)]">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="mb-4 space-y-1.5 pl-5 list-decimal marker:font-semibold marker:text-blue-500 last:mb-0 dark:marker:text-blue-400 read-mode:marker:text-[var(--read-border)]">
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
      if (label === "Example") {
        return (
          <strong className="lesson-section-heading block text-emerald-800 dark:text-emerald-300 font-bold text-base mt-6 mb-2 first:mt-0 read-mode:text-[var(--read-text-heading)]">
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
