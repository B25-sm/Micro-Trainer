// =======================================================
// 🔹 PYTHON FULLSTACK QUESTION BANK
// Comprehensive question bank covering Python + Django concepts
// =======================================================

const PYTHON_QUESTION_BANK = {
  
  // =======================================================
  // DAY 1: HTML, CSS Basics - Forms, iframes, Audio/Video, Positioning
  // =======================================================
  day1: {
    topic: "Frontend Basics - HTML Forms, Multimedia & CSS Positioning",
    concepts: [
      "HTML Forms (text, email, checkbox, radio, textarea)",
      "Form validation",
      "iframes",
      "Audio & Video tags",
      "CSS Positioning (static, relative, absolute, fixed, sticky)",
      "CSS Selectors (element, class, id, attribute)",
      "z-index",
      "Flexbox",
      "CSS Grid"
    ],
    questions: {
      easy: [
        "What is an HTML form?",
        "What are the different input types in HTML forms?",
        "What is an iframe?",
        "What is the audio tag in HTML?",
        "What is the video tag in HTML?",
        "What is CSS positioning?",
        "What is static positioning?",
        "What is relative positioning?",
        "What is absolute positioning?",
        "What is fixed positioning?",
        "What is sticky positioning?",
        "What is a CSS selector?",
        "What is an element selector?",
        "What is a class selector?",
        "What is an id selector?",
        "What is an attribute selector?",
        "What is z-index?",
        "What is CSS Flexbox?",
        "What is CSS Grid?",
        "What is form validation?"
      ],
      medium: [
        "What is the difference between absolute and relative positioning?",
        "How do you handle form validation in HTML?",
        "How do you embed an external webpage using iframe?",
        "What are the attributes of the audio tag?",
        "What are the attributes of the video tag?",
        "How do you use z-index to layer elements?",
        "What is the difference between Flexbox and Grid?",
        "How do you create a responsive layout with Flexbox?",
        "How do you create a responsive layout with Grid?",
        "What is the difference between class and id selectors?",
        "How do you use attribute selectors?",
        "What is the difference between fixed and sticky positioning?",
        "How do you validate email input in forms?",
        "What is the difference between checkbox and radio buttons?",
        "How do you add controls to audio and video elements?"
      ],
      hard: [
        "Explain the CSS positioning context and stacking order.",
        "How do you implement complex form validation with JavaScript?",
        "What are the security concerns with iframes?",
        "How do you optimize audio and video for web performance?",
        "Explain the difference between Grid and Flexbox layouts with use cases.",
        "How do you create a sticky header with CSS positioning?",
        "What are the performance implications of z-index?",
        "How do you implement a responsive multimedia form page?",
        "What are the accessibility considerations for forms?",
        "How do you handle fallback content for audio and video?"
      ]
    }
  },

  // =======================================================
  // DAY 2: CSS Display, Keyframes, JS Runtime, Hoisting, Functions
  // =======================================================
  day2: {
    topic: "CSS Animations & JavaScript Fundamentals",
    concepts: [
      "Display Properties (block, inline, inline-block, none)",
      "CSS Keyframes for animations",
      "JavaScript Runtime Environment (JRE)",
      "Hoisting",
      "Temporal Dead Zone (TDZ)",
      "JavaScript Operators (Arithmetic, Logical, Comparison)",
      "Conditional Statements (if, else if, switch)",
      "Functions & Types (Normal, Anonymous, Arrow, IIFE)",
      "DOM & Methods (getElementById, querySelector)",
      "BOM & Methods (alert, confirm, prompt, location, navigator)",
      "Function Currying"
    ],
    questions: {
      easy: [
        "What is the display property in CSS?",
        "What is display: block?",
        "What is display: inline?",
        "What is display: inline-block?",
        "What is display: none?",
        "What are CSS keyframes?",
        "What is the JavaScript Runtime Environment?",
        "What is hoisting?",
        "What is the Temporal Dead Zone (TDZ)?",
        "What are JavaScript operators?",
        "What is an if statement?",
        "What is a switch statement?",
        "What is a function in JavaScript?",
        "What is an arrow function?",
        "What is an IIFE?",
        "What is the DOM?",
        "What is getElementById?",
        "What is querySelector?",
        "What is the BOM?",
        "What is function currying?"
      ],
      medium: [
        "What is the difference between block and inline display?",
        "How do you create animations using CSS keyframes?",
        "How does the JavaScript call stack work?",
        "What is the difference between hoisting with var and let?",
        "What is the difference between == and ===?",
        "What is the difference between if and switch statements?",
        "What is the difference between arrow functions and normal functions?",
        "How do you use IIFE to avoid global scope pollution?",
        "What is the difference between getElementById and querySelector?",
        "What is the difference between alert, confirm, and prompt?",
        "How do you implement function currying?",
        "What is the difference between DOM and BOM?",
        "How do you manipulate HTML elements using DOM methods?",
        "What are the different types of operators in JavaScript?",
        "How do you use the ternary operator?"
      ],
      hard: [
        "Explain the JavaScript event loop and call stack with setTimeout.",
        "How do you create complex animations with multiple keyframes?",
        "What are the performance implications of CSS animations?",
        "Explain how hoisting works with functions and variables.",
        "What is the temporal dead zone and how does it affect let and const?",
        "How do you implement an interactive animated calculator?",
        "What are the best practices for DOM manipulation?",
        "How do you optimize JavaScript runtime performance?",
        "Explain function currying with practical examples.",
        "What are the security considerations with BOM methods?"
      ]
    }
  },

  // =======================================================
  // DAY 3: Callbacks, Promises, API Calls, Built-in Methods
  // =======================================================
  day3: {
    topic: "Asynchronous JavaScript & Built-in Methods",
    concepts: [
      "Callbacks & Higher Order Functions (HOFs)",
      "Promises",
      "Promise Chaining",
      "API Calling (GET, POST, PUT, DELETE using fetch)",
      "Array Methods (map, filter, reduce, forEach)",
      "String Methods (split, slice, substring, includes)",
      "Object Methods (keys, values, entries, hasOwnProperty)"
    ],
    questions: {
      easy: [
        "What is a callback function?",
        "What is a Higher Order Function?",
        "What is a Promise?",
        "What are the three states of a Promise?",
        "What is promise chaining?",
        "What is the fetch API?",
        "What is a GET request?",
        "What is a POST request?",
        "What is a PUT request?",
        "What is a DELETE request?",
        "What is the map() method?",
        "What is the filter() method?",
        "What is the reduce() method?",
        "What is the forEach() method?",
        "What is the split() method?",
        "What is the slice() method?",
        "What is Object.keys()?",
        "What is Object.values()?",
        "What is Object.entries()?",
        "What is hasOwnProperty()?"
      ],
      medium: [
        "How do you implement a callback function?",
        "What is the difference between callbacks and Promises?",
        "How do you create a Promise?",
        "How do you chain Promises?",
        "How do you make API calls using fetch?",
        "What is the difference between GET and POST requests?",
        "What is the difference between PUT and DELETE requests?",
        "What is the difference between map() and forEach()?",
        "What is the difference between filter() and reduce()?",
        "How do you use reduce() to sum array elements?",
        "What is the difference between split() and slice()?",
        "What is the difference between slice() and substring()?",
        "How do you check if a string includes a substring?",
        "How do you iterate over object properties?",
        "What is the difference between Object.keys() and Object.entries()?"
      ],
      hard: [
        "Explain the event loop and how Promises fit into it.",
        "How do you handle errors in Promise chains?",
        "What is the difference between Promise.all() and Promise.race()?",
        "How do you implement a user dashboard with API integration?",
        "What are the performance implications of multiple API calls?",
        "How do you optimize array method chaining?",
        "Explain how reduce() works internally.",
        "What are the best practices for API error handling?",
        "How do you implement custom Higher Order Functions?",
        "What are the security concerns with API calls?"
      ]
    }
  },

  // =======================================================
  // DAY 4: React Basics - Folder Structure, JSX, State, Props
  // =======================================================
  day4: {
    topic: "React Basics - Components, JSX, State & Props",
    concepts: [
      "React Folder Structure",
      "Virtual DOM & Diffing Algorithm",
      "JSX (JavaScript XML) Syntax",
      "React State (useState)",
      "React Props (Data Passing)",
      "Functional Components"
    ],
    questions: {
      easy: [
        "What is React?",
        "What is the React folder structure?",
        "What is the Virtual DOM?",
        "What is the diffing algorithm?",
        "What is JSX?",
        "What is JSX syntax?",
        "What is a functional component?",
        "What is React state?",
        "What is useState?",
        "What are React props?",
        "How do you pass props to a component?",
        "What is data passing in React?",
        "What is a component?",
        "What is the difference between state and props?",
        "How do you create a functional component?"
      ],
      medium: [
        "How does the Virtual DOM work?",
        "Explain the diffing algorithm in React.",
        "What is the difference between JSX and HTML?",
        "How do you manage state with useState?",
        "How do you pass data from parent to child component?",
        "What is the React folder structure best practice?",
        "How do you toggle state in React?",
        "What is the difference between props and state?",
        "How do you render JSX elements?",
        "What are the rules of JSX?",
        "How do you handle events in functional components?",
        "What is component composition?",
        "How do you create a profile card component?",
        "What is the purpose of the Virtual DOM?",
        "How do you update state in React?"
      ],
      hard: [
        "Explain how the Virtual DOM diffing algorithm optimizes rendering.",
        "What are the performance implications of the Virtual DOM?",
        "How does React reconciliation work?",
        "What are the best practices for React folder structure?",
        "How do you optimize component re-renders?",
        "What is the difference between controlled and uncontrolled components?",
        "How do you implement a profile card React app with props and state?",
        "What are the limitations of JSX?",
        "How does React handle synthetic events?",
        "What are the best practices for state management in functional components?"
      ]
    }
  },

  // =======================================================
  // DAY 5: React Advanced - Class Components, Lifecycle, HOCs, Hooks
  // =======================================================
  day5: {
    topic: "React Advanced - Class Components & Hooks",
    concepts: [
      "Class Components in React",
      "Lifecycle Methods (constructor, render, componentDidMount)",
      "Higher Order Components (HOCs)",
      "React Hooks & Types (useState, useEffect, useRef, useContext)",
      "Hook rules and best practices"
    ],
    questions: {
      easy: [
        "What is a class component?",
        "What are lifecycle methods?",
        "What is constructor in React?",
        "What is render method?",
        "What is componentDidMount?",
        "What is a Higher Order Component (HOC)?",
        "What are React Hooks?",
        "What is useState?",
        "What is useEffect?",
        "What is useRef?",
        "What is useContext?",
        "What are the types of React Hooks?",
        "What is the difference between class and functional components?",
        "What is componentWillUnmount?",
        "What is componentDidUpdate?"
      ],
      medium: [
        "How do you create a class component?",
        "What is the lifecycle of a class component?",
        "How do you use componentDidMount to fetch data?",
        "What is the difference between componentDidMount and useEffect?",
        "How do you create a Higher Order Component?",
        "What is the purpose of HOCs?",
        "How do you use useState in functional components?",
        "How do you use useEffect for side effects?",
        "What is the difference between useRef and useState?",
        "How do you use useContext for global state?",
        "What are the rules of hooks?",
        "How do you convert a class component to a functional component?",
        "What is the cleanup function in useEffect?",
        "How do you use useRef to access DOM elements?",
        "What is the difference between HOCs and custom hooks?"
      ],
      hard: [
        "Explain the complete lifecycle of a class component with examples.",
        "How do you implement a HOC to inject common props or logic?",
        "What are the performance implications of lifecycle methods?",
        "How do you migrate from class components to hooks?",
        "What are the best practices for using useEffect?",
        "How do you implement a user status tracker with class components and HOCs?",
        "What is the difference between componentDidUpdate and useEffect?",
        "How do you handle errors in lifecycle methods?",
        "What are the limitations of HOCs?",
        "How do you optimize re-renders in class components?"
      ]
    }
  },

  // =======================================================
  // DAY 6: React Hooks Deep Dive - useState, useEffect, useReducer, useCallback, useMemo
  // =======================================================
  day6: {
    topic: "React Hooks Optimization & Advanced Patterns",
    concepts: [
      "useState - Managing local component state",
      "useEffect - Handling side effects",
      "useReducer - State management alternative",
      "useCallback - Memoizing callback functions",
      "useMemo - Memoizing computed values",
      "Performance optimization with hooks"
    ],
    questions: {
      easy: [
        "What is useState?",
        "What is useEffect?",
        "What is useReducer?",
        "What is useCallback?",
        "What is useMemo?",
        "What is memoization?",
        "What is a side effect in React?",
        "What is a reducer function?",
        "What is the dependency array in useEffect?",
        "What is the difference between useState and useReducer?"
      ],
      medium: [
        "How do you manage state with useState?",
        "How do you handle side effects with useEffect?",
        "How do you persist data in localStorage with useEffect?",
        "What is the difference between useReducer and useState?",
        "How do you use useReducer for complex state management?",
        "How does useCallback improve performance?",
        "How does useMemo optimize computed values?",
        "What is the difference between useCallback and useMemo?",
        "How do you memoize event handlers with useCallback?",
        "How do you optimize filtering with useMemo?",
        "What is the cleanup function in useEffect?",
        "How do you handle multiple state updates?",
        "What are the rules for the dependency array?",
        "How do you implement a to-do app with hooks?",
        "What is the difference between useEffect and useLayoutEffect?"
      ],
      hard: [
        "Explain the useEffect lifecycle and cleanup mechanism.",
        "How do you implement a to-do app with useReducer optimization?",
        "What are the performance trade-offs of useCallback and useMemo?",
        "When should you NOT use useMemo or useCallback?",
        "How do you handle complex state logic with useReducer?",
        "What are the best practices for useEffect dependencies?",
        "How do you prevent memory leaks with useEffect?",
        "What is the difference between referential equality and value equality?",
        "How do you optimize a large list with useCallback and useMemo?",
        "What are the common pitfalls of using hooks?"
      ]
    }
  },

  // =======================================================
  // DAY 7: useContext, React.memo, Error Boundaries, Python Basics
  // =======================================================
  day7: {
    topic: "React Context, Optimization & Error Handling",
    concepts: [
      "useContext - Global state management",
      "React.memo - Memoizing components",
      "Error Boundaries - Handling runtime errors",
      "Context API patterns",
      "Performance optimization techniques"
    ],
    questions: {
      easy: [
        "What is useContext?",
        "What is React.memo?",
        "What is an Error Boundary?",
        "What is the Context API?",
        "What is a Context Provider?",
        "What is a Context Consumer?",
        "What is memoization in React?",
        "What is component memoization?",
        "What is a runtime error?",
        "What is error handling in React?"
      ],
      medium: [
        "How do you create a Context in React?",
        "How do you use useContext to access global state?",
        "How does React.memo prevent unnecessary re-renders?",
        "How do you implement an Error Boundary?",
        "What is the difference between props drilling and Context?",
        "How do you create a theme switcher with useContext?",
        "What is the difference between React.memo and useMemo?",
        "How do you wrap components with React.memo?",
        "What are the limitations of Error Boundaries?",
        "How do you handle errors in Error Boundaries?",
        "What is the difference between useContext and Redux?",
        "How do you optimize Context to prevent re-renders?",
        "What is the Provider pattern?",
        "How do you implement dark mode with Context?",
        "What is the difference between class-based and function-based Error Boundaries?"
      ],
      hard: [
        "How do you implement a theme switcher app with useContext and React.memo?",
        "What are the performance implications of useContext?",
        "How do you optimize Context to avoid unnecessary re-renders?",
        "What are the best practices for using Error Boundaries?",
        "How do you handle async errors in Error Boundaries?",
        "What is the difference between Error Boundaries and try-catch?",
        "How do you implement multiple Contexts in an app?",
        "What are the limitations of React.memo?",
        "How do you implement a global state management system with Context?",
        "What are the trade-offs between Context API and state management libraries?"
      ]
    }
  },

  // =======================================================
  // DAY 8: Python Fundamentals
  // =======================================================
  day8: {
    topic: "Python Core Concepts & Data Structures",
    concepts: [
      "Python basics (syntax, variables, data types)",
      "Mutable vs Immutable",
      "List, Set, Dictionary, Tuple",
      "List comprehension, Lambda functions",
      "Exception handling",
      "Iterators vs Generators",
      "Decorators, Closures",
      "OOP (Classes, Inheritance, Polymorphism)",
      "Namespace, Scope",
      "Memory management and garbage collection"
    ],
    questions: {
      easy: [
        "What is Python?",
        "What are the benefits of using Python language?",
        "Is Python a compiled language or an interpreted language?",
        "What does the '#' symbol do in Python?",
        "What is a variable in Python?",
        "What is a list?",
        "What is a dictionary?",
        "What is a lambda function?",
        "What is exception handling?",
        "What is a tuple?",
        "What is a set?",
        "What is list comprehension?",
        "What is the pass statement?",
        "What is the difference between / and //?",
        "What is the swapcase() function?",
        "What is the difference between for loop and while loop?",
        "What are *args and **kwargs?",
        "What is a dynamically typed language?",
        "What is the difference between break, continue, and pass?",
        "What are the built-in data types in Python?",
        "What is flooring a number?",
        "What are the key features of Python?",
        "What is the difference between == and is operator?",
        "Is indentation necessary in Python?",
        "What does [::-1] do?",
        "What are docstrings?",
        "What is slicing in Python?",
        "What is the difference between array and list?",
        "What is the map() function?",
        "What is the filter() function?"
      ],
      medium: [
        "What is the difference between mutable and immutable data types?",
        "What is the difference between Set and Dictionary?",
        "Give an example of list comprehension.",
        "What is the difference between list and tuple?",
        "How do you handle exceptions in Python?",
        "What is the difference between == and is?",
        "How do you use list comprehension?",
        "What is the difference between *args and **kwargs?",
        "What is scope in Python?",
        "What is a decorator in Python?",
        "What is the difference between append() and extend()?",
        "How do you reverse a string in Python?",
        "How do you pass a function as an argument?",
        "How do Python functions work?",
        "How do you capitalize the first letter of a string?",
        "How do you write comments in Python?",
        "What is the difference between NumPy and SciPy?",
        "What is the difference between map() and lambda()?",
        "What are valid dictionary keys?",
        "How do you declare private variables?",
        "What is the difference between iterators and generators?",
        "How do you access parent class attributes?",
        "What is the difference between multiprocessing and multithreading?",
        "How do you merge dictionaries?",
        "How do you overload constructors?",
        "How do you use filter() with lambda expression?",
        "What is the difference between shallow copy and deep copy?",
        "What is the difference between staticmethod and classmethod?",
        "What is the difference between list comprehension and for loop in terms of speed?",
        "Is tuple comprehension supported? Why/Why not?"
      ],
      hard: [
        "Explain how Python memory management and garbage collection work.",
        "What is the Python Switch Statement?",
        "Explain closures in Python with an example.",
        "What are function annotations?",
        "What is __init__() in Python?",
        "What is namespace in Python?",
        "Explain data abstraction in Python.",
        "What is encapsulation?",
        "What is polymorphism?",
        "Does Python support multiple inheritance?",
        "What is the difference between generators and iterators?",
        "How do you debug a Python program?",
        "What are decorators in Python?",
        "What sorting technique is used by sort() and sorted()?",
        "What is monkey patching?",
        "How does Python's garbage collection work?",
        "Explain the GIL (Global Interpreter Lock).",
        "What is the difference between multiprocessing and multithreading?",
        "How do you implement abstract classes in Python?",
        "What are abstract classes and their uses?",
        "What is dictionary comprehension? Give an example.",
        "What are the limitations of Python?",
        "Transpose a square matrix of n rows and columns.",
        "Place even elements of an array at even indexes and odd at odd indexes.",
        "Check if an array is a subsequence of another.",
        "Unzip nested dicts into expanded dicts.",
        "What is the output of (0,1,2,3,(4,5,6),7,8)[::3]?",
        "What is the output of a = [[]]*5; a[0].append(1)?",
        "Make a given string a valid Python variable name.",
        "Return duplicate elements in sorted order from a list.",
        "Sort a list without using the built-in sort method.",
        "How do you swap two numbers in Python?",
        "How do you find the max number in a list?",
        "How do you find the unique number in a list?",
        "How do you remove duplicates from a list?"
      ]
    }
  },

  // =======================================================
  // DAY 9: Django Basics
  // =======================================================
  day9: {
    topic: "Django Framework Fundamentals",
    concepts: [
      "Django setup & project structure",
      "MVT Architecture",
      "Models, Views, Templates",
      "URL routing",
      "Django ORM",
      "Forms & Validation",
      "Django Admin",
      "Static & Media files",
      "Migrations",
      "Django Shell",
      "CRUD Operations",
      "Middleware basics",
      "Debug mode"
    ],
    questions: {
      easy: [
        "What is Django?",
        "What is the difference between Django and Flask?",
        "How do you install Django?",
        "How do you set up a virtual environment?",
        "How do you create a Django project?",
        "How do you create a Django app?",
        "What is the Django project structure?",
        "What is MVT architecture?",
        "What is a Django model?",
        "What is a view in Django?",
        "What is a template?",
        "What is Django ORM?",
        "What is the Django admin?",
        "What is a migration?",
        "What is makemigrations?",
        "What is migrate?",
        "What is a URL pattern?",
        "What is CSRF token?",
        "What is the Django development server?",
        "What is the Django shell?",
        "What are static files?",
        "What are media files?",
        "What is INSTALLED_APPS?",
        "What is middleware?",
        "What is debug mode?",
        "What is URL namespace?",
        "What is a redirect in Django?",
        "What is reverse URL?"
      ],
      medium: [
        "How do you create a model in Django?",
        "What is the difference between GET and POST?",
        "How do you handle forms in Django?",
        "What is the difference between filter() and get()?",
        "How do you create migrations?",
        "What is template inheritance?",
        "How do you serve static files in Django?",
        "How do you implement CRUD operations?",
        "How do you register a model in Django admin?",
        "How do you connect to a database (SQLite/PostgreSQL)?",
        "How do you create forms using Django Forms?",
        "How do you handle GET and POST requests?",
        "What are Django ORM basics (filter, get, all, exclude)?",
        "What are project settings (INSTALLED_APPS, TEMPLATES, STATICFILES_DIRS)?",
        "How do you create URL namespaces?",
        "How do you render context in templates?",
        "How do you use CSRF token in forms?",
        "How do you implement redirects and reverse URLs?",
        "How do you create custom 404 and 500 error pages?",
        "What is the deployment overview (Heroku, Railway, Vercel)?",
        "How do you use the Django messages framework?",
        "How do you validate form inputs?",
        "What is the difference between render() and redirect()?",
        "How do you use Django Debug Toolbar?"
      ],
      hard: [
        "Explain the Django request-response cycle.",
        "How do you optimize Django ORM queries?",
        "What is the N+1 query problem?",
        "How do you implement custom middleware?",
        "What are Django signals and when to use them?",
        "How do you implement custom user models?",
        "What is the difference between select_related and prefetch_related?",
        "How do you implement caching in Django?",
        "What are the security best practices in Django?",
        "How do you deploy a Django application?",
        "How do you handle database migrations in production?",
        "What are the best practices for Django project structure?",
        "How do you implement custom template tags and filters?",
        "How do you handle file uploads in Django?",
        "What are the performance optimization techniques in Django?"
      ]
    }
  },

  // =======================================================
  // DAY 10: Django Intermediate
  // =======================================================
  day10: {
    topic: "Django Advanced Features & Best Practices",
    concepts: [
      "Understanding Django MVT Architecture in-depth",
      "Difference between MVT and MVC",
      "Custom User Model",
      "Model Managers & QuerySets",
      "Q Objects for complex queries",
      "Model Inheritance (Abstract, Multi-table, Proxy)",
      "File uploads & media handling",
      "Custom Middleware",
      "Django Signals",
      "Sessions vs Cookies",
      "Pagination",
      "Django Form vs ModelForm",
      "Form validation using clean methods",
      "Custom Template Filters and Tags",
      "Context Processors",
      "AJAX with Django using Fetch API",
      "Django REST Framework basics",
      "Serializers and Views in DRF",
      "Class Based Views vs Function Based Views",
      "Mixins and Generic Views",
      "LoginRequiredMixin and PermissionRequiredMixin",
      "User access based on groups/permissions",
      "Django Messages Framework"
    ],
    questions: {
      easy: [
        "What is MVT architecture in-depth?",
        "What is the difference between MVT and MVC?",
        "What is a custom user model?",
        "What are Q objects?",
        "What is model inheritance?",
        "What is Django middleware?",
        "What are Django signals?",
        "What is pagination?",
        "What is Django REST Framework?",
        "What is a serializer?",
        "What is the difference between sessions and cookies?",
        "What is a model manager?",
        "What is the difference between Form and ModelForm?",
        "What are custom template filters?",
        "What are custom template tags?",
        "What is a context processor?",
        "What is AJAX?",
        "What is the difference between APIView and ViewSet?",
        "What is the difference between function-based and class-based views?",
        "What is LoginRequiredMixin?",
        "What is PermissionRequiredMixin?",
        "What is the Django Messages Framework?"
      ],
      medium: [
        "How do you create a custom user model?",
        "How do you use Q objects for complex queries?",
        "What are the types of model inheritance?",
        "How do you implement custom middleware?",
        "How do you use signals in Django?",
        "How do you implement pagination?",
        "How do you handle file uploads?",
        "What is the difference between function-based and class-based views?",
        "How do you implement authentication in DRF?",
        "How do you create custom template filters?",
        "How do you create custom template tags?",
        "What is a context processor and how do you create one?",
        "How do you use AJAX with Django using Fetch API?",
        "What are serializers in Django REST Framework?",
        "What are mixins in Django?",
        "What are generic views in Django?",
        "How do you restrict user access based on groups?",
        "How do you restrict user access based on permissions?",
        "How do you use the Django Messages Framework?",
        "What is the difference between pre_save and post_save signals?",
        "How do you validate forms using clean methods?",
        "What is the difference between sessions and cookies in Django?"
      ],
      hard: [
        "Explain the different types of model inheritance with examples (Abstract, Multi-table, Proxy).",
        "How do you optimize file uploads for large files?",
        "What are the performance implications of signals?",
        "How do you implement custom authentication backends?",
        "What is the difference between Mixins and Generic Views?",
        "How do you implement permissions in Django REST Framework?",
        "What are the best practices for structuring Django projects?",
        "How do you implement versioning in REST APIs?",
        "What is the difference between serializers and model forms?",
        "How do you handle transactions in Django?",
        "How do you implement complex queries with Q objects?",
        "What are model managers and how do you create custom ones?",
        "How do you implement role-based access control in Django?",
        "How do you use LoginRequiredMixin and PermissionRequiredMixin together?",
        "What are the security considerations for file uploads?",
        "How do you implement custom context processors?",
        "How do you handle AJAX requests in Django views?",
        "What are the best practices for using Django signals?",
        "How do you implement custom form validation with clean methods?",
        "What is the difference between class-based views and function-based views in terms of performance?"
      ]
    }
  },

  // =======================================================
  // DAY 11: SQL Basics
  // =======================================================
  day11: {
    topic: "SQL Basics - DDL, DML, DQL Commands",
    concepts: [
      "SQL (Structured Query Language)",
      "Types of Commands (DDL, DML, DQL, TCL, DCL)",
      "CREATE, ALTER, DROP",
      "INSERT, UPDATE, DELETE",
      "SELECT statements",
      "WHERE, ORDER BY, LIMIT",
      "DISTINCT, BETWEEN, IN, LIKE operators"
    ],
    questions: {
      easy: [
        "What is SQL?",
        "What is DDL (Data Definition Language)?",
        "What is DML (Data Manipulation Language)?",
        "What is DQL (Data Query Language)?",
        "What is TCL (Transaction Control Language)?",
        "What is DCL (Data Control Language)?",
        "How do you create a table in SQL?",
        "How do you insert data into a table?",
        "What is the SELECT statement?",
        "What is a WHERE clause?",
        "What is ORDER BY used for?",
        "What does the LIMIT clause do?",
        "What is the DISTINCT keyword?",
        "What is a PRIMARY KEY?",
        "What is a FOREIGN KEY?"
      ],
      medium: [
        "What is the difference between DDL and DML?",
        "How do you update records in a table?",
        "How do you delete records from a table?",
        "What is the difference between DELETE and DROP?",
        "How do you use the BETWEEN operator?",
        "How do you use the IN operator?",
        "How do you use the LIKE operator for pattern matching?",
        "What is the difference between WHERE and HAVING?",
        "How do you sort data in descending order?",
        "What are the different types of SQL commands?",
        "How do you create a table with constraints?",
        "What is the difference between CHAR and VARCHAR?",
        "How do you select specific columns from a table?",
        "What is the purpose of the ALTER command?",
        "How do you add a new column to an existing table?"
      ],
      hard: [
        "Explain the difference between TRUNCATE and DELETE.",
        "How do you implement cascading deletes with FOREIGN KEY?",
        "What are the performance implications of using LIKE with wildcards?",
        "How do you optimize queries with WHERE clauses?",
        "What is the difference between COMMIT and ROLLBACK?",
        "How do you use SAVEPOINT in transactions?",
        "What are the different types of constraints in SQL?",
        "How do you implement CHECK constraints?",
        "What is the difference between GRANT and REVOKE?",
        "How do you handle NULL values in SQL queries?"
      ]
    }
  },

  // =======================================================
  // DAY 12: SQL Intermediate + Tasks
  // =======================================================
  day12: {
    topic: "SQL Intermediate - Joins, Aggregations, Subqueries",
    concepts: [
      "Joins (INNER, LEFT, RIGHT, FULL)",
      "GROUP BY and HAVING",
      "Subqueries",
      "CASE statements",
      "Aliases",
      "Views",
      "Indexes",
      "Constraints (UNIQUE, NOT NULL, CHECK)"
    ],
    questions: {
      easy: [
        "What is a JOIN in SQL?",
        "What is an INNER JOIN?",
        "What is a LEFT JOIN?",
        "What is a RIGHT JOIN?",
        "What is GROUP BY?",
        "What is HAVING?",
        "What is a subquery?",
        "What is a CASE statement?",
        "What is an alias in SQL?",
        "What is a view?",
        "What is an index?",
        "What is a UNIQUE constraint?",
        "What is a NOT NULL constraint?",
        "What is a CHECK constraint?",
        "What is the COUNT() function?"
      ],
      medium: [
        "What is the difference between INNER JOIN and LEFT JOIN?",
        "What is the difference between LEFT JOIN and RIGHT JOIN?",
        "How do you perform a FULL JOIN in MySQL?",
        "How do you use GROUP BY with aggregate functions?",
        "What is the difference between WHERE and HAVING?",
        "How do you write a subquery in the WHERE clause?",
        "How do you use CASE statements for conditional logic?",
        "How do you create an alias for a table or column?",
        "How do you create a view in SQL?",
        "How do you create an index on a column?",
        "What is the difference between a view and a table?",
        "How do you use COUNT() with GROUP BY?",
        "How do you filter grouped data with HAVING?",
        "What are the benefits of using indexes?",
        "How do you join three or more tables?"
      ],
      hard: [
        "Explain the different types of joins with examples and use cases.",
        "How do you write complex subqueries with multiple levels?",
        "What are correlated subqueries and how do they differ from regular subqueries?",
        "How do you optimize queries with multiple joins?",
        "What are the performance implications of indexes?",
        "How do you implement a FULL OUTER JOIN in MySQL using UNION?",
        "What is the difference between a clustered and non-clustered index?",
        "How do you use CASE statements in SELECT, WHERE, and ORDER BY?",
        "What are materialized views and how do they differ from regular views?",
        "How do you handle NULL values in JOIN operations?",
        "What is query execution plan and how do you analyze it?",
        "How do you implement pagination with LIMIT and OFFSET?",
        "What are the best practices for database normalization?",
        "How do you prevent SQL injection attacks?",
        "What are the ACID properties in database transactions?"
      ]
    }
  },

  // =======================================================
  // PYTHON COMPREHENSIVE CONCEPTS (150 Questions)
  // =======================================================
  pythonFundamentals: {
    topic: "Python Fundamentals - Complete Interview Prep",
    concepts: [
      "Python basics, features, PEP 8",
      "Data types, variables, type casting",
      "Functions, *args, **kwargs, lambda",
      "Recursion, built-in functions"
    ],
    questions: {
      easy: [
        "What is Python?",
        "What are the key features of Python?",
        "What is the difference between Python 2 and Python 3?",
        "Why is Python called an interpreted language?",
        "What are the major applications of Python?",
        "What is PEP 8?",
        "What are Python's built-in data types?",
        "What is the difference between a list and a tuple?",
        "What is a dictionary in Python?",
        "What is a set?",
        "How do you create variables in Python?",
        "How do you take user input?",
        "What is type casting?",
        "What are built-in functions?",
        "What is the difference between is and ==?",
        "What is a function?",
        "What is the difference between return and print?",
        "What are *args and **kwargs?",
        "What is a lambda function?",
        "What is recursion?"
      ],
      medium: [
        "What is exception handling?",
        "What is try-except?",
        "What is the finally block?",
        "What is a module?",
        "What is a package?",
        "How do you import modules?",
        "What are built-in modules?",
        "What is the with statement?",
        "What are comments?",
        "How do you write multi-line comments?",
        "What are docstrings?",
        "How do you read a file?",
        "What is the difference between r and rb?",
        "How do you write to a file?",
        "What is list comprehension?",
        "What is a generator?",
        "What is the difference between generator and iterator?",
        "What are decorators?",
        "What is pass?",
        "What is None?"
      ],
      hard: [
        "What is the difference between mutable and immutable?",
        "What is slicing?",
        "What is del?",
        "What is the difference between global and local variables?",
        "What is the global keyword?",
        "What is variable scope?",
        "What is namespace?",
        "Why is indentation important?",
        "What are identifier rules?",
        "What is OOP?"
      ]
    }
  },

  pythonOOP: {
    topic: "Python Object-Oriented Programming",
    concepts: [
      "Classes and objects",
      "Inheritance types",
      "Polymorphism, Encapsulation",
      "Static and class methods"
    ],
    questions: {
      easy: [
        "What are classes and objects?",
        "What is __init__?",
        "What is the difference between instance and class variables?",
        "What is inheritance?",
        "What are the types of inheritance?",
        "What is polymorphism?",
        "What is encapsulation?",
        "What is method overloading?",
        "What is method overriding?",
        "What is the difference between @staticmethod and @classmethod?"
      ],
      medium: [
        "How does memory management work in Python?",
        "What is garbage collection?",
        "What are magic methods?",
        "What is __str__?",
        "What is the difference between shallow and deep copy?",
        "What are metaclasses?",
        "What are iterators?",
        "How do you create a custom iterator?",
        "What is a context manager?",
        "What are closures?"
      ],
      hard: [
        "Explain Python's memory management in detail.",
        "How does garbage collection work internally?",
        "What are the different types of magic methods?",
        "How do you implement custom metaclasses?",
        "What is the difference between __new__ and __init__?",
        "How do you implement custom context managers?",
        "Explain the concept of closures with examples.",
        "What are descriptors in Python?",
        "How do you implement the iterator protocol?",
        "What is the MRO (Method Resolution Order)?"
      ]
    }
  },

  pythonDataStructures: {
    topic: "Python Data Structures & Algorithms",
    concepts: [
      "Lists, tuples, sets, dictionaries",
      "Stack, queue, deque",
      "Set operations",
      "Dictionary operations"
    ],
    questions: {
      easy: [
        "What are Python data structures?",
        "How do you implement a stack using list?",
        "How do you implement a queue using deque?",
        "What is the difference between append and extend?",
        "What are set use cases?",
        "What are set operations?",
        "How do you remove duplicates?",
        "How do you merge dictionaries?",
        "What is enumerate?",
        "What is zip?"
      ],
      medium: [
        "How do you implement a stack with push and pop operations?",
        "What is the difference between list and deque for queues?",
        "How do you perform union, intersection, and difference on sets?",
        "How do you merge multiple dictionaries in Python 3.9+?",
        "What is the difference between enumerate and range?",
        "How do you use zip with multiple iterables?",
        "What are dictionary comprehensions?",
        "How do you sort a dictionary by value?",
        "What is the difference between list() and []?",
        "How do you flatten a nested list?"
      ],
      hard: [
        "Implement a custom stack with min() operation in O(1) time.",
        "How do you implement a circular queue?",
        "What are the time complexities of set operations?",
        "How do you implement a LRU cache using OrderedDict?",
        "What is the difference between defaultdict and regular dict?",
        "How do you implement a trie data structure?",
        "What are the performance implications of different data structures?",
        "How do you implement a priority queue?",
        "What is the difference between heapq and queue.PriorityQueue?",
        "How do you implement a graph using adjacency list?"
      ]
    }
  },

  pythonFunctional: {
    topic: "Functional Programming & Advanced Concepts",
    concepts: [
      "map, filter, reduce",
      "Regular expressions",
      "Virtual environments",
      "Python frameworks"
    ],
    questions: {
      easy: [
        "What are map, filter, and reduce?",
        "What are regular expressions?",
        "What is pattern matching?",
        "What is the re module?",
        "What are virtual environments?",
        "What is pip?",
        "What are Python frameworks?",
        "What is Flask?",
        "What is Django?",
        "What are data science libraries?"
      ],
      medium: [
        "How do you use map to transform a list?",
        "What is the difference between map and list comprehension?",
        "How do you use filter to select elements?",
        "How do you use reduce to aggregate values?",
        "What are common regex patterns?",
        "How do you create a virtual environment?",
        "What is the difference between pip and conda?",
        "What is the difference between Flask and Django?",
        "What are NumPy and Pandas used for?",
        "What is the difference between requirements.txt and Pipfile?"
      ],
      hard: [
        "What are the performance implications of map vs list comprehension?",
        "How do you write complex regex patterns with groups?",
        "What is the difference between re.match, re.search, and re.findall?",
        "How do you implement custom reduce functions?",
        "What are the best practices for virtual environment management?",
        "How do you handle dependencies in production?",
        "What is the difference between WSGI and ASGI?",
        "How do you optimize regex performance?",
        "What are the trade-offs between functional and imperative programming?",
        "How do you implement lazy evaluation in Python?"
      ]
    }
  },

  pythonDataScience: {
    topic: "Data Science & Async Programming",
    concepts: [
      "NumPy, Pandas, Matplotlib",
      "Data handling",
      "Coroutines, asyncio"
    ],
    questions: {
      easy: [
        "What is NumPy?",
        "What is Pandas?",
        "What is Matplotlib?",
        "What is Scikit-learn?",
        "How do you handle missing data?",
        "What is the difference between loc and iloc?",
        "How do you read CSV?",
        "How do you write Excel?",
        "What are coroutines?",
        "What is asyncio?"
      ],
      medium: [
        "How do you create NumPy arrays?",
        "What is the difference between Series and DataFrame?",
        "How do you handle missing values in Pandas?",
        "What is the difference between loc and iloc indexing?",
        "How do you read and write CSV files?",
        "How do you create plots with Matplotlib?",
        "What is the difference between async and sync functions?",
        "How do you use asyncio.gather?",
        "What are async context managers?",
        "How do you handle exceptions in async code?"
      ],
      hard: [
        "What are the performance benefits of NumPy over lists?",
        "How do you optimize Pandas operations for large datasets?",
        "What is vectorization in NumPy?",
        "How do you implement custom aggregations in Pandas?",
        "What is the event loop in asyncio?",
        "How do you implement async generators?",
        "What is the difference between asyncio.create_task and asyncio.gather?",
        "How do you handle backpressure in async applications?",
        "What are the best practices for async/await?",
        "How do you debug async code?"
      ]
    }
  },

  pythonConcurrency: {
    topic: "Concurrency, Testing & APIs",
    concepts: [
      "Multithreading, multiprocessing",
      "GIL, testing frameworks",
      "Database connections",
      "API handling"
    ],
    questions: {
      easy: [
        "What is multithreading?",
        "What is the GIL?",
        "What is multiprocessing?",
        "What is the difference between thread and process?",
        "What is the Queue module?",
        "What are daemon threads?",
        "What is debugging?",
        "What are logging levels?",
        "What is testing?",
        "What is unit testing?"
      ],
      medium: [
        "How does the GIL affect multithreading?",
        "When should you use multiprocessing over multithreading?",
        "How do you use the threading module?",
        "What is the difference between Thread and Process?",
        "How do you use Queue for thread communication?",
        "What are the different logging levels?",
        "What is the difference between unittest and pytest?",
        "How do you write unit tests?",
        "What is mocking?",
        "What is monkey patching?"
      ],
      hard: [
        "Explain the GIL and its impact on performance.",
        "How do you implement thread-safe code?",
        "What are the best practices for multiprocessing?",
        "How do you handle race conditions?",
        "What is the difference between Lock and RLock?",
        "How do you implement a thread pool?",
        "What are the best practices for testing?",
        "How do you implement integration tests?",
        "What is test-driven development (TDD)?",
        "How do you measure code coverage?"
      ]
    }
  },

  pythonAdvanced: {
    topic: "Modern & Advanced Python Features",
    concepts: [
      "Type hints, dataclasses",
      "Pattern matching, f-strings",
      "Optimization techniques",
      "Security best practices"
    ],
    questions: {
      easy: [
        "What is profiling?",
        "What are assertions?",
        "What are memory leaks?",
        "What are type hints?",
        "What are dataclasses?",
        "What are frozen dataclasses?",
        "What is the walrus operator?",
        "What is pattern matching (3.10+)?",
        "What are f-strings?",
        "What is __slots__?"
      ],
      medium: [
        "How do you profile Python code?",
        "What is the difference between type hints and runtime type checking?",
        "How do you use dataclasses?",
        "What is the walrus operator (:=) used for?",
        "How do you use pattern matching in Python 3.10+?",
        "What are the benefits of f-strings over format()?",
        "What is __slots__ and when to use it?",
        "What are globals() and locals()?",
        "What is the difference between eval and exec?",
        "What are recursion limits?"
      ],
      hard: [
        "How do you optimize Python code for performance?",
        "What are the memory implications of __slots__?",
        "How do you implement tail recursion optimization?",
        "What is the difference between compile-time and runtime?",
        "What are Python 3.11 performance improvements?",
        "How do you use lru_cache for optimization?",
        "What are async context managers?",
        "What are Python security best practices?",
        "How do you prevent code injection?",
        "What are the best practices for production Python code?"
      ]
    }
  },

  pythonDatabase: {
    topic: "Database & Serialization",
    concepts: [
      "Serialization, JSON, Pickle",
      "Database connections",
      "SQLite, MySQL, SQLAlchemy",
      "API data fetching"
    ],
    questions: {
      easy: [
        "What is serialization?",
        "What is Pickle?",
        "What is JSON handling?",
        "What is database connection?",
        "What is SQLite?",
        "What is MySQL?",
        "What is SQLAlchemy?",
        "What is API data fetching?",
        "What is the requests module?",
        "What are design patterns?"
      ],
      medium: [
        "How do you serialize objects with Pickle?",
        "What is the difference between JSON and Pickle?",
        "How do you connect to SQLite?",
        "How do you execute SQL queries in Python?",
        "What is an ORM?",
        "How do you use SQLAlchemy?",
        "How do you fetch data from APIs?",
        "What is the difference between GET and POST requests?",
        "How do you handle API authentication?",
        "What are common design patterns in Python?"
      ],
      hard: [
        "What are the security concerns with Pickle?",
        "How do you implement custom JSON encoders?",
        "What is the difference between SQLAlchemy Core and ORM?",
        "How do you implement database migrations?",
        "What are the best practices for database connections?",
        "How do you implement connection pooling?",
        "What is the Singleton pattern?",
        "What is the Factory Method pattern?",
        "What is the Observer pattern?",
        "How do you implement retry logic for API calls?"
      ]
    }
  },

  pythonBestPractices: {
    topic: "Best Practices & Performance",
    concepts: [
      "Code optimization",
      "Performance tuning",
      "Best practices",
      "Production readiness"
    ],
    questions: {
      easy: [
        "What are best practices in Python?",
        "What is the difference between list comprehension and map?",
        "What is timeit?",
        "What is caching?",
        "What is code profiling?",
        "What is code review?",
        "What is version control?",
        "What is documentation?",
        "What is testing?",
        "What is deployment?"
      ],
      medium: [
        "How do you measure code performance?",
        "What is the difference between list comprehension and generator expression?",
        "How do you use timeit for benchmarking?",
        "What is memoization?",
        "How do you implement caching?",
        "What are the best practices for error handling?",
        "How do you write maintainable code?",
        "What is the DRY principle?",
        "What is SOLID in Python?",
        "How do you document Python code?"
      ],
      hard: [
        "What are the performance optimization techniques?",
        "How do you profile memory usage?",
        "What is the difference between cProfile and profile?",
        "How do you implement distributed caching?",
        "What are the best practices for large-scale Python applications?",
        "How do you handle technical debt?",
        "What is continuous integration/deployment?",
        "How do you implement logging in production?",
        "What are the security considerations for production code?",
        "How do you monitor Python applications in production?"
      ]
    }
  }
};

