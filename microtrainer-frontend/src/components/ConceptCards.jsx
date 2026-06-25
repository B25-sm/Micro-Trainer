/**
 * ConceptCards — renders a structured concept answer (Explanation / Real-World
 * Application / Code Example) as a polished, side-by-side card layout.
 *
 * The chat AI is prompted to answer concept questions with three bold sections.
 * `parseConceptSections` splits the raw markdown into those parts; if the shape
 * doesn't match, it returns null and the caller falls back to plain markdown.
 */

import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import { Lightbulb, Globe2 } from "lucide-react";
import {
  createLessonMarkdownComponents,
  normalizeLessonMarkdown,
} from "../utils/lessonMarkdown";

const textComponents = createLessonMarkdownComponents();

/* ------------------------------------------------------------------ */
/* Parsing                                                             */
/* ------------------------------------------------------------------ */

export function parseConceptSections(raw) {
  const text = String(raw || "").trim();
  if (!text) return null;

  const headerRegex = /\*\*([^*\n]{2,60}?)\*\*/g;
  const headers = [];
  let match;
  while ((match = headerRegex.exec(text)) !== null) {
    headers.push({
      title: match[1].trim(),
      start: match.index,
      end: match.index + match[0].length,
    });
  }
  if (headers.length < 2) return null;

  const rwIdx = headers.findIndex((h) =>
    /real[\s-]*world|real[\s-]*time|use\s*case/i.test(h.title)
  );
  const codeIdx = headers.findIndex((h) =>
    /code\s*example|code\s*snippet|^example$/i.test(h.title)
  );
  if (rwIdx < 1 || codeIdx < 0 || codeIdx <= rwIdx) return null;

  const explHeader = headers[0];
  const explanationTitle = explHeader.title || "Explanation";
  const explanationBody = text.slice(explHeader.end, headers[rwIdx].start).trim();
  const realWorldBody = text
    .slice(headers[rwIdx].end, headers[codeIdx].start)
    .trim();
  const codeBlock = text.slice(headers[codeIdx].end).trim();

  if (!explanationBody || !realWorldBody || !codeBlock) return null;

  const fence = codeBlock.match(/```([\w+#-]*)\s*\n?([\s\S]*?)```/);
  if (!fence) return null;

  const codeLang = (fence[1] || "").toLowerCase();
  const codeRaw = fence[2].replace(/\s+$/, "");
  const codeNote = codeBlock.slice(fence.index + fence[0].length).trim();
  if (!codeRaw) return null;

  return {
    explanationTitle,
    explanationBody,
    realWorldBody,
    codeLang,
    codeRaw,
    codeNote,
  };
}

/* ------------------------------------------------------------------ */
/* Lightweight syntax highlighter (no external deps)                   */
/* ------------------------------------------------------------------ */

const KEYWORDS = new Set([
  // shared / JS / TS
  "const", "let", "var", "function", "return", "if", "else", "for", "while",
  "do", "switch", "case", "break", "continue", "new", "class", "extends",
  "super", "this", "import", "from", "export", "default", "await", "async",
  "try", "catch", "finally", "throw", "typeof", "instanceof", "in", "of",
  "yield", "static", "get", "set", "void", "delete",
  // python
  "def", "elif", "lambda", "pass", "with", "as", "global", "nonlocal",
  "raise", "except", "import", "print", "self", "None", "True", "False",
  "and", "or", "not", "is",
  // java / c-like
  "public", "private", "protected", "package", "interface", "implements",
  "void", "int", "long", "double", "float", "boolean", "char", "String",
  "final", "abstract", "enum", "null", "true", "false",
  // sql
  "select", "from", "where", "insert", "into", "values", "update", "set",
  "delete", "join", "left", "right", "inner", "outer", "on", "group", "by",
  "order", "having", "limit", "create", "table", "primary", "key", "foreign",
  "references", "and", "or", "not", "as", "distinct", "count", "sum", "avg",
]);

const LITERALS = new Set(["true", "false", "null", "none", "nil", "undefined"]);

