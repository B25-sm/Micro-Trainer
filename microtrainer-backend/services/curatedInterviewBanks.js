/**
 * Curated interview questions — practical, specific, answerable.
 * Legacy banks are NOT used for live interviews; only these pools are.
 */

const { MONGODB_QUESTION_BANK, getRandomMongoQuestion } = require("./mongodbQuestionBank");

const EXPRESS_BANK = {
  easy: [
    "Express GET /api/health — write the route handler code",
    "req.params vs req.query — give one example of each",
    "Express middleware — what runs before your route handler?",
    "How do you parse JSON bodies in Express?",
    "Send JSON from an Express route — show res.json() usage",
    "Express Router — split routes into a users.js file",
    "404 handler in Express — how do you register it last?",
    "CORS in Express — why do browsers need it?",
  ],
  medium: [
    "Express error middleware — write the 4-parameter signature",
    "Validate request body in Express before hitting the database",
    "JWT auth middleware — outline the steps in order",
    "Rate limiting on /api/login — why and how?",
    "Multer file upload — what does single('avatar') do?",
    "helmet() in Express — what headers does it help set?",
    "Async route handler errors — how do you pass them to next()?",
    "API versioning: /api/v1 vs header — trade-offs?",
  ],
  hard: [
    "Design Express middleware chain for auth + role check + logging",
    "Graceful shutdown — close server and DB on SIGTERM",
    "Prevent NoSQL injection in Express + MongoDB routes",
    "Circuit breaker when downstream payment API fails",
    "Structure a large Express app: routes, controllers, services",
  ],
};

const REACT_BANK = {
  easy: [
    "useState counter — write a button that increments count",
    "Props vs state — give a parent/child component example",
    "Conditional rendering — show login vs dashboard with one boolean",
    "Handle form submit in React — preventDefault and read input",
    "Key prop in lists — why not use array index for dynamic lists?",
    "Controlled input — wire an email field to state",
    "Lift state up — share selected tab between sibling components",
    "useEffect fetch on mount — outline the pattern (no full app)",
  ],
  medium: [
    "useEffect cleanup — give a real subscription or timer example",
    "useContext for theme — when is it better than prop drilling?",
    "React.memo — when does it actually help performance?",
    "Custom hook useFetch — what state would you track?",
    "Error boundary — what errors does it catch vs not catch?",
    "useReducer vs useState — when pick reducer for a form?",
    "React Router protected route — high-level steps",
    "Optimistic UI update — how would you rollback on failure?",
  ],
  hard: [
    "Stale closure in useEffect — how do you fix wrong count?",
    "Code-splitting with lazy() — what goes in Suspense fallback?",
    "Re-render cascade — how do you trace and reduce it?",
    "Server state vs client state — where does React Query fit?",
    "Accessibility fix: keyboard trap in a modal component",
  ],
};

const NODE_BANK = {
  easy: [
    "Node Event Loop — why is setTimeout(0) not instant?",
    "module.exports vs exports — show a tiny example",
    "readFile vs createReadStream — when use streams?",
    "process.env.PORT — how do you load it with dotenv?",
    "package.json scripts — what does \"start\": \"node index.js\" do?",
    "fs.promises.readFile — write async/await usage",
    "__dirname vs import.meta — when does each apply?",
    "npm vs npx — give a real command example for each",
  ],
  medium: [
    "Unhandled promise rejection in Node — how do you log it?",
    "Child process spawn vs exec — when use which?",
    "Buffer vs string for binary file data",
    "cluster module — why fork workers for CPU-heavy tasks?",
    "EventEmitter — publish/subscribe pattern in Node",
    "path.join vs string concat — why join on Windows?",
    "Environment-based config — dev vs prod without hardcoding",
    "Backpressure in Writable streams — what happens if ignored?",
  ],
  hard: [
    "Debug memory leak from growing EventEmitter listeners",
    "Worker threads vs cluster for CPU-bound job queue",
    "Design a file upload pipeline with size limits and virus scan hook",
    "Graceful restart with zero-downtime on Render/Heroku",
    "Securely store API keys — never commit; what pattern instead?",
  ],
};

