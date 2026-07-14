const BROAD_TOPIC_PATTERNS = [
  /^(?:what (?:is|are)\s+)?[a-z0-9+#. -]{2,40}s\??$/i,
  /\b(?:overview|complete guide|everything about|types of|categories of|explain .* fully)\b/i,
];

const BROAD_UMBRELLA_PATTERN = /^(?:react(?:\.js)?|hooks?|javascript|typescript|python|java|sql|databases?|apis?|oop|dsa|data structures?|algorithms?|machine learning|data science|docker|kubernetes|git|css|html|node(?:\.js)?)\??$/i;

const NON_CONCEPT_PATTERN = /\b(?:career path|career advice|resume|curriculum|study plan|roadmap|prepare for|preparation tips|how do i (?:begin|start)|platform help|where should i start)\b/i;

// First-principles programming primitives. A learner asking these is almost
// always a beginner, so the answer must stay simple — a shopping-cart example,
// not a production login flow with sessions and tokens.
const FOUNDATIONAL_CONCEPT_PATTERN =
  /\b(?:variables?|data\s?types?|strings?|integers?|floats?|booleans?|operators?|arithmetic|comments?|printing|print statements?|inputs?|if(?:[\s/-]?else)?|elif|conditionals?|for\s?loops?|while\s?loops?|loops?|lists?|arrays?|dictionar(?:y|ies)|tuples?|sets?|functions?|parameters?|arguments?|return values?|type\s?cast(?:ing)?|type\s?conversion|concatenation|indentation|f[\s-]?strings?|string formatting|slicing)\b/i;

// Topics that borrow a foundational word ("linked LIST", "hash SET") but are
// genuinely advanced — they must NOT be treated as beginner concepts.
const NOT_FOUNDATIONAL_PATTERN =
  /\b(?:linked\s?lists?|array\s?lists?|hash\s?(?:sets?|maps?|tables?)|stacks?|queues?|trees?|graphs?|heaps?|recursion|closures?|decorators?|generators?|comprehensions?|lambdas?|async|await|threads?|processes?|pointers?|big[\s-]?o|complexity|algorithms?)\b/i;

const COVERAGE_CONTRACTS = [
  {
    id: "react-hooks",
    match: (text) => /\b(?:react\s+)?hooks?\b/i.test(text),
    requiredGroups: [
      ["useState", "useReducer"],
      ["useContext"],
      ["useRef"],
      ["useEffect"],
      ["useMemo", "useCallback"],
      ["custom Hook", "custom Hooks"],
      ["top level", "Rules of Hooks"],
    ],
    scope: `Cover the React Hooks ecosystem, not just useState. Organize it by purpose:
- state: useState, useReducer
- context: useContext
- refs: useRef, useImperativeHandle
- effects/external synchronization: useEffect; briefly distinguish useLayoutEffect and useInsertionEffect
- performance/responsiveness: useMemo, useCallback, useTransition, useDeferredValue
- external stores and identity: useSyncExternalStore, useId
- modern action/form hooks: useActionState and React DOM's useFormStatus
- custom Hooks and both Rules of Hooks
Go deeper on the commonly used hooks and label specialized hooks as specialized. Explain that Effects synchronize with external systems and are often unnecessary for derived data. Do not include unrelated JavaScript variable lessons such as let/const/var.`,
  },
  {
    id: "sql-joins",
    match: (text) => /\b(?:sql\s+)?joins?\b/i.test(text),
    requiredGroups: [["INNER JOIN"], ["LEFT JOIN"], ["RIGHT JOIN"], ["FULL OUTER JOIN"], ["CROSS JOIN"], ["SELF JOIN"]],
    scope: "Cover all six standard SQL join forms: INNER, LEFT, RIGHT, FULL OUTER, CROSS, and SELF. Explain result-set behavior, NULL handling, database support caveats, and show a decision-oriented example.",
  },
  {
    id: "solid",
    match: (text) => /\bsolid\s+principles?\b/i.test(text),
    requiredGroups: [["Single Responsibility"], ["Open/Closed"], ["Liskov"], ["Interface Segregation"], ["Dependency Inversion"]],
    scope: "Cover all five SOLID principles, the design pressure each addresses, a practical violation, the correction, and where teams can over-apply it.",
  },
  {
    id: "http-methods",
    match: (text) => /\bhttp\s+(?:methods?|verbs?)\b/i.test(text),
    requiredGroups: [["GET"], ["POST"], ["PUT"], ["PATCH"], ["DELETE"], ["HEAD"], ["OPTIONS"]],
    scope: "Cover GET, POST, PUT, PATCH, DELETE, HEAD, and OPTIONS. Compare safety, idempotency, request bodies, typical status codes, and practical API usage.",
  },
  {
    id: "python-daemon-threads",
    match: (text) => /\b(?:python\s+)?d(?:ae|ea)mon\s+threads?\b/i.test(text),
    broad: false,
    requiredGroups: [
      ["non-daemon", "non daemon"],
      ["daemon flag", "daemon=True", "daemon = True"],
      ["start()", ".start()"],
      ["join()", ".join()"],
      ["abruptly", "abrupt", "not gracefully"],
      ["finally", "cleanup"],
    ],
    scope: `Explain Python daemon threads precisely:
- daemon is a lifecycle flag, not a different Thread class and not an operating-system daemon process
- the process exits when no alive non-daemon threads remain; daemon threads can be stopped abruptly
- daemon must be set before start(), otherwise Python raises RuntimeError
- join() means the caller waits; it does not convert a daemon thread into a non-daemon thread
- a child thread inherits the creating thread's daemon value unless explicitly overridden
- finally blocks, file flushes, transactions, and other cleanup are not guaranteed at interpreter shutdown
- use daemon threads only for non-critical background helpers; use non-daemon threads plus explicit signaling/join for work that must finish
Show a runnable example with a threading.Event for cooperative shutdown and explain what changes if daemon=False.`,
  },
];

function classifyQuestion(question) {
  const text = String(question || "").trim();
  const words = text.split(/\s+/).filter(Boolean);
  const contract = COVERAGE_CONTRACTS.find((item) => item.match(text)) || null;
  const isConceptQuestion = !NON_CONCEPT_PATTERN.test(text);
  const isBroad =
    (Boolean(contract) && contract.broad !== false && words.length <= 5) ||
    BROAD_UMBRELLA_PATTERN.test(text) ||
    BROAD_TOPIC_PATTERNS.slice(1).some((pattern) => pattern.test(text));

  let mode = isBroad ? "broad-overview" : "focused-concept";
  if (/\b(?:vs\.?|versus|difference|compare)\b/i.test(text)) mode = "comparison";
  else if (/\b(?:error|bug|fix|debug|not working|fail|loop|forever|re-?render)\b/i.test(text)) mode = "debugging";
  else if (/\b(?:interview|answer in interview)\b/i.test(text)) mode = "interview-prep";
  else if (/\b(?:build|implement|write|code|example)\b/i.test(text)) mode = "implementation";

  // A named coverage contract or umbrella topic is inherently non-foundational;
  // only a bare primitive with no advanced qualifier counts as beginner-level.
  const isFoundational =
    !contract &&
    !isBroad &&
    FOUNDATIONAL_CONCEPT_PATTERN.test(text) &&
    !NOT_FOUNDATIONAL_PATTERN.test(text);

  return { mode, isBroad, contract, isConceptQuestion, isFoundational };
}

function buildAnswerPlan(question, options = {}) {
  const plan = classifyQuestion(question);
  const modeRules = {
    "broad-overview": `The question names an UMBRELLA TOPIC. Start with a map of the whole topic, group its major parts, then deepen the most important parts. Do not mistake one member for the entire topic. Aim for 900-1400 useful words when the subject warrants it.`,
    "focused-concept": `Answer the exact concept in depth: purpose, mechanism, practical use, trade-offs, common mistake, and a correct example. Do not widen into unrelated material.`,
    comparison: `Compare every requested item on the same dimensions: purpose, behavior, when to use, trade-offs, and a side-by-side example. End with a decision rule.`,
    debugging: `Diagnose before prescribing. Explain the likely root cause, show the corrected code, state why it works, and give a prevention/checklist step.`,
    "interview-prep": `Give a concise interview-ready answer first, then the deeper explanation, a practical example, likely follow-up questions, and common traps.`,
    implementation: `Provide a runnable, realistic implementation, explain the important lines, cover failure/edge cases, and show how a real project would structure it.`,
  };

  const foundationalDirective = plan.isFoundational
    ? `
BEGINNER-CONCEPT MODE (critical — this is a first-principles topic a beginner is asking about):
- Assume the learner knows nothing yet. Introduce NOTHING they haven't met — no authentication, sessions, tokens, databases, API requests, servers, caching, pipelines, threads, or classes.
- Real-World Application must be ONE small, everyday scenario (a shopping-cart total, a game score, counting unread messages) that uses ONLY this concept.
- The Code Example must be a few lines (2-8) using ONLY this concept — no functions, classes, imports, error handling, or DB/API calls unless the concept itself is exactly that.
- Depth here means crystal clarity and confidence, NOT production complexity. Short and correct beats long and intimidating.`
    : "";

  return {
    ...plan,
    qualityGate: options.technical !== false && plan.isConceptQuestion,
    instruction: `ANSWER PLAN (internal; do not mention this plan):
Mode: ${plan.mode}
${modeRules[plan.mode]}
${plan.contract ? `Mandatory coverage:\n${plan.contract.scope}` : ""}
${foundationalDirective}

QUALITY BAR:
- First answer the student's actual question; never substitute a nearby curriculum topic.
- Teach causally: problem -> mechanism -> decision -> failure mode -> observable result. A definition without the mechanism is incomplete.
- Use the exact layered subheadings from the concept response contract so the learner can progressively deepen understanding.
- Make all major members of a named set visible before deep-diving into one.
- Prefer mechanisms, decisions, trade-offs, and failure modes over generic definitions.
- Examples must be internally consistent and production-plausible.
- The code must be runnable, and the prose must predict what it does and how changing one input or option changes the result.
- Explicitly distinguish common practice from specialized/rare APIs.
- Never add unrelated facts merely because they appeared in retrieved context.`,
  };
}

function assessAnswer(answer, plan) {
  const text = String(answer || "");
  const lower = text.toLowerCase();
  const issues = [];

  if (plan.qualityGate === false) return { passed: true, issues };

  const foundational = Boolean(plan.isFoundational);

  // Foundational concepts get a lower bar on purpose: forcing a 2200-char
  // "production walkthrough" with 6+ lines of code onto "what is a variable"
  // is exactly what buries beginners in login flows, tokens, and DB calls.
  const minLength = foundational ? 900 : plan.isBroad ? 4000 : 2200;
  if (text.length < minLength) {
    issues.push("The answer is too shallow for the scope of the question.");
  }

  const requiredTeachingLayers = foundational
    ? [
        ["direct answer"],
        ["why it exists"],
        ["mental model"],
        ["how it works"],
        ["common pitfall", "common mistake"],
        ["key insight", "rule of thumb"],
      ]
    : [
        ["direct answer"],
        ["why it exists"],
        ["mental model"],
        ["how it works"],
        ["when to use", "when not to"],
        ["common pitfall", "common mistake"],
        ["key insight", "rule of thumb"],
        ["production walkthrough", "real-world walkthrough"],
        ["what happens"],
      ];
  for (const alternatives of requiredTeachingLayers) {
    if (!alternatives.some((heading) => lower.includes(heading))) {
      issues.push(`Missing teaching layer: ${alternatives.join(" / ")}.`);
    }
  }
  for (const header of ["real-world application", "code example"]) {
    if (!lower.includes(header)) issues.push(`Missing required section: ${header}.`);
  }
  const codeMatch = text.match(/```[^\n]*\n([\s\S]+?)```/);
  if (!codeMatch) {
    issues.push("Missing a fenced, runnable code example.");
  } else {
    const codeLines = codeMatch[1].split("\n").filter((line) => line.trim()).length;
    const minCodeLines = foundational ? 2 : 6;
    if (codeLines < minCodeLines) issues.push("The code example is too small to demonstrate the mechanism.");
  }

  if (plan.contract) {
    const missing = plan.contract.requiredGroups
      .filter((group) => !group.some((term) => lower.includes(term.toLowerCase())))
      .map((group) => group.join(" / "));
    if (missing.length) issues.push(`Missing topic coverage: ${missing.join(", ")}.`);
  }

  if (plan.contract?.id === "python-daemon-threads") {
    const semanticChecks = [
      {
        pattern: /(?:join\(\)[\s\S]{0,180}(?:wait|does not change|doesn't change)|(?:wait|does not change|doesn't change)[\s\S]{0,180}join\(\))/i,
        issue: "Missing the fact that join() waits but does not change daemon status.",
      },
      {
        pattern: /(?:no (?:alive )?non-daemon threads? remain|when (?:all|the) non-daemon threads? (?:finish|exit|end))/i,
        issue: "Missing the exact process-exit condition: no alive non-daemon threads remain.",
      },
      {
        pattern: /(?:threading\.)?Event\s*\(/,
        issue: "Missing explicit cooperative shutdown with threading.Event.",
      },
      {
        pattern: /before[\s\S]{0,80}(?:\.start|start)\(\)[\s\S]{0,120}RuntimeError/i,
        issue: "Missing the before-start daemon rule and its RuntimeError consequence.",
      },
    ];
    for (const check of semanticChecks) {
      if (!check.pattern.test(text)) issues.push(check.issue);
    }
  }

  if (plan.contract?.id === "react-hooks" && /\*\*let\*\*|\*\*const\*\*|\*\*var\*\*/i.test(text)) {
    issues.push("Contains an unrelated let/const/var lesson in a React Hooks answer.");
  }

  return { passed: issues.length === 0, issues };
}

module.exports = { classifyQuestion, buildAnswerPlan, assessAnswer, COVERAGE_CONTRACTS };
