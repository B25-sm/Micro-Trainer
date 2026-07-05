const BROAD_TOPIC_PATTERNS = [
  /^(?:what (?:is|are)\s+)?[a-z0-9+#. -]{2,40}s\??$/i,
  /\b(?:overview|complete guide|everything about|types of|categories of|explain .* fully)\b/i,
];

const BROAD_UMBRELLA_PATTERN = /^(?:react(?:\.js)?|hooks?|javascript|typescript|python|java|sql|databases?|apis?|oop|dsa|data structures?|algorithms?|machine learning|data science|docker|kubernetes|git|css|html|node(?:\.js)?)\??$/i;

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
];

function classifyQuestion(question) {
  const text = String(question || "").trim();
  const words = text.split(/\s+/).filter(Boolean);
  const contract = COVERAGE_CONTRACTS.find((item) => item.match(text)) || null;
  const isBroad =
    (Boolean(contract) && words.length <= 5) ||
    BROAD_UMBRELLA_PATTERN.test(text) ||
    BROAD_TOPIC_PATTERNS.slice(1).some((pattern) => pattern.test(text));

  let mode = isBroad ? "broad-overview" : "focused-concept";
  if (/\b(?:vs\.?|versus|difference|compare)\b/i.test(text)) mode = "comparison";
  else if (/\b(?:error|bug|fix|debug|not working|fail|loop|forever|re-?render)\b/i.test(text)) mode = "debugging";
  else if (/\b(?:interview|answer in interview)\b/i.test(text)) mode = "interview-prep";
  else if (/\b(?:build|implement|write|code|example)\b/i.test(text)) mode = "implementation";

  return { mode, isBroad, contract };
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

  return {
    ...plan,
    qualityGate: options.technical !== false,
    instruction: `ANSWER PLAN (internal; do not mention this plan):
Mode: ${plan.mode}
${modeRules[plan.mode]}
${plan.contract ? `Mandatory coverage:\n${plan.contract.scope}` : ""}

QUALITY BAR:
- First answer the student's actual question; never substitute a nearby curriculum topic.
- Make all major members of a named set visible before deep-diving into one.
- Prefer mechanisms, decisions, trade-offs, and failure modes over generic definitions.
- Examples must be internally consistent and production-plausible.
- Explicitly distinguish common practice from specialized/rare APIs.
- Never add unrelated facts merely because they appeared in retrieved context.`,
  };
}

function assessAnswer(answer, plan) {
  const text = String(answer || "");
  const lower = text.toLowerCase();
  const issues = [];

  if (plan.qualityGate === false) return { passed: true, issues };

  if (text.length < (plan.isBroad ? 1800 : 650)) {
    issues.push("The answer is too shallow for the scope of the question.");
  }
  for (const header of ["real-world application", "code example"]) {
    if (!lower.includes(header)) issues.push(`Missing required section: ${header}.`);
  }
  if (!/```[\s\S]+```/.test(text)) issues.push("Missing a fenced, runnable code example.");

  if (plan.contract) {
    const missing = plan.contract.requiredGroups
      .filter((group) => !group.some((term) => lower.includes(term.toLowerCase())))
      .map((group) => group.join(" / "));
    if (missing.length) issues.push(`Missing topic coverage: ${missing.join(", ")}.`);
  }

  if (plan.contract?.id === "react-hooks" && /\*\*let\*\*|\*\*const\*\*|\*\*var\*\*/i.test(text)) {
    issues.push("Contains an unrelated let/const/var lesson in a React Hooks answer.");
  }

  return { passed: issues.length === 0, issues };
}

module.exports = { classifyQuestion, buildAnswerPlan, assessAnswer, COVERAGE_CONTRACTS };
