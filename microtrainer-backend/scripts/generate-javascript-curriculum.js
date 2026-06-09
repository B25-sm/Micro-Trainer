/**
 * Generates data/curriculums/javascript.json — full JavaScript syllabus (35 modules).
 * Run: node scripts/generate-javascript-curriculum.js
 */
const fs = require("fs");
const path = require("path");

const SECTIONS = [
  {
    id: "01",
    title: "JavaScript Foundations & Environment",
    modules: [
      {
        title: "JavaScript Landscape & Career Paths",
        topics: [
          "What JavaScript is: language of the web + Node.js backend",
          "Browser vs Node.js vs Deno — where code runs",
          "Frontend vs full-stack roles: React, Node, TypeScript paths",
          "ECMAScript versions (ES6+) and why 'modern JS' matters",
          "How companies use JS: SPAs, APIs, mobile (React Native), tooling",
        ],
        project: null,
      },
      {
        title: "DevTools, Console & Your First Program",
        topics: [
          "Browser DevTools: Console, Sources, Network tabs",
          "Running JS: <script>, defer/async, external files",
          "console.log, console.error, debugging basics",
          "Reading error messages (line numbers, stack traces)",
          "VS Code setup: extensions, live server, formatting",
        ],
        project: "Print a personalized greeting in the console and in an alert",
      },
      {
        title: "Syntax, Comments & Strict Mode",
        topics: [
          "Statements vs expressions; semicolons (ASI)",
          "Comments: single-line, block, JSDoc intro",
          "'use strict' and common strict-mode errors",
          "Identifiers, reserved words, camelCase conventions",
          "Code style: readability, linting (ESLint overview)",
        ],
        project: null,
      },
    ],
  },
  {
    id: "02",
    title: "Variables, Types & Operators",
    modules: [
      {
        title: "Variables: let, const & var",
        topics: [
          "Declaring variables: let, const, var",
          "Block scope vs function scope",
          "Reassignment rules; const with objects/arrays",
          "Hoisting and temporal dead zone (let/const)",
          "Best practice: const by default, let when needed, avoid var",
        ],
        project: null,
      },
      {
        title: "Primitive Types & Type Checking",
        topics: [
          "string, number, boolean, undefined, null, symbol, bigint",
          "typeof operator and its quirks (typeof null)",
          "Number pitfalls: NaN, Infinity, floating point",
          "Template literals and string methods overview",
          "null vs undefined — when to use each",
        ],
        project: "Build a mini profile card using strings and numbers",
      },
      {
        title: "Operators & Expressions",
        topics: [
          "Arithmetic, assignment, comparison operators",
          "Logical operators: &&, ||, !",
          "Unary +, increment/decrement",
          "Operator precedence and parentheses",
          "Optional chaining (?.) and nullish coalescing (??)",
        ],
        project: null,
      },
      {
        title: "Type Coercion & Equality",
        topics: [
          "Implicit vs explicit coercion (String(), Number())",
          "== vs === and Object.is",
          "Truthy and falsy values",
          "Short-circuit evaluation in conditions",
          "Common bugs from coercion in interviews",
        ],
        project: null,
      },
    ],
  },
  {
    id: "03",
    title: "Control Flow & Iteration",
    modules: [
      {
        title: "Conditionals: if, else, switch, ternary",
        topics: [
          "if / else if / else patterns",
          "switch with break, fall-through, default",
          "Ternary operator and when to avoid nesting",
          "Guard clauses and early returns",
          "Writing readable conditional logic",
        ],
        project: "Grade calculator using if/else and switch",
      },
      {
        title: "Loops: for, while, do-while",
        topics: [
          "for loop: init, condition, increment",
          "while and do-while loops",
          "break and continue",
          "Nested loops and complexity intuition",
          "Choosing the right loop for the task",
        ],
        project: null,
      },
      {
        title: "for...of, for...in & Iterables",
        topics: [
          "for...of with arrays and strings",
          "for...in on objects (and why not on arrays)",
          "Array.from and spread for iteration",
          "Intro to iterables and iterators",
          "Avoiding off-by-one and infinite loops",
        ],
        project: "FizzBuzz and sum of array using loops",
      },
    ],
  },
  {
    id: "04",
    title: "Functions & Scope",
    modules: [
      {
        title: "Function Declarations & Expressions",
        topics: [
          "Declaring and calling functions",
          "Function declarations vs expressions",
          "Return values and early return",
          "Function scope and shadowing",
          "Pure functions vs side effects (intro)",
        ],
        project: null,
      },
      {
        title: "Parameters: default, rest & arguments",
        topics: [
          "Parameters vs arguments object (legacy)",
          "Default parameters",
          "Rest parameters (...args)",
          "Pass by value vs reference for objects",
          "Validating inputs at function boundaries",
        ],
        project: "Reusable math utility library (add, avg, max)",
      },
      {
        title: "Arrow Functions & this (Basics)",
        topics: [
          "Arrow function syntax and implicit return",
          "When not to use arrows (methods, constructors)",
          "Lexical this vs dynamic this (overview)",
          "Callbacks and passing functions as values",
          "Higher-order functions intro",
        ],
        project: null,
      },
      {
        title: "Closures, Scope Chain & IIFE",
        topics: [
          "Lexical scope and scope chain",
          "Closures: private variables, factories",
          "IIFE pattern and module pattern (historical)",
          "Common closure interview questions",
          "Memory leaks from closures (awareness)",
        ],
        project: "Counter factory and createMultiplier using closures",
      },
    ],
  },
  {
    id: "05",
    title: "Arrays & Objects",
    modules: [
      {
        title: "Arrays: Creation, Mutation & Reference",
        topics: [
          "Creating arrays; length property",
          "push, pop, shift, unshift, splice, slice",
          "Indexing, updating, copying arrays",
          "Shallow copy vs deep copy (spread, slice)",
          "Multi-dimensional arrays",
        ],
        project: null,
      },
      {
        title: "Array Methods: map, filter, reduce",
        topics: [
          "forEach vs map — when to use each",
          "filter, find, findIndex, some, every",
          "reduce: sum, groupBy patterns",
          "sort with compare functions",
          "Chaining array methods cleanly",
        ],
        project: "Transform a list of products (map/filter/reduce)",
      },
      {
        title: "Objects: Keys, Methods & References",
        topics: [
          "Object literals; dot vs bracket notation",
          "Adding, updating, deleting properties",
          "Methods and this in object literals",
          "Object.keys, values, entries",
          "Comparing objects by reference",
        ],
        project: null,
      },
      {
        title: "Destructuring, Spread & Rest",
        topics: [
          "Array and object destructuring",
          "Default values in destructuring",
          "Spread in arrays and objects",
          "Rest in destructuring and parameters",
          "Cloning and merging objects safely",
        ],
        project: "Merge user settings objects with spread",
      },
    ],
  },
  {
    id: "06",
    title: "OOP, Prototypes & Classes",
    modules: [
      {
        title: "Prototypes & Prototype Chain",
        topics: [
          "[[Prototype]] and __proto__ (conceptual)",
          "Object.create and prototype inheritance",
          "Constructor functions and .prototype",
          "instanceof and constructor property",
          "Composition over inheritance (intro)",
        ],
        project: null,
      },
      {
        title: "ES6 Classes & Inheritance",
        topics: [
          "class syntax, constructor, methods",
          "extends and super",
          "Static methods and properties",
          "Classes vs prototype mental model",
          "When to use classes in modern codebases",
        ],
        project: "Model a simple Library system with classes",
      },
      {
        title: "Encapsulation & Object Patterns",
        topics: [
          "Private fields (#field) and methods",
          "Getters and setters",
          "Mixins and factory functions",
          "JSON serialization: JSON.stringify/parse",
          "Structured data patterns for APIs",
        ],
        project: null,
      },
    ],
  },
  {
    id: "07",
    title: "Modern JavaScript & Modules",
    modules: [
      {
        title: "ES Modules: import & export",
        topics: [
          "Named vs default exports",
          "import syntax and re-exporting",
          "Module scope vs global scope",
          "Dynamic import() for code splitting (intro)",
          "Node ESM vs CommonJS (awareness)",
        ],
        project: "Split utilities into ES modules in a small project",
      },
      {
        title: "Strings, Template Literals & Regex",
        topics: [
          "Template literals and tagged templates",
          "Common string methods: includes, slice, replace",
          "Regular expressions: test, match, groups",
          "Validating emails/phones with regex (basics)",
          "Unicode and internationalization (awareness)",
        ],
        project: null,
      },
      {
        title: "Symbols, Iterators & Generators",
        topics: [
          "Symbol type and unique keys",
          "Custom iterables with Symbol.iterator",
          "Generator functions and yield",
          "Use cases: lazy sequences, custom iteration",
          "When generators matter in real projects",
        ],
        project: null,
      },
      {
        title: "Error Handling & Debugging",
        topics: [
          "try / catch / finally",
          "throwing custom Error objects",
          "Async errors and unhandled rejections",
          "Breakpoints, watch, call stack in DevTools",
          "Source maps for bundled code (awareness)",
        ],
        project: "Robust input parser with try/catch",
      },
    ],
  },
  {
    id: "08",
    title: "Asynchronous JavaScript",
    modules: [
      {
        title: "Callbacks & the Event Loop",
        topics: [
          "Synchronous vs asynchronous execution",
          "Callback pattern and callback hell",
          "Event loop, macrotasks, microtasks (intuition)",
          "setTimeout, setInterval, clearTimeout",
          "DOM events as async callbacks",
        ],
        project: null,
      },
      {
        title: "Promises",
        topics: [
          "Creating promises; resolve/reject",
          "then, catch, finally chaining",
          "Promise.all, Promise.race, Promise.allSettled",
          "Converting callbacks to promises",
          "Error propagation in promise chains",
        ],
        project: "Fetch multiple JSON endpoints with Promise.all",
      },
      {
        title: "async/await",
        topics: [
          "async functions always return promises",
          "await and sequential vs parallel awaits",
          "try/catch with async/await",
          "Top-level await in modules (awareness)",
          "Refactoring promise chains to async/await",
        ],
        project: "Weather app stub using async/await",
      },
      {
        title: "Fetch API & Working with JSON",
        topics: [
          "fetch GET/POST; headers and body",
          "Reading Response: json(), text(), status",
          "REST conventions: CRUD, status codes",
          "CORS basics (why requests fail)",
          "AbortController for canceling requests",
        ],
        project: "Display users from a public API on the page",
      },
    ],
  },
  {
    id: "09",
    title: "Browser, DOM & Web APIs",
    modules: [
      {
        title: "DOM Selection & Manipulation",
        topics: [
          "DOM tree: nodes, elements, text nodes",
          "querySelector, querySelectorAll, getElementById",
          "Creating elements, append, prepend, remove",
          "classList, attributes, dataset",
          "innerHTML vs textContent (XSS awareness)",
        ],
        project: "Todo list UI (add/remove items in DOM)",
      },
      {
        title: "Events: Bubbling, Delegation & Custom Events",
        topics: [
          "addEventListener; event object",
          "Bubbling, capturing, stopPropagation",
          "Event delegation pattern",
          "Custom events with dispatchEvent",
          "Keyboard and form events",
        ],
        project: null,
      },
      {
        title: "Forms, Validation & FormData",
        topics: [
          "Form elements and submit prevention",
          "Client-side validation strategies",
          "FormData API and file inputs",
          "Accessibility: labels, aria (intro)",
          "Connecting forms to fetch POST",
        ],
        project: "Contact form with validation",
      },
      {
        title: "Web Storage, Cookies & Timers",
        topics: [
          "localStorage vs sessionStorage",
          "JSON persistence patterns",
          "Cookies overview (httpOnly, secure — awareness)",
          "requestAnimationFrame vs setInterval",
          "Building stateful UIs without a framework",
        ],
        project: "Persist todo list to localStorage",
      },
    ],
  },
  {
    id: "10",
    title: "Professional JavaScript & Capstone",
    modules: [
      {
        title: "Functional Patterns & Immutability",
        topics: [
          "Pure functions and side effects",
          "Immutability with spread and structuredClone",
          "Composition: pipe, compose patterns",
          "Currying and partial application (intro)",
          "When functional style helps in React/Redux",
        ],
        project: null,
      },
      {
        title: "Testing with Jest",
        topics: [
          "Unit tests: describe, it, expect",
          "Testing pure functions and edge cases",
          "Mocking fetch and modules",
          "Test-driven development (TDD) intro",
          "CI running tests on push (awareness)",
        ],
        project: "Write tests for your math utility library",
      },
      {
        title: "Performance, Security & Bundlers",
        topics: [
          "Debouncing and throttling",
          "Lighthouse metrics (intro)",
          "XSS, sanitizing user input, CSP basics",
          "npm, package.json, Vite/webpack overview",
          "Tree shaking and production builds",
        ],
        project: null,
      },
      {
        title: "Capstone: Mini App & Interview Prep",
        topics: [
          "Plan a small SPA: requirements, wireframe, data flow",
          "Integrate fetch, DOM, storage, error handling",
          "Code review checklist: naming, DRY, async errors",
          "Common JS interview topics recap",
          "Portfolio README and demo deployment (GitHub Pages)",
        ],
        project:
          "Build and document a mini app (e.g. movie search, expense tracker, or quiz app)",
      },
    ],
  },
];

