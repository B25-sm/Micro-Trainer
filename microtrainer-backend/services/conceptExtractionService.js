// =======================================================
// 🧩 CONCEPT EXTRACTION
// Turns a question / topic string + technology into a canonical concept
// slug (e.g. "closures", "joins", "hooks"). This is the unit we judge
// understanding on — mastery is tracked per concept, then rolled up to
// the technology. Keyword-based and fully explainable; extend the maps
// below as the curriculum grows.
// =======================================================

const { normalizeTechnology } = require("./studentLearningLedgerService");

// concept slug -> keywords that imply it. Order doesn't matter; the concept
// with the most keyword hits wins.
const CONCEPT_KEYWORDS = {
  javascript: {
    closures: ["closure", "lexical scope", "inner function"],
    "async & promises": ["async", "await", "promise", "callback", "then(", "microtask"],
    "event loop": ["event loop", "call stack", "task queue", "setTimeout"],
    hoisting: ["hoist", "var ", "temporal dead zone", "tdz"],
    prototypes: ["prototype", "__proto__", "inheritance chain", "prototypal"],
    "this & binding": ["this ", "bind", "call(", "apply(", "arrow function context"],
    "array & object methods": ["map(", "filter", "reduce", "foreach", "spread", "destructur"],
    "es6 features": ["let ", "const ", "template literal", "generator", "symbol", "iterator"],
    dom: ["dom", "queryselector", "addeventlistener", "event bubbling", "event delegation"],
    typescript: ["type", "interface", "generic", "enum"],
  },
  react: {
    hooks: ["usestate", "useeffect", "usememo", "usecallback", "useref", "custom hook", "hook"],
    "state management": ["state", "setstate", "redux", "context api", "usecontext", "zustand"],
    props: ["props", "prop drilling", "children"],
    rendering: ["render", "re-render", "virtual dom", "reconciliation", "memo", "key prop"],
    "component lifecycle": ["lifecycle", "mount", "unmount", "componentdid", "effect cleanup"],
    routing: ["react router", "route", "navigate", "link "],
    forms: ["controlled component", "uncontrolled", "onchange", "form"],
  },
  python: {
    "data structures": ["list", "dict", "tuple", "set", "comprehension"],
    oop: ["class", "self", "inheritance", "method", "dunder", "__init__"],
    decorators: ["decorator", "@", "wrapper function"],
    generators: ["generator", "yield", "iterator"],
    "error handling": ["try", "except", "raise", "exception"],
    django: ["django", "model", "orm", "queryset", "migration", "view"],
    flask: ["flask", "route", "blueprint"],
    "async & concurrency": ["asyncio", "await", "thread", "multiprocess"],
  },
  java: {
    oop: ["class", "inheritance", "polymorphism", "encapsulation", "abstract", "interface"],
    collections: ["arraylist", "hashmap", "list", "map", "set", "collection"],
    "exception handling": ["try", "catch", "throw", "exception", "finally"],
    streams: ["stream", "lambda", "functional interface", "collectors"],
    concurrency: ["thread", "runnable", "synchronized", "executor", "concurrent"],
    generics: ["generic", "type parameter", "wildcard"],
    spring: ["spring", "bean", "autowired", "dependency injection", "rest controller"],
    "memory & jvm": ["jvm", "garbage collection", "heap", "stack memory"],
  },
  sql: {
    joins: ["join", "inner join", "left join", "right join", "outer join"],
    aggregation: ["group by", "count(", "sum(", "avg(", "having"],
    indexing: ["index", "b-tree", "query plan", "performance"],
    subqueries: ["subquery", "nested query", "exists", "in ("],
    normalization: ["normal form", "normaliz", "denormaliz", "primary key", "foreign key"],
    transactions: ["transaction", "acid", "commit", "rollback", "isolation"],
  },
  nodejs: {
    express: ["express", "middleware", "route", "req", "res"],
    "async patterns": ["async", "await", "promise", "callback", "event loop"],
    streams: ["stream", "buffer", "pipe"],
    "modules & npm": ["require", "module.exports", "import", "npm", "package"],
    "apis & rest": ["rest", "api", "endpoint", "http", "get", "post"],
  },
  "html-css": {
    "layout & flexbox": ["flex", "grid", "layout", "position", "display"],
    "box model": ["box model", "margin", "padding", "border"],
    responsive: ["media query", "responsive", "breakpoint", "viewport"],
    selectors: ["selector", "class", "id", "pseudo", "specificity"],
    "semantics & a11y": ["semantic", "aria", "accessib", "alt "],
  },
};

// Human-friendly fallback: shorten a raw topic/question into a concept label.
function fallbackConcept(text) {
  const clean = String(text || "")
    .replace(/[?.!]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!clean) return { slug: "general", label: "General" };

  // Drop common question lead-ins so "What is a closure" -> "closure".
  const stripped = clean
    .replace(
      /^(what is|what are|explain|describe|how do(es)?|how to|define|tell me about|can you|write|implement)\s+(a |an |the )?/i,
      ""
    )
    .trim();
  const words = (stripped || clean).split(" ").slice(0, 4).join(" ");
  const slug = words.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return { slug: slug || "general", label: words || "General" };
}

/**
 * Resolve the concept a piece of activity is about.
 * @param {string} technology
 * @param {string} text - question or topic text
 * @returns {{slug: string, label: string}}
 */
function extractConcept(technology, text) {
  const tech = normalizeTechnology(technology);
  const lower = String(text || "").toLowerCase();
  const map = CONCEPT_KEYWORDS[tech];

  if (map && lower.trim()) {
    let best = { slug: null, hits: 0 };
    for (const [slug, keywords] of Object.entries(map)) {
      const hits = keywords.filter((kw) => lower.includes(kw)).length;
      if (hits > best.hits) best = { slug, hits };
    }
    if (best.slug) {
      return { slug: best.slug, label: titleCase(best.slug) };
    }
  }

  return fallbackConcept(text);
}

function titleCase(slug) {
  return String(slug)
    .split(/[\s-]+/)
    .map((w) => (w.length <= 2 ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");
}

module.exports = { extractConcept, CONCEPT_KEYWORDS };