const JAVASCRIPT_BANK = {
  easy: [
    "map() vs forEach() — when do you need the returned array?",
    "== vs === — show one example where they differ",
    "Closure — write a function that returns a counter",
    "const vs let in a for loop with setTimeout — what breaks?",
    "Spread operator — clone an array without mutating original",
    "Template literals — build a greeting with a name variable",
    "Arrow function vs function — 'this' binding difference",
    "Optional chaining ?. — safe access on nested API response",
  ],
  medium: [
    "Promise.all vs Promise.allSettled — when use each?",
    "Debounce vs throttle — search box vs scroll handler",
    "Event delegation — one listener on ul for many li clicks",
    "Shallow copy vs deep copy — object with nested array",
    "async/await error handling — try/catch vs .catch()",
    "Currying — write add(2)(3) style function",
    "Prototype chain — how does obj.toString exist?",
    "WeakMap use case — caching DOM nodes without leaks",
  ],
  hard: [
    "Implement Promise.race with timeout wrapper",
    "Fix race condition in parallel fetch then merge",
    "Proxy object for validation on set trap",
    "Generator function for paginated API fetch loop",
    "Microtasks vs macrotasks — order of Promise vs setTimeout",
  ],
};

const JAVA_BANK = {
  easy: [
    "ArrayList vs LinkedList — when would you pick each?",
    "HashMap — how do hashCode and equals work together?",
    "String vs StringBuilder in a loop — performance issue?",
    "@Override — why mark methods overridden from Object?",
    "try-with-resources — auto-close JDBC Connection example",
    "interface vs abstract class — one scenario for each",
    "final keyword — on variable, method, and class",
    "Maven pom.xml — what is groupId and artifactId?",
  ],
  medium: [
    "@RestController GET /users — sketch the method signature",
    "@Autowired constructor injection — why preferred over field?",
    "JPA @OneToMany — parent Order, child OrderItem example",
    "Stream filter + map — get active user emails",
    "Optional.orElseThrow — avoid null from repository",
    "Bean scope singleton vs prototype — real impact?",
    "Checked vs unchecked exception — when throw which?",
    "Spring @Transactional — what rolls back by default?",
  ],
  hard: [
    "N+1 query problem in JPA — detect and fix with fetch join",
    "Design thread-safe cache with ConcurrentHashMap",
    "Circuit breaker pattern for external REST client",
    "JWT filter chain order in Spring Security",
    "Migrate monolith module to separate service — first steps",
  ],
};

const PYTHON_BANK = {
  easy: [
    "List comprehension — filter even numbers from 1–10",
    "dict.get vs dict[key] — when avoid KeyError?",
    "virtualenv — why isolate project dependencies?",
    "f-strings vs .format() — format a user greeting",
    "with open() — read a file safely",
    "def vs lambda — when is lambda too cramped?",
    "pip install -r requirements.txt — what goes in the file?",
    "if __name__ == '__main__' — why guard script entry?",
  ],
  medium: [
    "Django Model — define User with email unique",
    "Flask route @app.route('/hello') — return JSON",
    "List vs tuple — immutable config tuple example",
    "Decorators — write @timer that logs execution time",
    "requests.get timeout — handle timeout exception",
    "pandas read_csv — drop null rows in one line idea",
    "pytest fixture — share DB connection across tests",
    "GIL — when does it matter for CPU-bound Python?",
  ],
  hard: [
    "Asyncio gather vs wait — parallel HTTP calls pattern",
    "Django N+1 in templates — select_related fix",
    "Type hints + mypy — catch bug before runtime",
    "Design Celery task for email with retry backoff",
    "Memory profile a pandas pipeline on large CSV",
  ],
};

