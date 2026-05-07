// =======================================================
// 🔹 JAVASCRIPT QUESTION BANK
// Comprehensive question bank covering 7 days of JS concepts
// =======================================================

const JS_QUESTION_BANK = {
  
  // =======================================================
  // DAY 1: Variables, Datatypes, Scope, Operators
  // =======================================================
  day1: {
    topic: "Variables, Datatypes, Scope & Operators",
    concepts: [
      "Variables (let, const, var)",
      "Datatypes (string, number, boolean, array, object)",
      "Scope (global, block, function)",
      "Operators (arithmetic, comparison, logical, ternary)",
      "JavaScript Runtime (setTimeout, event loop)"
    ],
    questions: {
      easy: [
        "What is the difference between let and const?",
        "What are the primitive datatypes in JavaScript?",
        "What is the difference between == and ===?",
        "What is a ternary operator? Give an example.",
        "What is the scope of a variable declared with var?",
        "What does typeof operator do?",
        "What is the difference between null and undefined?",
        "What is a boolean datatype?",
        "What is an array in JavaScript?",
        "What is an object in JavaScript?"
      ],
      medium: [
        "Explain the difference between var, let, and const with examples.",
        "What is block scope? How is it different from function scope?",
        "What is hoisting? How does it work with var?",
        "What is the difference between && and || operators?",
        "How does setTimeout work in JavaScript?",
        "What is the event loop in JavaScript?",
        "What is type coercion? Give an example.",
        "What is the difference between global and local scope?",
        "How do you check if a variable is an array?",
        "What is the spread operator? Give an example."
      ],
      hard: [
        "Explain how the JavaScript event loop works with setTimeout.",
        "What is the temporal dead zone (TDZ)? How does it relate to let and const?",
        "How does variable hoisting work differently for var, let, and const?",
        "Explain the difference between shallow and deep copy of objects.",
        "What happens when you use var inside a for loop vs let?",
        "How does JavaScript handle type coercion in comparisons?",
        "What is the difference between call stack and task queue?",
        "Explain how closures interact with scope.",
        "What is the difference between synchronous and asynchronous code?",
        "How does JavaScript handle memory management?"
      ]
    }
  },

  // =======================================================
  // DAY 2: Functions, Closures, Hoisting, TDZ
  // =======================================================
  day2: {
    topic: "Functions, Closures, Hoisting & TDZ",
    concepts: [
      "Function types (normal, arrow, IIFE)",
      "Closures",
      "Hoisting",
      "Temporal Dead Zone (TDZ)",
      "Function scope",
      "Loops (for, while)"
    ],
    questions: {
      easy: [
        "What is a function in JavaScript?",
        "What is an arrow function?",
        "What is an IIFE? Give an example.",
        "What is a closure?",
        "What is hoisting?",
        "What is the difference between function declaration and expression?",
        "What is a callback function?",
        "What is the return statement in a function?",
        "What is a for loop?",
        "What is the difference between for and while loop?"
      ],
      medium: [
        "Explain how closures work with an example.",
        "What is the difference between arrow functions and normal functions?",
        "How does hoisting work with functions?",
        "What is the temporal dead zone (TDZ)?",
        "How do you create a private variable using closures?",
        "What is the difference between function scope and block scope?",
        "How does an IIFE help in avoiding global scope pollution?",
        "What is the difference between parameters and arguments?",
        "How do you use default parameters in functions?",
        "What is function currying?"
      ],
      hard: [
        "Explain how closures can be used to create private variables.",
        "What happens when you try to access a let variable before declaration?",
        "How does hoisting work differently for var, let, const, and functions?",
        "Explain the concept of lexical scoping with closures.",
        "How can closures lead to memory leaks?",
        "What is the difference between function hoisting and variable hoisting?",
        "How do arrow functions handle the 'this' keyword differently?",
        "Explain how IIFE can be used for module pattern.",
        "What is the difference between call, apply, and bind?",
        "How do you implement function memoization using closures?"
      ]
    }
  },

  // =======================================================
  // DAY 3: DOM, BOM, Array/String/Object Methods
  // =======================================================
  day3: {
    topic: "DOM, BOM & Built-in Methods",
    concepts: [
      "DOM manipulation (getElementById, querySelector)",
      "BOM (window, location, setTimeout)",
      "Array methods (map, filter, forEach, push)",
      "String methods (toUpperCase, toLowerCase, trim, includes)",
      "Object methods (keys, values, entries, hasOwnProperty)"
    ],
    questions: {
      easy: [
        "What is the DOM?",
        "What is the difference between getElementById and querySelector?",
        "What is the BOM?",
        "What does window.alert do?",
        "What is the map() array method?",
        "What is the filter() array method?",
        "What does toUpperCase() do?",
        "What is the trim() string method?",
        "What does Object.keys() return?",
        "What is the forEach() method?"
      ],
      medium: [
        "How do you manipulate HTML elements using JavaScript?",
        "What is the difference between innerText and innerHTML?",
        "How does setTimeout work in the browser?",
        "What is the difference between map() and forEach()?",
        "How do you filter an array based on a condition?",
        "What is the difference between includes() and indexOf()?",
        "How do you check if an object has a property?",
        "What does Object.entries() return?",
        "How do you add an element to an array?",
        "What is the difference between push() and concat()?"
      ],
      hard: [
        "Explain event delegation in DOM manipulation.",
        "What is the difference between window.location and window.history?",
        "How do you chain multiple array methods together?",
        "Explain how reduce() works with an example.",
        "What is the difference between Object.keys() and Object.getOwnPropertyNames()?",
        "How do you deep clone an object in JavaScript?",
        "What is the difference between slice() and splice()?",
        "How do you implement a custom map() function?",
        "What is the difference between querySelector and querySelectorAll?",
        "How do you prevent XSS attacks when manipulating DOM?"
      ]
    }
  },

  // =======================================================
  // DAY 4: Call/Apply/Bind, Array Methods, Rest/Spread, ES6
  // =======================================================
  day4: {
    topic: "Advanced Functions & ES6 Features",
    concepts: [
      "Call, Apply, Bind",
      "Array methods (map, filter, reduce)",
      "Rest & Spread operators",
      "ES6 features (arrow functions, template literals, destructuring)",
      "Default parameters"
    ],
    questions: {
      easy: [
        "What is the call() method?",
        "What is the apply() method?",
        "What is the bind() method?",
        "What is the spread operator?",
        "What is the rest operator?",
        "What are template literals?",
        "What is destructuring?",
        "What are default parameters?",
        "What is the reduce() method?",
        "What is an arrow function?"
      ],
      medium: [
        "What is the difference between call() and apply()?",
        "How does bind() differ from call() and apply()?",
        "What is the difference between rest and spread operators?",
        "How do you use destructuring with objects?",
        "How do you use destructuring with arrays?",
        "What is the difference between template literals and string concatenation?",
        "How does reduce() work? Give an example.",
        "What are the benefits of arrow functions?",
        "How do you set default parameter values?",
        "What is the difference between map() and reduce()?"
      ],
      hard: [
        "Explain how 'this' binding works with call, apply, and bind.",
        "How do you implement a custom bind() function?",
        "What is the difference between shallow and deep destructuring?",
        "How do you use reduce() to flatten a nested array?",
        "Explain how rest parameters work in function arguments.",
        "What are the limitations of arrow functions?",
        "How do you use spread operator to merge objects?",
        "What is the difference between Object.assign() and spread operator?",
        "How do you implement function composition using reduce()?",
        "Explain how to use destructuring with default values."
      ]
    }
  },

  // =======================================================
  // DAY 5: Promises, Async/Await, Debouncing, Throttling, Currying
  // =======================================================
  day5: {
    topic: "Asynchronous JavaScript & Optimization",
    concepts: [
      "Promises",
      "Promise chaining",
      "Async/Await",
      "Debouncing",
      "Throttling",
      "Function currying"
    ],
    questions: {
      easy: [
        "What is a Promise?",
        "What are the three states of a Promise?",
        "What is async/await?",
        "What is debouncing?",
        "What is throttling?",
        "What is function currying?",
        "What is the then() method?",
        "What is the catch() method?",
        "What is Promise.all()?",
        "What is the difference between synchronous and asynchronous code?"
      ],
      medium: [
        "How do you create a Promise?",
        "What is promise chaining? Give an example.",
        "What is the difference between then() and async/await?",
        "How does debouncing improve performance?",
        "How does throttling differ from debouncing?",
        "How do you implement a simple debounce function?",
        "What is the difference between Promise.all() and Promise.race()?",
        "How do you handle errors in async/await?",
        "What is function currying used for?",
        "How do you convert a callback to a Promise?"
      ],
      hard: [
        "Explain the event loop and how Promises fit into it.",
        "How do you implement a custom Promise?",
        "What is the difference between microtasks and macrotasks?",
        "How do you implement throttling with leading and trailing options?",
        "Explain how debouncing works with closures.",
        "What is the difference between Promise.allSettled() and Promise.all()?",
        "How do you handle multiple async operations in parallel?",
        "What are the performance implications of using async/await?",
        "How do you implement function currying with multiple arguments?",
        "Explain how to cancel a Promise."
      ]
    }
  },

  // =======================================================
  // DAY 6: Optional Chaining, Error Handling, API Calls
  // =======================================================
  day6: {
    topic: "Error Handling & API Integration",
    concepts: [
      "Optional chaining (?.)",
      "Error handling (try...catch)",
      "Types of errors (ReferenceError, TypeError, SyntaxError)",
      "API calls with fetch()",
      "HTTP methods (GET, POST, PUT, DELETE)"
    ],
    questions: {
      easy: [
        "What is optional chaining?",
        "What is try...catch?",
        "What is a ReferenceError?",
        "What is a TypeError?",
        "What is a SyntaxError?",
        "What is the fetch() API?",
        "What is a GET request?",
        "What is a POST request?",
        "What is JSON?",
        "What does JSON.parse() do?"
      ],
      medium: [
        "How does optional chaining prevent errors?",
        "What is the difference between throw and return in error handling?",
        "How do you handle errors in fetch()?",
        "What is the difference between GET and POST requests?",
        "How do you send data in a POST request?",
        "What is the difference between JSON.parse() and JSON.stringify()?",
        "How do you handle network errors in API calls?",
        "What is CORS? How do you handle it?",
        "What is the finally block in try...catch?",
        "How do you create custom error messages?"
      ],
      hard: [
        "Explain the difference between nullish coalescing and optional chaining.",
        "How do you implement global error handling in JavaScript?",
        "What is the difference between synchronous and asynchronous error handling?",
        "How do you handle multiple API calls with error handling?",
        "What are the best practices for API error handling?",
        "How do you implement retry logic for failed API calls?",
        "What is the difference between 4xx and 5xx HTTP status codes?",
        "How do you handle authentication in API calls?",
        "What is the difference between fetch() and axios?",
        "How do you implement request cancellation with AbortController?"
      ]
    }
  },

  // =======================================================
  // DAY 7: Prototypal Inheritance, Polyfills, Cookies, WebStorage
  // =======================================================
  day7: {
    topic: "Advanced Concepts & Browser APIs",
    concepts: [
      "Prototypal inheritance",
      "Polyfills",
      "Cookies",
      "WebStorage API (localStorage, sessionStorage)",
      "Constructor functions",
      "Prototype chain"
    ],
    questions: {
      easy: [
        "What is prototypal inheritance?",
        "What is a polyfill?",
        "What are cookies?",
        "What is localStorage?",
        "What is sessionStorage?",
        "What is a constructor function?",
        "What is the prototype property?",
        "What is the __proto__ property?",
        "What is the difference between localStorage and sessionStorage?",
        "How do you set a cookie?"
      ],
      medium: [
        "How does prototypal inheritance work in JavaScript?",
        "What is the difference between __proto__ and prototype?",
        "How do you create a polyfill for Array.includes()?",
        "What is the difference between cookies and localStorage?",
        "How do you set an expiry date for cookies?",
        "How do you clear localStorage?",
        "What is the prototype chain?",
        "How do you inherit from a parent constructor?",
        "What is the difference between Object.create() and new?",
        "How do you check if localStorage is supported?"
      ],
      hard: [
        "Explain the entire prototype chain with an example.",
        "How do you implement classical inheritance using prototypes?",
        "What are the security concerns with cookies and localStorage?",
        "How do you implement a polyfill for Promise?",
        "What is the difference between prototype and class-based inheritance?",
        "How do you handle cookie security (HttpOnly, Secure, SameSite)?",
        "What are the storage limits for localStorage and cookies?",
        "How do you implement cross-tab communication with localStorage?",
        "What is the difference between Object.setPrototypeOf() and __proto__?",
        "How do you implement a custom storage API with encryption?"
      ]
    }
  }
};