const TOKEN_RE =
  /(\/\/[^\n]*|#[^\n]*|\/\*[\s\S]*?\*\/|--[^\n]*)|(`(?:[^`\\]|\\.)*`|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(\b\d[\d_.]*\b)|([A-Za-z_$][\w$]*)/g;

function highlightLine(line, keyOffset) {
  const nodes = [];
  let lastIndex = 0;
  let m;
  TOKEN_RE.lastIndex = 0;
  let i = 0;

  while ((m = TOKEN_RE.exec(line)) !== null) {
    if (m.index > lastIndex) {
      nodes.push(line.slice(lastIndex, m.index));
    }

    const [, comment, str, num, ident] = m;
    const key = `${keyOffset}-${i++}`;

    if (comment !== undefined) {
      nodes.push(
        <span key={key} className="italic text-slate-500">
          {comment}
        </span>
      );
    } else if (str !== undefined) {
      nodes.push(
        <span key={key} className="text-emerald-300">
          {str}
        </span>
      );
    } else if (num !== undefined) {
      nodes.push(
        <span key={key} className="text-amber-300">
          {num}
        </span>
      );
    } else if (ident !== undefined) {
      const lower = ident.toLowerCase();
      const after = line.slice(m.index + ident.length).trimStart();
      const isCall = after.startsWith("(");
      let cls = "text-slate-100";
      if (KEYWORDS.has(ident) || KEYWORDS.has(lower)) {
        cls = "font-medium text-fuchsia-400";
      } else if (LITERALS.has(lower)) {
        cls = "text-amber-300";
      } else if (isCall) {
        cls = "text-sky-300";
      } else if (/^[A-Z]/.test(ident)) {
        cls = "text-teal-300";
      }
      nodes.push(
        <span key={key} className={cls}>
          {ident}
        </span>
      );
    }

    lastIndex = m.index + m[0].length;
  }

  if (lastIndex < line.length) {
    nodes.push(line.slice(lastIndex));
  }
  return nodes;
}

/* ------------------------------------------------------------------ */
/* Presentational pieces                                               */
/* ------------------------------------------------------------------ */

const LANG_LABEL = {
  js: { label: "JavaScript", file: "example.js" },
  javascript: { label: "JavaScript", file: "example.js" },
  jsx: { label: "React", file: "App.jsx" },
  ts: { label: "TypeScript", file: "example.ts" },
  tsx: { label: "React", file: "App.tsx" },
  py: { label: "Python", file: "main.py" },
  python: { label: "Python", file: "main.py" },
  java: { label: "Java", file: "Main.java" },
  sql: { label: "SQL", file: "query.sql" },
  json: { label: "JSON", file: "data.json" },
  bash: { label: "Shell", file: "script.sh" },
  sh: { label: "Shell", file: "script.sh" },
  html: { label: "HTML", file: "index.html" },
  css: { label: "CSS", file: "styles.css" },
};

function TextCard({ icon: Icon, title, accent, body, delay }) {
  const accents = {
    blue: {
      bar: "from-blue-500 to-indigo-500",
      chip: "bg-blue-500/10 text-blue-600 dark:text-blue-300",
      ring: "group-hover:border-blue-300 dark:group-hover:border-blue-500/50",
    },
    emerald: {
      bar: "from-emerald-500 to-teal-500",
      chip: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
      ring: "group-hover:border-emerald-300 dark:group-hover:border-emerald-500/50",
    },
  }[accent];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: "easeOut" }}
      className={`group relative flex-1 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md dark:border-gray-700/70 dark:bg-[#1e1f22] ${accents.ring} read-mode:border-[var(--read-border)] read-mode:bg-[var(--read-surface)]`}
    >
      <div className={`h-1 w-full bg-gradient-to-r ${accents.bar}`} />
      <div className="p-4 sm:p-5">
        <div className="mb-2.5 flex items-center gap-2.5">
          <span
            className={`flex h-8 w-8 items-center justify-center rounded-xl ${accents.chip}`}
          >
            <Icon className="h-4 w-4" strokeWidth={2.4} />
          </span>
          <h3 className="text-[15px] font-semibold tracking-tight text-gray-900 dark:text-slate-100 read-mode:text-[var(--read-text-heading)]">
            {title}
          </h3>
        </div>
        <div className="text-gray-700 dark:text-slate-300">
          <ReactMarkdown components={textComponents}>
            {normalizeLessonMarkdown(body)}
          </ReactMarkdown>
        </div>
      </div>
    </motion.div>
  );
}

function CodeCard({ lang, code, note, delay }) {
  const meta = LANG_LABEL[lang] || { label: lang ? lang.toUpperCase() : "Code", file: "snippet" };
  const lines = code.split("\n");
  const gutterWidth = String(lines.length).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: "easeOut" }}
      className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-800 bg-[#0d1117] shadow-lg shadow-slate-900/20 ring-1 ring-black/5"
    >
      {/* Editor title bar */}
      <div className="flex items-center gap-3 border-b border-slate-800 bg-[#161b22] px-4 py-2.5">
        <span className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        </span>
        <span className="flex items-center gap-2 rounded-md bg-slate-800/60 px-2.5 py-1 text-[12px] font-medium text-slate-300">
          <span className="h-2 w-2 rounded-sm bg-sky-400" />
          {meta.file}
        </span>
        <span className="ml-auto text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
          {meta.label}
        </span>
      </div>

      {/* Code body */}
      <div className="flex-1 overflow-x-auto bg-[#0d1117] p-4">
        <pre className="m-0 text-[12.5px] leading-[1.7] font-mono">
          <code className="block">
            {lines.map((line, idx) => (
              <div key={idx} className="grid grid-cols-[auto_1fr] gap-4">
                <span
                  className="select-none text-right text-slate-600"
                  style={{ width: `${gutterWidth}ch` }}
                >
                  {idx + 1}
                </span>
                <span className="whitespace-pre text-slate-100">
                  {line.length ? highlightLine(line, idx) : "\u00A0"}
                </span>
              </div>
            ))}
          </code>
        </pre>
      </div>

      {note && (
        <div className="border-t border-slate-800 bg-[#11161d] px-4 py-2.5 text-[12.5px] leading-relaxed text-slate-400">
          <ReactMarkdown components={textComponents}>{note}</ReactMarkdown>
        </div>
      )}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Layout                                                              */
/* ------------------------------------------------------------------ */

export default function ConceptCards({ sections }) {
  const {
    explanationTitle,
    explanationBody,
    realWorldBody,
    codeLang,
    codeRaw,
    codeNote,
  } = sections;

  return (
    <div className="grid w-full gap-4 md:grid-cols-2">
      <div className="flex flex-col gap-4">
        <TextCard
          icon={Lightbulb}
          title={explanationTitle}
          accent="blue"
          body={explanationBody}
          delay={0}
        />
        <TextCard
          icon={Globe2}
          title="Real-World Application"
          accent="emerald"
          body={realWorldBody}
          delay={0.08}
        />
      </div>
      <CodeCard lang={codeLang} code={codeRaw} note={codeNote} delay={0.16} />
    </div>
  );
}