// =======================================================
// 🔹 GET RANDOM QUESTION BY DIFFICULTY
// =======================================================
function getRandomPythonQuestion(difficulty = "easy", day = null) {
  let days;
  
  if (day) {
    // Handle specific day requests
    const dayKey = `day${day}`;
    if (PYTHON_QUESTION_BANK[dayKey]) {
      days = [PYTHON_QUESTION_BANK[dayKey]];
    } else {
      days = Object.values(PYTHON_QUESTION_BANK);
    }
  } else {
    days = Object.values(PYTHON_QUESTION_BANK);
  }
  
  const allQuestions = days.flatMap(d => d.questions && d.questions[difficulty] ? d.questions[difficulty] : []);
  
  if (allQuestions.length === 0) {
    return "What is Python? Explain its features.";
  }
  
  const randomIndex = Math.floor(Math.random() * allQuestions.length);
  return allQuestions[randomIndex];
}

// =======================================================
// 🔹 GET QUESTIONS BY TOPIC
// =======================================================
function getQuestionsByTopic(topic, difficulty = "easy") {
  for (const day of Object.values(PYTHON_QUESTION_BANK)) {
    if (day.topic.toLowerCase().includes(topic.toLowerCase())) {
      return day.questions[difficulty] || [];
    }
  }
  return [];
}

// =======================================================
// 🔹 GET ALL CONCEPTS
// =======================================================
function getAllPythonConcepts() {
  return Object.values(PYTHON_QUESTION_BANK).flatMap(day => day.concepts);
}

module.exports = {
  PYTHON_QUESTION_BANK,
  getRandomPythonQuestion,
  getQuestionsByTopic,
  getAllPythonConcepts
};