// =======================================================
// 🔹 GET RANDOM QUESTION BY DIFFICULTY
// =======================================================
function getRandomJSQuestion(difficulty = "easy", day = null) {
  const days = day ? [JS_QUESTION_BANK[`day${day}`]] : Object.values(JS_QUESTION_BANK);
  
  const allQuestions = days.flatMap(d => d.questions[difficulty] || []);
  
  if (allQuestions.length === 0) {
    return "What is JavaScript? Where is it used?";
  }
  
  const randomIndex = Math.floor(Math.random() * allQuestions.length);
  return allQuestions[randomIndex];
}

// =======================================================
// 🔹 GET QUESTIONS BY TOPIC
// =======================================================
function getQuestionsByTopic(topic, difficulty = "easy") {
  for (const day of Object.values(JS_QUESTION_BANK)) {
    if (day.topic.toLowerCase().includes(topic.toLowerCase())) {
      return day.questions[difficulty] || [];
    }
  }
  return [];
}

// =======================================================
// 🔹 GET ALL CONCEPTS
// =======================================================
function getAllJSConcepts() {
  return Object.values(JS_QUESTION_BANK).flatMap(day => day.concepts);
}

module.exports = {
  JS_QUESTION_BANK,
  getRandomJSQuestion,
  getQuestionsByTopic,
  getAllJSConcepts
};
