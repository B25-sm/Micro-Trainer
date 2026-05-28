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

export function createLessonMarkdownComponents() {
  return {
    code: ({ inline, children, ...props }) =>
      inline ? (
        <code
          className="bg-gray-200 px-1.5 py-0.5 rounded text-xs font-mono text-gray-800"
          {...props}
        >
          {children}
        </code>
      ) : (
        <code
          className="block bg-gray-800 text-gray-100 p-3 rounded-lg text-xs font-mono overflow-x-auto my-3"
          {...props}
        >
          {children}
        </code>
      ),
    p: ({ children }) => (
      <p className="mb-3 last:mb-0 leading-relaxed text-[15px] text-gray-800">
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
              ? "mb-2 pl-1 border-l-2 border-indigo-300 bg-indigo-50/70 rounded-r py-2 pr-3 list-none ml-0 text-[15px] text-gray-800"
              : "mb-1.5 text-gray-800 leading-relaxed"
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
      <ol className="mb-4 space-y-1.5 pl-5 list-decimal text-gray-800">{children}</ol>
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
          <strong className="block text-blue-700 font-bold text-base mt-6 mb-2 first:mt-0">
            {children}
          </strong>
        );
      }
      if (isRealtimeSub) {
        return (
          <strong className="block text-indigo-700 font-semibold text-sm mt-4 mb-1.5">
            {children}
          </strong>
        );
      }
      return <strong className="font-semibold text-gray-900">{children}</strong>;
    },
  };
}
