// =======================================================
// 🔹 REACT QUESTION BANK
// Comprehensive question bank covering 7 days of React concepts
// =======================================================

const REACT_QUESTION_BANK = {
  
  // =======================================================
  // DAY 1: JSX, Components, Props, State, Events, Conditional Rendering
  // =======================================================
  day1: {
    topic: "React Basics - JSX, Components, Props & State",
    concepts: [
      "JSX",
      "Components (Parent and Child)",
      "Props",
      "State",
      "Event Handling",
      "Conditional Rendering",
      "Styling (Tailwind, CSS Modules, Styled Components)"
    ],
    questions: {
      easy: [
        "What is JSX?",
        "What is a React component?",
        "What is the difference between props and state?",
        "How do you pass data from parent to child component?",
        "What is an event handler in React?",
        "What is conditional rendering?",
        "How do you handle button clicks in React?",
        "What is the difference between functional and class components?",
        "How do you add CSS classes in JSX?",
        "What is the useState hook?"
      ],
      medium: [
        "How do you pass functions as props to child components?",
        "What is the difference between controlled and uncontrolled components?",
        "How do you conditionally render components using ternary operators?",
        "What is the difference between inline styles and CSS modules?",
        "How do you update state in React?",
        "What happens when you call setState?",
        "How do you handle form submissions in React?",
        "What is the difference between props.children and regular props?",
        "How do you style components using Tailwind CSS?",
        "What is the virtual DOM?"
      ],
      hard: [
        "Explain the React component lifecycle in functional components.",
        "How does React's reconciliation algorithm work?",
        "What is the difference between shallow and deep comparison in React?",
        "How do you optimize re-renders in React components?",
        "Explain how event delegation works in React.",
        "What is the difference between synthetic events and native events?",
        "How do you implement conditional rendering with multiple conditions?",
        "What are the performance implications of inline functions in JSX?",
        "How do you implement CSS-in-JS with styled-components?",
        "Explain the concept of lifting state up with an example."
      ]
    }
  },

  // =======================================================
  // DAY 2: Lists, Forms, Lifting State, Composition, useRef, Fragments
  // =======================================================
  day2: {
    topic: "Forms, Lists & Component Patterns",
    concepts: [
      "Lists & Keys",
      "Form Handling & Validation",
      "Lifting State Up",
      "Component Composition",
      "props.children",
      "useRef",
      "Fragments"
    ],
    questions: {
      easy: [
        "Why do we need keys in React lists?",
        "What is the map() function used for in React?",
        "What is lifting state up?",
        "What is props.children?",
        "What is useRef?",
        "What is a React Fragment?",
        "How do you handle form inputs in React?",
        "What is form validation?",
        "How do you create a list of components?",
        "What is component composition?"
      ],
      medium: [
        "What happens if you don't provide keys in a list?",
        "How do you validate form inputs manually in React?",
        "When should you lift state up?",
        "How do you use props.children for flexible components?",
        "What is the difference between useRef and useState?",
        "How do you focus an input field using useRef?",
        "What is the difference between <></> and <React.Fragment>?",
        "How do you handle multiple form inputs with one state object?",
        "What is the difference between composition and inheritance?",
        "How do you dynamically add/remove items from a list?"
      ],
      hard: [
        "Explain the performance implications of using index as key.",
        "How do you implement complex form validation with nested objects?",
        "What are the best practices for lifting state up in large apps?",
        "How do you implement render props pattern?",
        "What is the difference between useRef and createRef?",
        "How do you implement a reusable form field component?",
        "What are the use cases for Fragments vs div wrappers?",
        "How do you handle form submission with async validation?",
        "Explain the compound component pattern.",
        "How do you prevent unnecessary re-renders in list components?"
      ]
    }
  },

  // =======================================================
  // DAY 3: Portals, Error Boundaries, Context API, useEffect
  // =======================================================
  day3: {
    topic: "Advanced Patterns - Portals, Error Boundaries & Context",
    concepts: [
      "Portals",
      "Error Boundaries",
      "Controlled vs Uncontrolled Components",
      "useState",
      "useEffect",
      "useContext & Context API"
    ],
    questions: {
      easy: [
        "What are React Portals?",
        "What is an Error Boundary?",
        "What is the difference between controlled and uncontrolled components?",
        "What is useEffect?",
        "What is the Context API?",
        "What is useContext?",
        "When do you use Portals?",
        "How do you create a Context?",
        "What is a side effect in React?",
        "What is the Provider component?"
      ],
      medium: [
        "How do you create a modal using Portals?",
        "How do you implement an Error Boundary?",
        "What are the advantages of controlled components?",
        "How do you clean up side effects in useEffect?",
        "How do you pass data through Context?",
        "What is the difference between props drilling and Context?",
        "When should you use useEffect?",
        "How do you handle errors in Error Boundaries?",
        "What is the dependency array in useEffect?",
        "How do you consume Context in multiple components?"
      ],
      hard: [
        "What are the limitations of Error Boundaries?",
        "How do you implement a theme system using Context API?",
        "What happens if you don't provide a dependency array in useEffect?",
        "How do you optimize Context to prevent unnecessary re-renders?",
        "What is the difference between useEffect and useLayoutEffect?",
        "How do you implement authentication using Context API?",
        "What are the performance implications of using Context?",
        "How do you handle async errors in Error Boundaries?",
        "Explain the useEffect cleanup function with an example.",
        "How do you implement multiple Contexts in an app?"
      ]
    }
  },

  // =======================================================
  // DAY 4: useReducer, useMemo, useCallback, Custom Hooks
  // =======================================================
  day4: {
    topic: "Performance Optimization & Advanced Hooks",
    concepts: [
      "useReducer",
      "useRef",
      "useMemo",
      "useCallback",
      "Custom Hooks",
      "Performance Optimization"
    ],
    questions: {
      easy: [
        "What is useReducer?",
        "What is useMemo?",
        "What is useCallback?",
        "What is a custom hook?",
        "When do you use useReducer instead of useState?",
        "What does useMemo return?",
        "What does useCallback return?",
        "How do you create a custom hook?",
        "What is memoization?",
        "What is the purpose of useRef?"
      ],
      medium: [
        "What is the difference between useReducer and useState?",
        "How does useMemo improve performance?",
        "What is the difference between useMemo and useCallback?",
        "How do you share logic between components using custom hooks?",
        "When should you use useMemo?",
        "How do you prevent unnecessary re-renders with useCallback?",
        "What is a reducer function?",
        "How do you implement a custom hook for API calls?",
        "What are the rules of hooks?",
        "How do you use useRef for performance optimization?"
      ],
      hard: [
        "Explain the useReducer pattern with complex state management.",
        "What are the performance trade-offs of using useMemo?",
        "How do you implement a custom hook with cleanup logic?",
        "What is the difference between React.memo and useMemo?",
        "How do you optimize a large list with useCallback and useMemo?",
        "Explain when NOT to use useMemo or useCallback.",
        "How do you implement a custom hook for localStorage?",
        "What are the best practices for creating reusable custom hooks?",
        "How do you handle side effects in custom hooks?",
        "Explain the concept of referential equality in React."
      ]
    }
  },

  // =======================================================
  // DAY 5: API Fetching, Axios, Fetch, Conditional UI
  // =======================================================
  day5: {
    topic: "API Integration & Data Fetching",
    concepts: [
      "Axios (HTTP requests)",
      "fetch API",
      "Conditional rendering",
      "Loading states",
      "Error handling",
      "Dynamic UI updates"
    ],
    questions: {
      easy: [
        "What is Axios?",
        "What is the fetch API?",
        "How do you make a GET request in React?",
        "What is a loading state?",
        "How do you handle API errors?",
        "What is async/await?",
        "How do you display loading spinners?",
        "What is the difference between Axios and fetch?",
        "How do you make a POST request?",
        "What is JSON?"
      ],
      medium: [
        "How do you fetch data on component mount?",
        "What is the difference between Axios and fetch error handling?",
        "How do you implement loading and error states?",
        "How do you cancel API requests in React?",
        "What is the AbortController?",
        "How do you handle pagination with API calls?",
        "How do you implement search functionality with API?",
        "What are the best practices for API error handling?",
        "How do you retry failed API requests?",
        "How do you implement infinite scrolling?"
      ],
      hard: [
        "How do you implement request caching in React?",
        "What are the performance implications of multiple API calls?",
        "How do you implement optimistic UI updates?",
        "How do you handle race conditions in API calls?",
        "What is the difference between SWR and React Query?",
        "How do you implement request debouncing for search?",
        "How do you handle authentication tokens in API requests?",
        "What are the best practices for API state management?",
        "How do you implement request interceptors?",
        "How do you handle concurrent API requests?"
      ]
    }
  },

  // =======================================================
  // DAY 6: State Management - Redux, Redux Toolkit
  // =======================================================
  day6: {
    topic: "State Management with Redux",
    concepts: [
      "Redux basics",
      "Actions & Reducers",
      "Redux Store",
      "useSelector",
      "useDispatch",
      "Redux Toolkit",
      "createSlice",
      "configureStore"
    ],
    questions: {
      easy: [
        "What is Redux?",
        "What is a Redux store?",
        "What is an action in Redux?",
        "What is a reducer?",
        "What is useSelector?",
        "What is useDispatch?",
        "What is Redux Toolkit?",
        "What is createSlice?",
        "What is configureStore?",
        "Why use Redux?"
      ],
      medium: [
        "What is the difference between Redux and Context API?",
        "How do you create a Redux store?",
        "What is the difference between actions and action creators?",
        "How does useSelector work?",
        "How do you dispatch actions in Redux?",
        "What is the difference between Redux and Redux Toolkit?",
        "How do you handle async actions in Redux?",
        "What is Redux middleware?",
        "How do you structure a Redux application?",
        "What is the Redux DevTools?"
      ],
      hard: [
        "Explain the Redux data flow with an example.",
        "How do you implement Redux Thunk for async actions?",
        "What are the performance implications of using Redux?",
        "How do you normalize state in Redux?",
        "What is the difference between Redux Thunk and Redux Saga?",
        "How do you implement optimistic updates with Redux?",
        "What are selectors and why use them?",
        "How do you handle side effects in Redux?",
        "What is the difference between local state and Redux state?",
        "How do you implement undo/redo with Redux?"
      ]
    }
  },

  // =======================================================
  // DAY 7: Full App - Routing, Auth, Optimization, Error Handling
  // =======================================================
  day7: {
    topic: "Production-Ready React App",
    concepts: [
      "React Router",
      "Authentication",
      "Lazy Loading",
      "Code Splitting",
      "Error Boundaries",
      "Performance Optimization",
      "Best Practices"
    ],
    questions: {
      easy: [
        "What is React Router?",
        "What is lazy loading?",
        "What is code splitting?",
        "What is Suspense?",
        "What is a protected route?",
        "What is authentication?",
        "What is React.lazy?",
        "What is a fallback UI?",
        "What is the Link component?",
        "What is the useNavigate hook?"
      ],
      medium: [
        "How do you implement routing in React?",
        "What is the difference between Link and NavLink?",
        "How do you implement protected routes?",
        "How do you lazy load components?",
        "What is the difference between React.lazy and dynamic import?",
        "How do you handle 404 pages?",
        "How do you pass data between routes?",
        "What is the useParams hook?",
        "How do you implement nested routes?",
        "How do you redirect users after login?"
      ],
      hard: [
        "How do you implement route-based code splitting?",
        "What are the best practices for authentication in React?",
        "How do you implement role-based access control?",
        "What is the difference between client-side and server-side routing?",
        "How do you optimize bundle size in React?",
        "How do you implement route guards?",
        "What are the performance implications of lazy loading?",
        "How do you handle authentication tokens securely?",
        "How do you implement SSR with React Router?",
        "What are the best practices for production React apps?"
      ]
    }
  }
};