function buildTeachingContent(title, topics, project) {
  const topicSummary = topics.slice(0, 4).join("; ");
  const projectNote = project ? ` Project: ${project}.` : "";
  return {
    beginner: `Introduction to ${title}. ${topicSummary}.${projectNote} Use clear examples in the browser console and small scripts — focus on what you can run immediately.`,
    intermediate: `${title}: ${topics.join(" ")}.${projectNote} Connect each idea to real frontend and Node.js tasks with code snippets and debugging practice.`,
    advanced: `Deep dive: ${title}. ${topics.join(" ")}.${projectNote} Cover edge cases, interview traps, performance, and how production teams structure this in modern codebases.`,
  };
}

function buildLessonBrief(title, topics, project) {
  const lines = [
    `MODULE BRIEF — ${title}`,
    "",
    "TOPICS TO COVER (in order):",
    ...topics.map((t) => `- ${t}`),
  ];
  if (project) lines.push("", `HANDS-ON PROJECT: ${project}`);
  lines.push(
    "",
    "TEACHING STYLE: Practical mentor. Every concept needs runnable JavaScript examples.",
    "Use browser console + simple HTML script demos where helpful.",
    "Quiz questions must test understanding of THIS module only — not generic trivia."
  );
  return lines.join("\n");
}

function buildCrossQuestions(title, topics) {
  const t0 = topics[0]?.split(":")[0] || title;
  const t1 = topics[1]?.split(":")[0] || "this topic";
  const t2 = topics[2]?.split(":")[0] || "JavaScript";
  return [
    `Explain ${t0} with a short code example.`,
    `How would you use ${t1} in a real web app or Node script?`,
    `What is a common beginner mistake with ${t2}, and how do you fix it?`,
  ];
}

