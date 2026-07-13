// =======================================================
// Curated factual references — injected into AI prompts so
// teaching/chat answers stay complete and interview-accurate.
// Covers ALL curriculum concepts (12 technologies) + question banks.
// =======================================================

const {
  findMatchingEntries,
  getEntryByConceptId,
  detectTechnologies,
  getIndexStats,
} = require("./conceptReferenceIndex");

/** Hard overrides where AI commonly gives incomplete/wrong lists */
const AUTHORITATIVE_OVERRIDES = [
  {
    id: "react-hooks-overview",
    match: (text) => /^(?:what (?:is|are)\s+)?(?:react\s+)?hooks?\??$/i.test(text.trim()),
    reference: `React Hooks overview — this is an umbrella topic, not a synonym for useState:
- State: useState, useReducer
- Context: useContext
- Refs: useRef, useImperativeHandle
- Effects: useEffect; specialized timing variants useLayoutEffect and useInsertionEffect
- Performance/responsiveness: useMemo, useCallback, useTransition, useDeferredValue
- External stores and identity: useSyncExternalStore, useId
- Actions/forms: useActionState; React DOM provides useFormStatus
- Reuse: custom Hooks combine Hooks into reusable stateful logic
- Rules: call Hooks at the top level, and only from React function components or custom Hooks
Important: useEffect synchronizes with external systems; it is not the default tool for derived values or event handling.`,
  },
  {
    id: "sql-joins",
    match: (text) =>
      /\b(sql\s+)?joins?\b/i.test(text) ||
      /\b(inner|left|right|full|cross|self)\s+(outer\s+)?join\b/i.test(text),
    reference: `SQL JOIN types — include ALL six standard joins (never say "only 3"):

1. INNER JOIN — matching rows in BOTH tables only
2. LEFT (OUTER) JOIN — all left rows + matching right rows (NULL where no match)
3. RIGHT (OUTER) JOIN — all right rows + matching left rows
4. FULL OUTER JOIN — all rows from both; NULL where no match (PostgreSQL/SQL Server/Oracle; MySQL 8.0.40+)
5. CROSS JOIN — Cartesian product (no ON clause)
6. SELF JOIN — table joined to itself with aliases

LEFT JOIN = LEFT OUTER JOIN (synonyms). Use ON for join conditions; WHERE filters after join.`,
  },
  {
    id: "http-methods",
    match: (text) =>
      /\bhttp\s+methods?\b/i.test(text) ||
      /\b(get|post|put|patch|delete)\s+request/i.test(text),
    reference: `HTTP methods — include all common verbs when listing types:
GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS`,
  },
  {
    id: "solid",
    match: (text) => /\bsolid\s+principles?\b/i.test(text),
    reference: `SOLID — all five: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion`,
  },
  {
    id: "python-daemon-threads",
    match: (text) => /\b(?:python\s+)?d(?:ae|ea)mon\s+threads?\b/i.test(text),
    reference: `Python threading daemon semantics (authoritative):
- daemon is a boolean Thread property; ordinary main-created threads default to daemon=False
- the Python process exits when no alive non-daemon threads remain; alive daemon threads are then stopped abruptly
- set thread.daemon or pass daemon= before start(); changing it after start() raises RuntimeError
- join() only makes the calling thread wait; it does not change daemon status
- a newly created thread inherits the daemon status of the thread that created it unless daemon is explicitly supplied
- interpreter shutdown does not guarantee daemon-thread finally blocks, buffered writes, locks, or transactions finish
- use daemon=True for disposable helper work only; use a non-daemon thread plus Event-based shutdown and join() for work that must complete`,
  },
  {
    id: "django-mvt",
    match: (text) =>
      /\bdjango\b/i.test(text) &&
      /\b(mvt|mvc|model|view|template)\b/i.test(text),
    reference: `Django MVT (not MVC):
- Model — data layer / ORM
- View — request handler (like a controller)
- Template — HTML presentation layer`,
  },
  {
    id: "js-equality",
    match: (text) =>
      /\bjavascript\b|\bjs\b/i.test(text) &&
      /\b(==|===|equality)\b/i.test(text),
    reference: `JavaScript equality:
- === strict equality (type + value)
- == loose equality (coercion)
- Prefer === unless you explicitly need coercion`,
  },
];

const MAX_REFERENCE_CHARS = 4200;

function formatOverrideBlock(override) {
  return `REFERENCE FACTS (${override.id}) — treat as authoritative; do not omit listed items:\n${override.reference}`;
}

/**
 * Return curated reference text for a student question or concept.
 * @param {string} text - Question, concept title, or lesson snippet
 * @param {object} [options]
 * @param {string} [options.technology] - e.g. "django", "javascript"
 * @param {string} [options.conceptId] - e.g. "dj-1" for exact curriculum lookup
 * @param {number} [options.limit] - max matched entries (default 2)
 */
function getConceptReference(text, options = {}) {
  if (!text || typeof text !== "string") return "";

  const normalized = text.trim();
  if (!normalized) return "";

  const blocks = [];
  const seenIds = new Set();

  const addBlock = (id, block) => {
    if (!block || seenIds.has(id)) return;
    seenIds.add(id);
    blocks.push(block);
  };

  for (const override of AUTHORITATIVE_OVERRIDES) {
    if (override.match(normalized)) {
      addBlock(override.id, formatOverrideBlock(override));
    }
  }

  if (options.technology && options.conceptId) {
    const direct = getEntryByConceptId(options.technology, options.conceptId);
    if (direct) addBlock(direct.id, direct.reference);
  }

  const matches = findMatchingEntries(normalized, {
    technology: options.technology,
    limit: options.limit ?? 2,
  });

  for (const entry of matches) {
    addBlock(entry.id, entry.reference);
  }

  if (blocks.length === 0) return "";

  let combined = blocks.join("\n\n");
  if (combined.length > MAX_REFERENCE_CHARS) {
    combined = combined.substring(0, MAX_REFERENCE_CHARS) + "\n…";
  }

  return combined;
}

module.exports = {
  getConceptReference,
  detectTechnologies,
  getIndexStats,
  AUTHORITATIVE_OVERRIDES,
};
