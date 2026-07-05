/**
 * ConceptCards — renders a structured concept answer (Explanation / Real-World
 * Application / Code Example) as a polished, side-by-side card layout.
 *
 * The chat AI is prompted to answer concept questions with three bold sections.
 * `parseConceptSections` splits the raw markdown into those parts; if the shape
 * doesn't match, it returns null and the caller falls back to plain markdown.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import { AnimatePresence, motion } from "framer-motion";
import { Lightbulb, Globe2, Code2, ChevronLeft, ChevronRight, Palette } from "lucide-react";
import {
  createLessonMarkdownComponents,
  normalizeLessonMarkdown,
} from "../utils/lessonMarkdown";

const textComponents = createLessonMarkdownComponents();

/* ------------------------------------------------------------------ */
/* Parsing                                                             */
/* ------------------------------------------------------------------ */

const FENCE_RE = /```([\w+#-]*)\s*\n?([\s\S]*?)```/;

export function parseConceptSections(raw) {
  const text = String(raw || "").trim();
  if (!text) return null;

  // The fenced code block is the anchor of a concept answer.
  const fence = text.match(FENCE_RE);
  if (!fence) return null;
  const codeLang = (fence[1] || "").toLowerCase();
  const codeRaw = fence[2].replace(/\s+$/, "");
  if (!codeRaw) return null;
  const fenceStart = fence.index;
  const fenceEnd = fence.index + fence[0].length;

  // Bold section headers, e.g. **Explanation**, **Real-World Application**.
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
  if (rwIdx < 1) return null;

  // Optional "Code Example / Snippet" header — may sit before OR after the fence.
  const codeIdx = headers.findIndex(
    (h, i) =>
      i > rwIdx && /code\s*example|code\s*snippet|^example$|^code$/i.test(h.title)
  );

  const explHeader = headers[0];
  const explanationTitle = explHeader.title || "Explanation";
  const explanationBody = text.slice(explHeader.end, headers[rwIdx].start).trim();

  // Real-world prose runs until the code heading or the fence — whichever comes first.
  let rwEnd = fenceStart;
  if (codeIdx >= 0 && headers[codeIdx].start < rwEnd) {
    rwEnd = headers[codeIdx].start;
  }
  const realWorldBody = text.slice(headers[rwIdx].end, rwEnd).trim();

  // Note: prefer the "Code Example" heading's prose; otherwise text after the fence.
  let codeNote = "";
  if (codeIdx >= 0) {
    const nextHeader = headers[codeIdx + 1];
    const noteEnd = nextHeader ? nextHeader.start : text.length;
    codeNote = text
      .slice(headers[codeIdx].end, noteEnd)
      .replace(FENCE_RE, "")
      .trim();
  } else {
    codeNote = text.slice(fenceEnd).replace(FENCE_RE, "").trim();
  }

  // Drop notes that are whitespace/markdown-only so we never render an empty card.
  if (!/[a-z0-9]/i.test(codeNote)) codeNote = "";

  if (!explanationBody || !realWorldBody) return null;

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

/**
 * Per-question palettes. Each palette has THREE coordinated-but-distinct stages
 * (for Explanation / Real-World / Code), so the three cards stay visually separable
 * within an answer, while the whole palette rotates between questions to keep the
 * experience fresh and beat visual habituation ("this looks like the last answer").
 *
 * NOTE: every class is a full literal string so Tailwind's JIT can see and generate it.
 */
const PALETTES = [
  // Ocean
  [
    { stage: "from-sky-400 via-blue-500 to-indigo-600", glow: "shadow-blue-500/25", dot: "bg-blue-500" },
    { stage: "from-emerald-400 via-teal-500 to-cyan-600", glow: "shadow-emerald-500/25", dot: "bg-emerald-500" },
    { stage: "from-fuchsia-500 via-purple-500 to-indigo-600", glow: "shadow-purple-500/30", dot: "bg-purple-500" },
  ],
  // Sunset
  [
    { stage: "from-rose-400 via-pink-500 to-fuchsia-600", glow: "shadow-rose-500/25", dot: "bg-rose-500" },
    { stage: "from-amber-400 via-orange-500 to-red-500", glow: "shadow-orange-500/25", dot: "bg-orange-500" },
    { stage: "from-violet-500 via-purple-500 to-fuchsia-600", glow: "shadow-violet-500/30", dot: "bg-violet-500" },
  ],
  // Spring
  [
    { stage: "from-teal-400 via-cyan-500 to-sky-600", glow: "shadow-teal-500/25", dot: "bg-teal-500" },
    { stage: "from-lime-400 via-green-500 to-emerald-600", glow: "shadow-green-500/25", dot: "bg-green-500" },
    { stage: "from-indigo-500 via-blue-500 to-cyan-600", glow: "shadow-indigo-500/30", dot: "bg-indigo-500" },
  ],
  // Berry
  [
    { stage: "from-violet-400 via-purple-500 to-indigo-600", glow: "shadow-purple-500/25", dot: "bg-purple-500" },
    { stage: "from-pink-400 via-rose-500 to-red-500", glow: "shadow-pink-500/25", dot: "bg-pink-500" },
    { stage: "from-blue-500 via-indigo-500 to-violet-600", glow: "shadow-indigo-500/30", dot: "bg-indigo-500" },
  ],
  // Citrus
  [
    { stage: "from-amber-400 via-yellow-500 to-orange-500", glow: "shadow-amber-500/25", dot: "bg-amber-500" },
    { stage: "from-emerald-400 via-green-500 to-teal-600", glow: "shadow-emerald-500/25", dot: "bg-emerald-500" },
    { stage: "from-rose-500 via-pink-500 to-fuchsia-600", glow: "shadow-pink-500/30", dot: "bg-pink-500" },
  ],
  // Aurora
  [
    { stage: "from-indigo-400 via-violet-500 to-purple-600", glow: "shadow-violet-500/25", dot: "bg-violet-500" },
    { stage: "from-cyan-400 via-sky-500 to-blue-600", glow: "shadow-sky-500/25", dot: "bg-sky-500" },
    { stage: "from-fuchsia-500 via-pink-500 to-rose-600", glow: "shadow-fuchsia-500/30", dot: "bg-fuchsia-500" },
  ],
];

/** Neutral palette — used when the student turns colored themes OFF. */
export const NEUTRAL_PALETTE = [
  { stage: "from-slate-500 via-slate-600 to-slate-700", glow: "shadow-slate-900/20", dot: "bg-slate-400" },
  { stage: "from-slate-500 via-slate-600 to-slate-700", glow: "shadow-slate-900/20", dot: "bg-slate-400" },
  { stage: "from-slate-500 via-slate-600 to-slate-700", glow: "shadow-slate-900/20", dot: "bg-slate-400" },
];

/** Stable string hash (djb2) → used to pick a palette deterministically per question. */
function hashString(str) {
  let hash = 5381;
  const s = String(str || "");
  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 5) + hash + s.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function pickPalette(seed) {
  return PALETTES[hashString(seed) % PALETTES.length];
}

/* ---- Colored-theme preference (persisted, shared across all cards) ---- */
export const COLOR_PREF_KEY = "mt.conceptCardsColor";
export const COLOR_PREF_EVENT = "mt-concept-color-change";

export function getColorPref() {
  if (typeof localStorage === "undefined") return true;
  return localStorage.getItem(COLOR_PREF_KEY) !== "off";
}

export function setColorPref(on) {
  try {
    localStorage.setItem(COLOR_PREF_KEY, on ? "on" : "off");
    window.dispatchEvent(new Event(COLOR_PREF_EVENT));
  } catch {
    /* ignore storage errors */
  }
}

const LANG_BADGE = {
  js: "JS", javascript: "JS", jsx: "JSX", ts: "TS", tsx: "TSX",
  py: "PY", python: "PY", java: "JV", sql: "SQL", json: "{}",
  bash: "SH", sh: "SH", html: "<>", css: "CSS",
};

/** A slim gradient stage that frames the content without overpowering it. */
function Stage({ theme, icon: Icon, title, children }) {
  return (
    <div
      className={`flex flex-col overflow-hidden rounded-[1.25rem] bg-gradient-to-br ${theme.stage} p-2 ${theme.glow}`}
    >
      <div className="mb-1 flex items-center gap-2 px-1.5 py-1 text-white">
        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
          <Icon className="h-3.5 w-3.5" strokeWidth={2.6} />
        </span>
        <h3 className="text-sm font-semibold tracking-wide drop-shadow-sm">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

function TextPanel({ body }) {
  return (
    <div className="flex-1 rounded-xl bg-white px-4 py-3 dark:bg-[#1a1b1e] sm:px-5 sm:py-4 read-mode:bg-[var(--read-surface)]">
      <div className="text-[15px] leading-relaxed text-gray-700 dark:text-slate-300">
        <ReactMarkdown components={textComponents}>
          {normalizeLessonMarkdown(body)}
        </ReactMarkdown>
      </div>
    </div>
  );
}

function CodeWindow({ lang, code, note }) {
  const meta =
    LANG_LABEL[lang] || { label: lang ? lang.toUpperCase() : "Code", file: "snippet" };
  const badge = LANG_BADGE[lang] || "</>";
  const lines = code.split("\n");

  return (
    <>
      <div className="overflow-hidden rounded-xl bg-[#0d1117] ring-1 ring-white/10">
        {/* Window chrome */}
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
            {meta.file}
          </span>
          <span className="ml-auto text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            {meta.label}
          </span>
        </div>

        {/* Code body — clean, no gutter (snappify style) */}
        <div className="overflow-x-auto px-4 py-3">
          <pre className="m-0 font-mono text-[12.5px] leading-[1.75]">
            <code className="block">
              {lines.map((line, idx) => (
                <div key={idx} className="whitespace-pre text-slate-100">
                  {line.length ? highlightLine(line, idx) : "\u00A0"}
                </div>
              ))}
            </code>
          </pre>
        </div>
      </div>

      {note && (
        <div className="mt-2 rounded-xl bg-white px-4 py-3 dark:bg-[#1a1b1e] read-mode:bg-[var(--read-surface)]">
          <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-purple-600 dark:text-purple-300">
            Note
          </p>
          <div className="text-[15px] leading-relaxed text-gray-700 dark:text-slate-300">
            <ReactMarkdown components={textComponents}>
              {normalizeLessonMarkdown(note)}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Layout                                                              */
/* ------------------------------------------------------------------ */

const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 48 : -48, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? -48 : 48, opacity: 0 }),
};

export default function ConceptCards({ sections, seed }) {
  const {
    explanationTitle,
    explanationBody,
    realWorldBody,
    codeLang,
    codeRaw,
    codeNote,
  } = sections;

  // Colored themes can be toggled off by the student (persisted across sessions).
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

  // Pick a palette deterministically from the question so each answer feels fresh,
  // but the SAME question always keeps its own consistent colors.
  const palette = useMemo(
    () =>
      colorOn ? pickPalette(seed || explanationTitle || explanationBody) : NEUTRAL_PALETTE,
    [colorOn, seed, explanationTitle, explanationBody]
  );

  const slides = [
    {
      theme: palette[0],
      icon: Lightbulb,
      title: explanationTitle,
      content: <TextPanel body={explanationBody} />,
    },
    {
      theme: palette[1],
      icon: Globe2,
      title: "Real-World Application",
      content: <TextPanel body={realWorldBody} />,
    },
    {
      theme: palette[2],
      icon: Code2,
      title: "Code Example",
      content: <CodeWindow lang={codeLang} code={codeRaw} note={codeNote} />,
    },
  ];

  const total = slides.length;
  const [[index, dir], setSlide] = useState([0, 0]);

  const goTo = useCallback(
    (target) => {
      setSlide(([cur]) => {
        const clamped = Math.max(0, Math.min(total - 1, target));
        return [clamped, clamped >= cur ? 1 : -1];
      });
    },
    [total]
  );

  useEffect(() => {
    function onKey(e) {
      if (e.key === "ArrowRight") goTo(index + 1);
      else if (e.key === "ArrowLeft") goTo(index - 1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, goTo]);

  const active = slides[index];
  const atStart = index === 0;
  const atEnd = index === total - 1;

  return (
    <div className="w-full max-w-3xl">
      {/* Step tabs */}
      <div className="mb-3 flex items-center gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto">
          {slides.map((s, i) => {
            const isActive = i === index;
            const Icon = s.icon;
            return (
              <button
                key={s.title}
                type="button"
                onClick={() => goTo(i)}
                className={`group flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? "bg-gray-900 text-white shadow-sm dark:bg-white dark:text-gray-900"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-[#2a2b2e] dark:text-gray-400 dark:hover:bg-[#34353a]"
                }`}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={2.4} />
                <span className="hidden sm:inline">{s.title}</span>
                <span className="sm:hidden">{i + 1}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setColorPref(!colorOn)}
          title={colorOn ? "Turn off colored themes" : "Turn on colored themes"}
          aria-label={colorOn ? "Turn off colored themes" : "Turn on colored themes"}
          aria-pressed={colorOn}
          className={`flex shrink-0 items-center justify-center rounded-full p-1.5 transition-colors ${
            colorOn
              ? "text-[#7c3aed] hover:bg-blue-50 dark:text-[#a78bfa] dark:hover:bg-[#2a2b2e]"
              : "text-gray-400 hover:bg-gray-100 dark:text-gray-500 dark:hover:bg-[#2a2b2e]"
          }`}
        >
          <Palette className="h-4 w-4" strokeWidth={2.2} />
        </button>
      </div>

      {/* Slide */}
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" custom={dir} initial={false}>
          <motion.div
            key={index}
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.26, ease: "easeOut" }}
          >
            <Stage theme={active.theme} icon={active.icon} title={active.title}>
              {active.content}
            </Stage>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="mt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => goTo(index - 1)}
          disabled={atStart}
          className="inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-0 dark:text-gray-300 dark:hover:bg-[#2a2b2e]"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>

        <div className="flex items-center gap-2">
          {slides.map((s, i) => (
            <button
              key={s.title}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to ${s.title}`}
              className={`h-2 rounded-full transition-all ${
                i === index
                  ? `w-6 ${s.theme.dot}`
                  : "w-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500"
              }`}
            />
          ))}
        </div>

        {atEnd ? (
          <span className="inline-flex items-center px-3.5 py-2 text-sm font-medium text-gray-400 dark:text-gray-500">
            Done
          </span>
        ) : (
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#7c3aed] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#6d28d9] dark:bg-[#a78bfa] dark:text-gray-900 dark:hover:bg-[#a5c6fa]"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
