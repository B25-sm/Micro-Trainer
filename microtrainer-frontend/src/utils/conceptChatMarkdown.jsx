/**
 * Markdown components tuned for home-chat concept answers — matches ConceptCards
 * typography and code-window styling when the parser falls back to plain markdown.
 */

import { createLessonMarkdownComponents } from "./lessonMarkdown";

const markdownChildText = (node) => {
  if (node == null) return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(markdownChildText).join("");
  if (node.props?.children) return markdownChildText(node.props.children);
  return "";
};

const CONCEPT_SECTION_LABELS = new Set([
  "plain definition",
  "mental model",
  "precise breakdown",
  "key insight",
  "real-world application",
  "real-world example",
  "real-world use",
  "code example",
  "code snippet",
  "example",
]);

function isConceptSectionLabel(label) {
  const lower = String(label || "").trim().toLowerCase();
  if (CONCEPT_SECTION_LABELS.has(lower)) return true;
  return /real[\s-]*world/i.test(lower);
}

const LANG_BADGE = {
  js: "JS",
  javascript: "JS",
  jsx: "JSX",
  ts: "TS",
  tsx: "TSX",
  py: "PY",
  python: "PY",
  java: "JV",
  sql: "SQL",
  json: "{}",
  bash: "SH",
  sh: "SH",
  html: "<>",
  css: "CSS",
};

const LANG_LABEL = {
  js: "JavaScript",
  javascript: "JavaScript",
  jsx: "React",
  ts: "TypeScript",
  tsx: "React",
  py: "Python",
  python: "Python",
  java: "Java",
  sql: "SQL",
  json: "JSON",
  bash: "Shell",
  sh: "Shell",
  html: "HTML",
  css: "CSS",
};

const LANG_FILE = {
  js: "example.js",
  javascript: "example.js",
  jsx: "App.jsx",
  ts: "example.ts",
  tsx: "App.tsx",
  py: "main.py",
  python: "main.py",
  java: "Main.java",
  sql: "query.sql",
};

function langFromClassName(className) {
  const match = String(className || "").match(/language-([\w+#-]+)/i);
  return (match?.[1] || "").toLowerCase();
}

export function createConceptChatMarkdownComponents() {
  const base = createLessonMarkdownComponents();

  return {
    ...base,
    pre: ({ children }) => {
      const codeEl = Array.isArray(children) ? children[0] : children;
      const className = codeEl?.props?.className || "";
      const lang = langFromClassName(className);
      const badge = LANG_BADGE[lang] || "</>";
      const label = LANG_LABEL[lang] || (lang ? lang.toUpperCase() : "Code");
      const file = LANG_FILE[lang] || "snippet";

      return (
        <div className="my-5 overflow-hidden rounded-xl bg-[#0d1117] ring-1 ring-white/10">
          <div className="flex items-center gap-3 bg-[#161b22] px-4 py-2.5">
            <span className="flex gap-1.5">
              <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
              <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
              <span className="h-3 w-3 rounded-full bg-[#28c840]" />
            </span>
            <span className="flex items-center gap-1.5 rounded-md bg-white/5 px-2.5 py-1 text-[12px] font-medium text-slate-300">
              <span className="rounded bg-amber-400/90 px-1 text-[9px] font-bold leading-tight text-slate-900">
                {badge}
              </span>
              {file}
            </span>
            <span className="ml-auto text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              {label}
            </span>
          </div>
          <pre className="m-0 overflow-x-auto px-4 py-4 font-mono text-[12.5px] leading-[1.75] text-slate-100 sm:px-5">
            {children}
          </pre>
        </div>
      );
    },
    code: ({ inline, className, children, ...props }) => {
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
          className="rounded-md border border-gray-200/80 bg-gray-100 px-1.5 py-0.5 font-mono text-[0.85em] font-medium text-gray-800 before:content-none after:content-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          {...props}
        >
          {children}
        </code>
      );
    },
    h1: ({ children }) => (
      <h1 className="mb-4 mt-0 text-lg font-semibold tracking-wide text-gray-900 dark:text-slate-100 sm:text-xl">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="mb-3 mt-6 text-base font-semibold text-gray-900 first:mt-0 dark:text-slate-100">
        {children}
      </h2>
    ),
    strong: ({ children }) => {
      const label = String(children).trim();
      if (isConceptSectionLabel(label)) {
        return (
          <strong className="mb-2 mt-6 block text-[11px] font-bold uppercase tracking-[0.14em] text-[#7c3aed] first:mt-0 dark:text-[#a78bfa]">
            {children}
          </strong>
        );
      }
      return (
        <strong className="font-semibold text-gray-900 dark:text-slate-100">
          {children}
        </strong>
      );
    },
  };
}