const concepts = [];
let order = 0;

for (const section of SECTIONS) {
  section.modules.forEach((mod, moduleIndex) => {
    order += 1;
    const moduleNum = moduleIndex + 1;
    const objectives = mod.topics.slice(0, 6);
    if (mod.project) objectives.push(`Project: ${mod.project}`);

    concepts.push({
      id: `js-${order}`,
      order,
      sectionId: section.id,
      sectionTitle: section.title,
      moduleNumber: moduleNum,
      title: `Module ${order}: ${mod.title}`,
      description: mod.topics[0] || mod.title,
      topics: mod.topics,
      project: mod.project || null,
      objectives,
      teachingContent: buildTeachingContent(mod.title, mod.topics, mod.project),
      lessonBrief: buildLessonBrief(mod.title, mod.topics, mod.project),
      crossQuestions: buildCrossQuestions(mod.title, mod.topics),
    });
  });
}

const curriculum = {
  technology: "JavaScript",
  totalConcepts: concepts.length,
  sections: SECTIONS.map((s) => ({
    id: s.id,
    title: s.title,
    moduleCount: s.modules.length,
  })),
  concepts,
};

const spec = {
  technology: "JavaScript",
  idPrefix: "js",
  domainHint: "JavaScript in browser and Node.js",
  sections: SECTIONS,
};

module.exports = spec;

if (require.main === module) {
  const outPath = path.join(__dirname, "../data/curriculums/javascript.json");
  fs.writeFileSync(outPath, JSON.stringify(curriculum, null, 2), "utf8");
  console.log(`✅ Wrote ${concepts.length} modules to ${outPath}`);
}