// =======================================================
// 🔹 GET RANDOM QUESTION BY DIFFICULTY
// =======================================================
function getRandomReactQuestion(difficulty = "easy", day = null) {
  const days = day ? [REACT_QUESTION_BANK[`day${day}`]] : Object.values(REACT_QUESTION_BANK);
  
  const allQuestions = days.flatMap(d => d.questions[difficulty] || []);
  
  if (allQuestions.length === 0) {
    return "What is React? Where is it used?";
  }
  
  const randomIndex = Math.floor(Math.random() * allQuestions.length);
  return allQuestions[randomIndex];
}

// =======================================================
// 🔹 GET QUESTIONS BY TOPIC
// =======================================================
function getQuestionsByTopic(topic, difficulty = "easy") {
  for (const day of Object.values(REACT_QUESTION_BANK)) {
    if (day.topic.toLowerCase().includes(topic.toLowerCase())) {
      return day.questions[difficulty] || [];
    }
  }
  return [];
}

// =======================================================
// 🔹 GET ALL CONCEPTS
// =======================================================
function getAllReactConcepts() {
  return Object.values(REACT_QUESTION_BANK).flatMap(day => day.concepts);
}

module.exports = {
  REACT_QUESTION_BANK,
  getRandomReactQuestion,
  getQuestionsByTopic,
  getAllReactConcepts
};