const SQL_BANK = {
  easy: [
    "SELECT active users — WHERE status = 'active'",
    "INNER JOIN orders and customers — match on customer_id",
    "COUNT vs COUNT(DISTINCT) — when do they differ?",
    "PRIMARY KEY vs UNIQUE — give table example",
    "INSERT with explicit columns — why list columns?",
    "ORDER BY created_at DESC — latest 10 rows",
    "GROUP BY department — count employees per dept",
    "NULL check — WHERE email IS NOT NULL",
  ],
  medium: [
    "Second highest salary — write the query",
    "LEFT JOIN — customers with zero orders still listed",
    "Index on (email, created_at) — query it helps",
    "HAVING vs WHERE — filter aggregated results",
    "Subquery vs JOIN — same result, trade-offs?",
    "UPDATE with JOIN — set order status from payment table",
    "EXPLAIN plan — what is 'full table scan' bad sign?",
    "Window function ROW_NUMBER — dedupe latest row per user",
  ],
  hard: [
    "Deadlock scenario — two transactions update rows opposite order",
    "Partition large logs table by month — why and how?",
    "Slow query on 50M rows — indexing strategy steps",
    "CTE recursive — employee manager hierarchy",
    "Migrate schema add NOT NULL column on live table safely",
  ],
};

function pickFromBank(bank, difficulty = "easy") {
  const pool = bank[difficulty] || bank.easy || bank.medium;
  return pool[Math.floor(Math.random() * pool.length)];
}

function getRandomExpressQuestion(difficulty) {
  return pickFromBank(EXPRESS_BANK, difficulty);
}
function getRandomReactQuestionCurated(difficulty) {
  return pickFromBank(REACT_BANK, difficulty);
}
function getRandomNodeQuestionCurated(difficulty) {
  return pickFromBank(NODE_BANK, difficulty);
}
function getRandomJSQuestionCurated(difficulty) {
  return pickFromBank(JAVASCRIPT_BANK, difficulty);
}
function getRandomJavaQuestionCurated(difficulty) {
  return pickFromBank(JAVA_BANK, difficulty);
}
function getRandomPythonQuestionCurated(difficulty) {
  return pickFromBank(PYTHON_BANK, difficulty);
}
function getRandomSQLQuestionCurated(difficulty) {
  return pickFromBank(SQL_BANK, difficulty);
}

/** Subject affinity — block cross-tech leakage from old banks */
function isOffTopicQuestion(question, subject) {
  const q = question.toLowerCase();
  const s = String(subject || "").toLowerCase();
  const isFullStack = s.includes("full stack") || s.includes("fullstack") || s.includes("mern");

  const reactTerms = /\b(react|useeffect|usestate|jsx|redux|usememo|usecallback|component props)\b/;
  const javaTerms = /\b(spring boot|hibernate|jpa|bean|maven)\b/;
  const pythonTerms = /\b(django|flask|pandas|pytest|virtualenv|gil)\b/;
  const sqlTerms = /\b(select |join |group by|where |insert into)\b/;
  const mongoTerms = /\b(mongodb|mongoose|bson|aggregation pipeline)\b/;

  if (!isFullStack) {
    if (s.includes("python") && reactTerms.test(q) && !pythonTerms.test(q)) return true;
    if (s.includes("java") && !s.includes("stack") && reactTerms.test(q) && !javaTerms.test(q)) return true;
    if (s.includes("sql") && (reactTerms.test(q) || mongoTerms.test(q))) return true;
    if (s.includes("javascript") && (javaTerms.test(q) || pythonTerms.test(q))) return true;
    if (s.includes("mongodb") && reactTerms.test(q) && !mongoTerms.test(q)) return true;
    if (s.includes("express") && reactTerms.test(q) && !q.includes("express")) return true;
  }
  return false;
}

module.exports = {
  EXPRESS_BANK,
  REACT_BANK,
  NODE_BANK,
  JAVASCRIPT_BANK,
  JAVA_BANK,
  PYTHON_BANK,
  SQL_BANK,
  getRandomMongoQuestion,
  getRandomExpressQuestion,
  getRandomReactQuestionCurated,
  getRandomNodeQuestionCurated,
  getRandomJSQuestionCurated,
  getRandomJavaQuestionCurated,
  getRandomPythonQuestionCurated,
  getRandomSQLQuestionCurated,
  isOffTopicQuestion,
};
