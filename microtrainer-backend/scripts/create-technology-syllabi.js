/**
 * Writes scripts/syllabi/*.js for all stack curricula (except javascript, datascience).
 * Run once: node scripts/create-technology-syllabi.js
 */
const fs = require("fs");
const path = require("path");
const { mod } = require("./syllabi/_helpers");

function section(id, title, moduleDefs) {
  return {
    id,
    title,
    modules: moduleDefs.map(([title, topics, project]) =>
      mod(title, topics, project ?? null)
    ),
  };
}

const SPECS = {
  python: {
    technology: "Python",
    idPrefix: "py",
    domainHint: "Python 3 scripts, notebooks, and backend development",
    sections: [
      section("01", "Python Foundations & Environment", [
        ["Python Landscape & Career Paths", ["What Python is and where it runs", "Roles: backend, data science, automation, DevOps", "Python 2 vs 3 (always use 3)", "Installing Python, pip, and virtual environments", "How teams use Python in industry"]],
        ["First Programs & REPL", ["print, input, and running .py files", "Indentation and Python syntax rules", "Comments and docstrings", "Using IDLE, terminal, and Jupyter", "Debugging syntax errors"], "Hello-world CLI that greets the user"],
        ["Code Style & Tooling", ["PEP 8 naming and formatting", "Linting with ruff/flake8 intro", "Type hints overview (optional)", "Project layout for small apps", "Reading tracebacks"]],
      ]),
      section("02", "Variables, Types & Operators", [
        ["Variables & Assignment", ["Dynamic typing", "Naming rules and conventions", "Multiple assignment", "Constants by convention", "id() and object identity intro"]],
        ["Numbers, Strings & Booleans", ["int, float, Decimal awareness", "String methods and slicing", "f-strings and formatting", "bool and comparison operators", "None type"]],
        ["Operators & Expressions", ["Arithmetic and assignment operators", "Logical operators", "Membership: in, not in", "Operator precedence", "Walrus operator := (awareness)"]],
        ["Type Conversion & Validation", ["int(), str(), float() conversion", "Handling invalid input safely", "isinstance() checks", "Truthy/falsy in Python", "Common conversion bugs"]],
      ]),
      section("03", "Control Flow", [
        ["Conditionals", ["if / elif / else", "Nested conditions", "Ternary expressions", "match/case (3.10+) intro", "Guard clauses"]],
        ["Loops", ["while loops", "for loops over sequences", "range() function", "break, continue, else on loops", "Avoiding infinite loops"]],
        ["Comprehensions & Iteration", ["List comprehensions", "Dict and set comprehensions", "enumerate and zip", "Iterators vs iterables", "When comprehensions hurt readability"]],
      ]),
      section("04", "Functions", [
        ["Defining Functions", ["def syntax and return", "Docstrings", "Function scope", "Pure functions intro", "Organizing code into modules"]],
        ["Parameters & Arguments", ["Positional and keyword args", "Default parameters", "*args and **kwargs", "Unpacking in calls", "Mutable default argument trap"]],
        ["Advanced Functions", ["Lambda expressions", "map, filter, reduce", "Closures and nested functions", "Recursion basics", "functools.partial intro"]],
      ]),
      section("05", "Data Structures", [
        ["Lists", ["Creating and indexing lists", "Slicing and copying", "List methods: append, extend, pop", "Sorting lists", "List as stack/queue"], "Analyze a list of student scores"],
        ["Tuples & Sets", ["Immutable tuples", "Named tuples intro", "Sets for uniqueness", "Set operations", "Choosing list vs tuple vs set"]],
        ["Dictionaries", ["Key-value pairs", "dict methods and get()", "Nested dictionaries", "defaultdict and Counter intro", "Hashability requirements"], "Word frequency counter"],
        ["Collections Module", ["deque for queues", "Counter for tallies", "defaultdict patterns", "OrderedDict (historical)", "Choosing the right structure"]],
      ]),
      section("06", "Object-Oriented Python", [
        ["Classes & Objects", ["class and __init__", "Instance vs class attributes", "self parameter", "Methods vs functions", "Modeling real entities"], "Bank account class"],
        ["Inheritance & Polymorphism", ["super() and method override", "isinstance and issubclass", "Composition vs inheritance", "Abstract base classes intro", "Designing class hierarchies"]],
        ["Special Methods & Dataclasses", ["__str__, __repr__", "__len__, __getitem__", "dataclasses module", "Properties with @property", "When OOP helps vs hurts"]],
        ["Encapsulation & Patterns", ["Private naming _ and __", "Properties for validation", "Factory functions", "Singleton awareness", "SOLID intro for Python"]],
      ]),
      section("07", "Files, Errors & Logging", [
        ["File I/O", ["open(), read, write", "Context managers with with", "Pathlib for paths", "CSV and JSON files", "Binary files awareness"]],
        ["Exception Handling", ["try / except / else / finally", "Raising exceptions", "Custom exception classes", "Exception hierarchy", "EAFP vs LBYL style"]],
        ["Logging & Debugging", ["logging module basics", "Log levels", "pdb debugger intro", "Assertions", "Production error handling"]],
      ]),
      section("08", "Modules, Packages & Ecosystem", [
        ["Imports & Modules", ["import styles", "Creating your own modules", "__name__ == '__main__'", "Package structure", "Relative imports"]],
        ["Virtual Envs & pip", ["venv and pip install", "requirements.txt", "pyproject.toml awareness", "pip freeze workflow", "Dependency conflicts"]],
        ["Standard Library Highlights", ["datetime and timedelta", "os, sys, pathlib", "json, csv, urllib", "random and math", "itertools and functools intro"]],
      ]),
      section("09", "Advanced Python", [
        ["Decorators", ["Functions as objects", "Writing decorators", "@wraps", "Decorator parameters", "Common decorator patterns"]],
        ["Generators & Iterators", ["yield keyword", "Generator expressions", "Lazy evaluation benefits", "itertools recipes", "Memory efficiency"]],
        ["Context Managers", ["with statement internals", "__enter__ and __exit__", "contextlib.contextmanager", "Managing resources", "Custom context managers"]],
      ]),
      section("10", "Data, Web & APIs", [
        ["Working with APIs", ["requests library", "JSON responses", "Headers and auth basics", "Error handling for HTTP", "Rate limits and retries"]],
        ["Data Analysis Intro", ["NumPy arrays overview", "Pandas DataFrame basics", "Reading CSV with pandas", "Simple plots with matplotlib", "When to use pandas vs pure Python"]],
        ["Web Frameworks Overview", ["Flask vs Django vs FastAPI", "HTTP request/response cycle", "REST API concepts", "Choosing a framework", "Python in microservices"]],
      ]),
      section("11", "Testing & Quality", [
        ["pytest Fundamentals", ["Writing test functions", "assert and fixtures intro", "Parametrized tests", "Mocking with unittest.mock", "Test coverage awareness"]],
        ["Code Quality", ["Black, ruff, mypy intro", "Writing testable code", "CI pipelines awareness", "Code reviews", "Documentation with Sphinx intro"]],
      ]),
      section("12", "Capstone & Career", [
        ["Capstone Planning", ["Choosing a project scope", "CLI vs web vs data project", "Requirements and milestones", "Git workflow", "README and demo"]],
        ["Build & Present", ["Implement core features", "Handle errors and edge cases", "Package for distribution intro", "Deploy script or Streamlit demo", "Present trade-offs made"]],
        ["Interview Prep", ["Common Python interview questions", "Big-O with Python collections", "Debugging live exercises", "Portfolio tips", "Contributing to open source"]],
        ["Professional Practices", ["Virtual envs in teams", "Secrets and .env", "Async intro with asyncio", "Performance profiling basics", "Continuing learning path"]],
        ["Capstone Project", ["Choose CLI, web, or data project", "Requirements and milestones", "Implement with tests", "README and demo video", "Present trade-offs"], "Grade manager, API client, or mini data dashboard"],
      ]),
    ],
  },

  java: {
    technology: "Java",
    idPrefix: "java",
    domainHint: "Java SE applications and backend services",
    sections: [
      section("01", "Java Platform & Setup", [
        ["Java Ecosystem & Careers", ["JVM, JRE, JDK explained", "Java in enterprise, Android, backend", "JDK vendors: Oracle, Temurin", "IDEs: IntelliJ, VS Code", "Career paths with Java"]],
        ["First Java Program", ["class and main method", "Compilation vs interpretation on JVM", "Packages and directory structure", "javac and java commands", "Reading compiler errors"], "Hello World and simple calculator CLI"],
        ["Maven/Gradle Intro", ["Build tools purpose", "pom.xml basics", "Dependencies and repositories", "Project structure standard", "Running tests from build tool"]],
      ]),
      section("02", "Language Fundamentals", [
        ["Variables & Primitive Types", ["byte, short, int, long, float, double", "char and boolean", "Variable declaration and scope", "Literals and constants", "Type promotion rules"]],
        ["Operators & Strings", ["Arithmetic and logical operators", "String immutability", "StringBuilder vs StringBuffer", "String methods", "Text blocks (Java 15+)"]],
        ["Control Flow", ["if-else and switch", "switch expressions", "for, while, do-while", "break and continue", "Enhanced for loop"]],
      ]),
      section("03", "Arrays & Collections", [
        ["Arrays", ["Declaring and initializing arrays", "Multi-dimensional arrays", "Arrays class utilities", "ArrayList vs arrays", "Common array algorithms"], "Sort and search an array of records"],
        ["ArrayList & LinkedList", ["List interface", "ArrayList internals", "LinkedList use cases", "Iterators", "List methods"]],
        ["Set & Map", ["HashSet, TreeSet", "HashMap, TreeMap", "equals and hashCode contract", "Map iteration patterns", "Choosing collection types"]],
        ["Generics", ["Generic classes and methods", "Type parameters", "Wildcards ? extends/super", "Type erasure awareness", "Generic collections best practices"]],
      ]),
      section("04", "OOP in Java", [
        ["Classes & Objects", ["Fields, methods, constructors", "this keyword", "static members", "Object class methods", "Modeling domain entities"], "Design a Student class"],
        ["Inheritance & Interfaces", ["extends keyword", "method overriding", "abstract classes", "interfaces and default methods", "Composition vs inheritance"]],
        ["Polymorphism & Casting", ["Upcasting and downcasting", "instanceof pattern matching", "Dynamic dispatch", "Designing for interfaces", "Liskov substitution intro"]],
        ["Encapsulation & Access", ["Access modifiers", "Getters and setters", "Immutable objects", "Records (Java 16+)", "Sealed classes intro"]],
      ]),
      section("05", "Exceptions & I/O", [
        ["Exception Handling", ["try-catch-finally", "Checked vs unchecked", "Custom exceptions", "try-with-resources", "Best practices"]],
        ["File I/O & NIO", ["File and Path (java.nio.file)", "Reading/writing text files", "Buffered streams", "Serialization awareness", "CSV processing"]],
        ["Logging", ["java.util.logging", "SLF4J and Logback intro", "Log levels", "Structured logging", "Debugging production issues"]],
      ]),
      section("06", "Advanced Java Features", [
        ["Lambdas & Streams", ["Functional interfaces", "Lambda syntax", "Method references", "Stream pipeline: map/filter/collect", "Optional class"]],
        ["Concurrency Basics", ["Threads and Runnable", "ExecutorService", "Synchronized blocks", "Concurrent collections intro", "Virtual threads awareness"]],
        ["Modern Java Features", ["var local inference", "Records and pattern matching", "Modules (JPMS) overview", "New API additions by version", "Migration strategies"]],
      ]),
      section("07", "JDBC & Database", [
        ["JDBC Fundamentals", ["Connection, Statement, ResultSet", "PreparedStatement and SQL injection", "Transactions", "Connection pooling intro", "CRUD operations"], "JDBC CRUD for a simple table"],
        ["JPA & Hibernate Intro", ["ORM concepts", "Entity mapping", "Repository pattern", "Relationships", "When to use JPA"]],
      ]),
      section("08", "Spring Ecosystem Intro", [
        ["Spring Core Concepts", ["IoC and DI", "@Component, @Autowired", "ApplicationContext", "Configuration classes", "Spring vs plain Java"]],
        ["Spring Boot Basics", ["Starters and auto-configuration", "application.properties", "REST controllers", "Spring Data JPA intro", "Running Spring Boot apps"]],
      ]),
      section("09", "Testing & Build", [
        ["JUnit 5", ["@Test, assertions", "BeforeEach/AfterEach", "Parameterized tests", "Mockito intro", "Integration tests"]],
        ["Build & CI", ["Maven lifecycle", "Packaging JARs", "CI with GitHub Actions", "Code coverage", "Static analysis tools"]],
      ]),
      section("10", "Design & Architecture", [
        ["SOLID Principles", ["Single responsibility", "Open-closed", "Liskov, Interface segregation, DI", "Applying SOLID in Java", "Code smells"]],
        ["Design Patterns", ["Singleton, Factory", "Strategy, Observer", "Repository pattern", "When patterns help"]],
      ]),
      section("11", "Capstone & Interview", [
        ["Capstone: Console or API App", ["Requirements and design", "Layered architecture", "Persistence with JDBC or JPA", "REST API with Spring Boot", "Documentation"]],
        ["Deployment & DevOps Intro", ["JAR deployment", "Docker for Java apps", "Health checks", "Environment profiles", "Monitoring basics"]],
        ["Java Interview Prep", ["Collections deep questions", "equals/hashCode", "Concurrency scenarios", "JVM memory model intro", "System design basics"]],
      ]),
    ],
  },

  html: {
    technology: "HTML",
    idPrefix: "html",
    domainHint: "semantic HTML5 and accessible web documents",
    sections: [
      section("01", "Web Foundations", [
        ["How the Web Works", ["Clients, servers, HTTP", "HTML role in the stack", "Browser rendering pipeline", "DevTools Elements tab", "Career paths: frontend, full-stack"]],
        ["Document Structure", ["<!DOCTYPE html>", "html, head, body", "meta charset and viewport", "title and favicon", "Valid document skeleton"], "Build your first valid HTML page"],
        ["Semantic HTML5", ["header, nav, main, footer", "article, section, aside", "Why semantics matter for SEO/a11y", "div vs semantic tags", "Landmark regions"]],
      ]),
      section("02", "Text & Content", [
        ["Headings & Paragraphs", ["h1-h6 hierarchy", "p, br, hr", "strong, em, mark", "blockquote and cite", "Readable content structure"]],
        ["Lists & Links", ["ul, ol, dl", "Nested lists", "a href, target, rel", "Internal vs external links", "Skip links and navigation"]],
        ["Images & Media", ["img src, alt text (critical)", "width, height, loading", "picture and source", "figure and figcaption", "SVG embed intro"]],
        ["Tables for Data", ["table, thead, tbody", "th scope and headers", "caption", "Accessible tables", "When NOT to use tables for layout"]],
      ]),
      section("03", "Forms & Input", [
        ["Form Basics", ["form action method", "input types overview", "label and for attribute", "button vs input submit", "Preventing default (awareness)"]],
        ["Input Types & Validation", ["text, email, number, date", "required, pattern, min/max", "textarea and select", "fieldset and legend", "HTML5 validation messages"], "Contact form with validation attributes"],
        ["Accessibility in Forms", ["Accessible names", "aria-describedby for errors", "Focus order", "Error announcements", "WCAG form checklist"]],
      ]),
      section("04", "Embedding & Media", [
        ["Audio & Video", ["video controls poster", "audio element", "track for captions", "Media accessibility", "Performance considerations"]],
        ["Iframes & Embed", ["iframe sandbox", "Embedding maps/videos", "Security implications", "oEmbed awareness", "CSP basics"]],
        ["Canvas & WebGL Intro", ["canvas element", "2D context basics", "When to use canvas vs SVG", "WebGL awareness", "Chart libraries intro"]],
      ]),
      section("05", "Metadata & SEO", [
        ["Meta Tags", ["description, keywords (limited)", "Open Graph tags", "Twitter cards", "canonical link", "robots meta"]],
        ["SEO-Friendly HTML", ["Heading structure", "Semantic URLs in links", "Structured data JSON-LD intro", "Core Web Vitals relation", "Lighthouse HTML audits"]],
        ["Internationalization", ["lang attribute", "hreflang links", "RTL dir attribute", "Character encoding", "Unicode content"]],
      ]),
      section("06", "Advanced HTML", [
        ["Custom Data Attributes", ["data-* attributes", "Reading with JS", "Microformats awareness", "RDFa intro", "Separation of concerns"]],
        ["Web Components Intro", ["template element", "slot attribute", "Shadow DOM awareness", "Custom elements", "When to use frameworks instead"]],
        ["Progressive Enhancement", ["Works without CSS/JS", "Graceful degradation", "Feature detection", "Baseline HTML first", "Real-world examples"]],
      ]),
      section("07", "Accessibility", [
        ["WCAG Principles", ["Perceivable, Operable, Understandable, Robust", "Keyboard navigation", "Focus indicators", "Color contrast", "Screen reader testing"]],
        ["ARIA Essentials", ["roles, states, properties", "aria-label vs labelledby", "Live regions", "Anti-patterns (div soup)", "Using ARIA only when needed"]],
        ["Inclusive Design", ["Alt text decision tree", "Motion preferences", "Form error UX", "Testing with axe", "Accessibility statement"]],
      ]),
      section("08", "Projects & Professional", [
        ["Portfolio Page Structure", ["Hero, projects, contact", "Semantic layout plan", "Asset organization", "Deploying static HTML", "GitHub Pages"]],
        ["Multi-Page Site", ["Consistent nav", "Relative paths", "Sitemap.html", "Breadcrumbs", "Footer patterns"], "3-page portfolio site"],
        ["HTML in the Real World", ["Templating engines awareness", "SSR vs static", "Component frameworks output", "Email HTML quirks", "Interview HTML questions"]],
        ["Capstone: Accessible Landing", ["Requirements and wireframe", "Semantic structure", "Form + media", "SEO meta", "Lighthouse a11y 90+"], "Full accessible landing page project"],
      ]),
    ],
  },

  css: {
    technology: "CSS",
    idPrefix: "css",
    domainHint: "modern CSS3 layout, responsive design, and maintainable styles",
    sections: [
      section("01", "CSS Foundations", [
        ["How CSS Works", ["Cascade, specificity, inheritance", "Selectors overview", "DevTools Styles panel", "External vs internal vs inline", "CSS career skills"]],
        ["Selectors Deep Dive", ["Element, class, ID", "Descendant and child combinators", "Attribute selectors", ":hover, :focus, :nth-child", "Specificity calculation"], "Style a profile card"],
        ["The Cascade & Specificity", ["Origin and importance", "!important pitfalls", "Layer (@layer) intro", "Inheritance control", "Debugging specificity wars"]],
      ]),
      section("02", "Typography & Color", [
        ["Fonts & Text", ["font-family stacks", "font-size, weight, line-height", "Google Fonts", "text-align, decoration", "Readable typography scale"]],
        ["Colors & Backgrounds", ["color formats: hex, rgb, hsl", "background-color, image", "gradients linear/radial", "opacity vs transparency", "Dark mode color tokens"]],
        ["Box Model", ["content, padding, border, margin", "box-sizing: border-box", "Margin collapse", "Outline vs border", "Sizing width/height"]],
      ]),
      section("03", "Layout Fundamentals", [
        ["Display & Positioning", ["block, inline, inline-block", "none and visibility", "static, relative, absolute", "fixed and sticky", "z-index stacking"]],
        ["Flexbox", ["flex container and items", "justify-content, align-items", "flex-direction, wrap", "flex-grow/shrink/basis", "Common flex patterns"], "Responsive navbar with flex"],
        ["CSS Grid", ["grid-template-columns/rows", "gap, fr units", "grid-area and placement", "Auto-fit/minmax responsive grids", "Flexbox vs Grid decision"]],
        ["Responsive Design", ["Mobile-first CSS", "Media queries", "clamp() and fluid type", "Container queries intro", "Breakpoints strategy"]],
      ]),
      section("04", "Visual Design", [
        ["Borders & Shadows", ["border-radius", "box-shadow layers", "filter: blur, brightness", "Clipping and masking intro", "Neumorphism awareness"]],
        ["Transitions & Animations", ["transition property", "transform: translate, scale", "@keyframes animations", "Animation performance", "prefers-reduced-motion"]],
        ["Modern Effects", ["backdrop-filter", "blend modes", "clip-path", "CSS variables (--token)", "Theming with custom properties"]],
      ]),
      section("05", "Components & Patterns", [
        ["Buttons & Cards", ["Button states and focus rings", "Card layout patterns", "Hover/focus accessibility", "Component tokens", "BEM naming intro"]],
        ["Navigation Patterns", ["Horizontal nav", "Hamburger menu CSS", "Dropdown basics", "Breadcrumbs styling", "Sticky header"]],
        ["Forms Styling", ["Input styling cross-browser", "Custom checkboxes intro", "Validation styles", "Focus-visible", "Accessible form design"]],
      ]),
      section("06", "Advanced CSS", [
        ["Pseudo Elements", ["::before, ::after", "Content property", "Decorative patterns", "Tooltips with CSS", "Counters"]],
        ["Functions & Units", ["calc(), min(), max()", "vh/vw/dvh units", "aspect-ratio", "env() for safe areas", "Logical properties"]],
        ["Architecture", ["BEM, ITCSS overview", "CSS Modules awareness", "Tailwind philosophy", "Design systems", "Avoiding global leaks"]],
      ]),
      section("07", "Preprocessors & Tooling", [
        ["Sass/SCSS Intro", ["Variables and nesting", "Mixins and extends", "Partials and imports", "When preprocessors still matter", "Compiling Sass"]],
        ["PostCSS & Autoprefixer", ["Vendor prefixes", "PostCSS plugins", "Build pipeline with Vite", "Source maps", "Production minification"]],
        ["Linting & Formatting", ["stylelint rules", "Prettier for CSS", "Style guides", "CI checks", "Team conventions"]],
      ]),
      section("08", "Projects & Capstone", [
        ["Clone a Landing Page", ["Analyze reference design", "HTML structure first", "Mobile layout", "Desktop enhancements", "Polish and QA"]],
        ["Design System Mini", ["Color and type scale", "Spacing system", "Reusable utility classes", "Component library CSS", "Documentation"]],
        ["CSS Interview Topics", ["Specificity scenarios", "Centering techniques", "Flex vs Grid", "Performance (repaints)", "Common gotchas"]],
        ["Capstone: Responsive Dashboard", ["Sidebar + main grid", "Charts area placeholder", "Dark/light theme toggle", "Accessible focus states", "Deploy static site"], "Build responsive dashboard UI"],
      ]),
    ],
  },

  react: {
    technology: "React",
    idPrefix: "react",
    domainHint: "React 18+ components, hooks, and modern frontend apps",
    sections: [
      section("01", "React Foundations", [
        ["React Landscape & Setup", ["What React is (library vs framework)", "SPA vs MPA", "Create React App vs Vite", "React DevTools", "Career paths: React, Next.js"]],
        ["JSX & First Components", ["JSX syntax rules", "Functional components", "className and expressions", "Fragments", "Component file structure"], "Render a profile card component"],
        ["Props & Composition", ["Passing props", "Props destructuring", "children prop", "PropTypes or TypeScript intro", "Component composition patterns"]],
      ]),
      section("02", "State & Events", [
        ["useState Hook", ["State in functional components", "Updating state correctly", "Object/array state immutability", "Lifting state up", "Controlled inputs"]],
        ["Events & Forms", ["Synthetic events", "onClick, onChange handlers", "Controlled vs uncontrolled", "Form submit handling", "Preventing default"]],
        ["Lists & Keys", ["Rendering lists with map", "key prop importance", "Filtering and sorting UI", "Empty states", "List performance basics"]],
      ]),
      section("03", "Hooks Deep Dive", [
        ["useEffect", ["Side effects in React", "Dependency array rules", "Cleanup functions", "Fetching data on mount", "Common useEffect bugs"]],
        ["useRef & useMemo", ["DOM refs with useRef", "Persisting values without re-render", "useMemo for expensive calc", "useCallback for stable refs", "When optimization matters"]],
        ["Custom Hooks", ["Extracting reusable logic", "Naming conventions", "Sharing stateful logic", "Testing custom hooks", "Hook composition patterns"]],
      ]),
      section("04", "Routing & Data", [
        ["React Router", ["BrowserRouter setup", "Routes, Route, Link", "URL parameters", "Nested routes", "Protected routes pattern"]],
        ["Data Fetching Patterns", ["fetch in useEffect", "Loading and error UI", "AbortController cleanup", "React Query intro", "Server state vs client state"]],
        ["Context API", ["createContext and Provider", "useContext", "When context helps", "Context performance pitfalls", "vs Redux/Zustand"]],
      ]),
      section("05", "Styling React", [
        ["CSS Modules", ["Scoped class names", "Composing styles", "Global vs local", "Vite CSS modules", "BEM alternative"]],
        ["CSS-in-JS & Tailwind", ["Styled-components awareness", "Tailwind with React", "Conditional classes", "Design tokens", "Dark mode in React"]],
        ["UI Libraries", ["Material UI / Chakra overview", "Component libraries trade-offs", "Theming", "Accessibility in UI kits", "Customizing components"]],
      ]),
      section("06", "Advanced React", [
        ["Performance", ["React.memo", "useMemo/useCallback review", "Code splitting lazy()", "Profiler API intro", "Virtual DOM intuition"]],
        ["Error Boundaries", ["componentDidCatch pattern", "Error boundary components", "Fallback UI", "Logging errors", "Resilient UIs"]],
        ["Portals & Refs", ["createPortal for modals", "forwardRef", "Imperative handle intro", "Focus trap in modals", "Accessibility for overlays"]],
      ]),
      section("07", "State Management", [
        ["Redux Toolkit Intro", ["Store, slice, reducer", "useSelector, useDispatch", "Async thunks", "DevTools", "When Redux is worth it"]],
        ["Zustand / Jotai Alternatives", ["Lightweight stores", "Comparing solutions", "Local vs global state", "Server cache layers", "Choosing state tools"]],
        ["Forms at Scale", ["React Hook Form", "Validation with zod/yup", "Field arrays", "Multi-step forms", "Submit and error UX"]],
      ]),
      section("08", "Testing React", [
        ["React Testing Library", ["render, screen queries", "userEvent interactions", "Testing async UI", "Mocking modules", "Accessibility-first tests"]],
        ["Vitest & Jest", ["Unit vs integration tests", "Snapshot testing cautions", "MSW for API mocks", "CI test runs", "Coverage goals"]],
      ]),
      section("09", "Next.js & Ecosystem", [
        ["Next.js Overview", ["File-based routing", "SSR vs SSG vs CSR", "API routes", "Image optimization", "When to adopt Next"]],
        ["Deployment", ["Vercel deploy", "Environment variables", "Build optimization", "Analytics", "Production checklist"]],
      ]),
      section("10", "Capstone & Career", [
        ["Project Architecture", ["Folder structure", "Feature-based modules", "API layer separation", "Env config", "README and demo"]],
        ["Capstone: Full SPA", ["Auth flow UI", "Dashboard with routing", "Data from API", "Responsive design", "Tests for critical paths"], "Build task manager or e-commerce UI SPA"],
        ["Interview Prep", ["React reconciliation", "Hooks rules", "State design questions", "Performance scenarios", "Take-home project tips"]],
      ]),
    ],
  },

  nodejs: {
    technology: "Node.js",
    idPrefix: "nodejs",
    domainHint: "Node.js server-side JavaScript and backend APIs",
    sections: [
      section("01", "Node Foundations", [
        ["Node.js Ecosystem", ["V8, libuv, event loop", "Node vs browser JS", "npm registry", "LTS versions", "Backend career paths"]],
        ["First Server", ["node command", "package.json scripts", "CommonJS vs ESM", "Reading files with fs", "Environment variables"], "CLI script that reads a JSON file"],
        ["Modules & npm", ["require/import", "Publishing packages intro", "semver", "package-lock.json", "npm scripts workflow"]],
      ]),
      section("02", "Core APIs", [
        ["File System & Path", ["fs promises API", "path.join, resolve", "Watching files", "Streams intro", "Working with directories"]],
        ["HTTP Module", ["createServer basics", "req, res objects", "Routing manually", "Status codes", "Why frameworks exist"]],
        ["Events & Streams", ["EventEmitter pattern", "Readable/writable streams", "Pipe and backpressure", "Buffer basics", "Practical stream use cases"]],
      ]),
      section("03", "Express.js", [
        ["Express Setup", ["Installing express", "app, listen", "Middleware chain", "req.params, query, body", "JSON body parser"], "REST API for todos"],
        ["Routing & Middleware", ["Router modularization", "Custom middleware", "Error-handling middleware", "Static files", "CORS middleware"]],
        ["Validation & Security", ["express-validator", "Helmet headers", "Rate limiting intro", "Input sanitization", "Secrets in .env"]],
      ]),
      section("04", "Databases", [
        ["MongoDB with Mongoose", ["Schemas and models", "CRUD operations", "Population", "Indexes intro", "Validation in schema"]],
        ["SQL with pg/Prisma intro", ["SQL vs NoSQL trade-offs", "Prisma schema", "Migrations awareness", "Relations", "Choosing database"]],
        ["Authentication", ["JWT tokens", "bcrypt password hashing", "Auth middleware", "Refresh tokens intro", "Session vs stateless"]],
      ]),
      section("05", "Advanced Node", [
        ["Async Patterns", ["Callbacks to promises", "async/await in routes", "Parallel vs sequential", "Error propagation", "Unhandled rejections"]],
        ["Testing APIs", ["Supertest with Jest", "Mocking DB", "Integration tests", "Test databases", "CI pipeline"]],
        ["Logging & Monitoring", ["Winston/pino", "Request logging", "Health check endpoints", "PM2 intro", "12-factor app"]],
      ]),
      section("06", "Architecture", [
        ["Project Structure", ["MVC / layered architecture", "Service layer", "Config per environment", "Dependency injection intro", "API versioning"]],
        ["WebSockets & Real-time", ["socket.io basics", "Rooms and events", "Scaling websockets", "Use cases", "Fallback polling"]],
        ["File Uploads & Jobs", ["multer for uploads", "Cloud storage intro", "Background jobs with Bull", "Cron jobs", "Email with nodemailer"]],
      ]),
      section("07", "Deployment", [
        ["Docker for Node", ["Dockerfile basics", "docker-compose", "Multi-stage builds", "Env in containers", "Local prod parity"]],
        ["Cloud Deploy", ["Render/Railway/Fly intro", "CI/CD GitHub Actions", "HTTPS and domains", "Scaling awareness", "Secrets management"]],
      ]),
      section("08", "Capstone", [
        ["Capstone API", ["Design REST resources", "Auth + CRUD", "Tests and docs", "Deploy live API", "Postman collection"], "Production-ready REST API with auth"],
        ["GraphQL Intro", ["Schema and resolvers", "vs REST trade-offs", "Apollo Server awareness", "When GraphQL fits", "Learning path"]],
        ["Interview Prep", ["Event loop questions", "Express middleware order", "Security checklist", "System design for APIs", "Debugging production Node"]],
      ]),
    ],
  },

  django: {
    technology: "Django",
    idPrefix: "dj",
    domainHint: "Django 4+ web framework and Django REST patterns",
    sections: [
      section("01", "Django Foundations", [
        ["Django Landscape", ["Batteries-included philosophy", "MVT pattern", "Django vs Flask/FastAPI", "Python prerequisite", "Career paths"]],
        ["Project Setup", ["django-admin startproject", "Settings.py overview", "runserver", "Apps concept", "Virtual environment"], "Create first Django project"],
        ["URLs & Views", ["urlpatterns", "Function-based views", "HttpRequest, HttpResponse", "Path converters", "Reverse URLs"]],
      ]),
      section("02", "Templates & Models", [
        ["Templates", ["Django template language", "Template inheritance", "Static files", "Context variables", "Filters and tags"]],
        ["Models & ORM", ["Model fields", "Migrations makemigrations migrate", "Admin site", "QuerySet basics", "CRUD in shell"], "Blog models with admin"],
        ["Database Queries", ["filter, exclude, get", "Ordering and slicing", "ForeignKey relations", "select_related intro", "Aggregation Count, Avg"]],
      ]),
      section("03", "Forms & Auth", [
        ["Django Forms", ["ModelForm", "Form validation", "Rendering forms in templates", "CSRF protection", "Form errors UX"]],
        ["User Authentication", ["User model", "Login, logout views", "LoginRequiredMixin", "Permissions", "Custom user model intro"]],
        ["Sessions & Messages", ["Session framework", "Messages framework", "Flash messages", "Cookie settings", "Security settings"]],
      ]),
      section("04", "Class-Based Views", [
        ["CBV Fundamentals", ["ListView, DetailView", "CreateView, UpdateView", "DeleteView", "Mixins", "Generic views workflow"]],
        ["Templates & Static Advanced", ["Custom template tags", "Media files", "collectstatic", "Whitenoise intro", "Front-end integration"]],
        ["Testing Django", ["TestCase and Client", "Factory fixtures intro", "Testing views and models", "Coverage", "CI for Django"]],
      ]),
      section("05", "REST APIs", [
        ["Django REST Framework", ["Serializers", "APIView and ViewSets", "Routers", "Browsable API", "Permissions classes"], "REST API for blog posts"],
        ["Authentication API", ["Token auth", "JWT with simplejwt intro", "Throttling", "Pagination", "API versioning"]],
        ["Filtering & Docs", ["django-filter", "Search and ordering", "OpenAPI/Swagger", "API testing with Postman", "Error response format"]],
      ]),
      section("06", "Advanced Django", [
        ["Signals & Middleware", ["post_save signals", "Custom middleware", "Request/response cycle", "Caching intro", "Celery tasks overview"]],
        ["Performance", ["Query optimization", "N+1 problem", "Database indexes", "Caching with Redis", "Profiling queries"]],
        ["Security", ["CSRF, XSS, SQL injection prevention", "SECURE_* settings", "Password validators", "Deployment security", "OWASP for Django"]],
      ]),
      section("07", "Deployment", [
        ["Production Settings", ["DEBUG=False", "ALLOWED_HOSTS", "Static/media on S3", "PostgreSQL", "Environment variables"]],
        ["Deploy Django", ["Gunicorn + Nginx", "Docker deploy", "Heroku/Render intro", "Migrations in prod", "Logging and monitoring"]],
      ]),
      section("08", "Capstone", [
        ["Capstone Web App", ["Requirements", "Models and admin", "Auth and permissions", "DRF API optional", "Deployed demo"], "Full CRUD web app with auth"],
        ["Channels & Async Intro", ["WebSockets in Django", "ASGI", "When async views help", "Django 5 features", "Learning roadmap"]],
        ["Interview Prep", ["ORM query questions", "MVT explanation", "Middleware order", "Migration conflicts", "System design with Django"]],
      ]),
    ],
  },

  springboot: {
    technology: "Spring Boot",
    idPrefix: "sb",
    domainHint: "Spring Boot 3 microservices and enterprise Java APIs",
    sections: [
      section("01", "Spring Boot Foundations", [
        ["Spring Ecosystem", ["Spring vs Spring Boot", "Auto-configuration", "Starter dependencies", "Spring Initializr", "Enterprise Java careers"]],
        ["First Application", ["@SpringBootApplication", "Embedded Tomcat", "application.properties", "Running JAR", "Actuator health intro"], "Hello REST endpoint"],
        ["Dependency Injection", ["@Component, @Service, @Repository", "@Autowired", "Constructor injection", "ApplicationContext", "Bean scopes"]],
      ]),
      section("02", "REST APIs", [
        ["REST Controllers", ["@RestController", "@GetMapping, PostMapping", "RequestBody and ResponseEntity", "PathVariable, RequestParam", "HTTP status codes"]],
        ["Validation & DTOs", ["@Valid and Bean Validation", "DTO pattern", "Exception handling @ControllerAdvice", "Error response format", "API documentation with Springdoc"], "CRUD REST API for Product"],
        ["Testing Controllers", ["@WebMvcTest", "MockMvc", "Integration tests @SpringBootTest", "Testcontainers intro", "Test profiles"]],
      ]),
      section("03", "Data Access", [
        ["Spring Data JPA", ["Entity and @Id", "JpaRepository", "Query methods", "Relationships @OneToMany", "Transactions @Transactional"]],
        ["Database Configuration", ["H2 dev vs PostgreSQL prod", "Flyway/Liquibase migrations", "Connection pooling", "Lazy loading pitfalls", "N+1 solutions"]],
        ["Advanced JPA", ["JPQL and @Query", "Specifications", "Pagination Pageable", "Auditing", "Projections"]],
      ]),
      section("04", "Security", [
        ["Spring Security Basics", ["SecurityFilterChain", "In-memory auth demo", "PasswordEncoder BCrypt", "Form login vs API", "CSRF for APIs"]],
        ["JWT Authentication", ["Stateless APIs", "JWT generation and validation", "Filter chain for JWT", "Role-based access @PreAuthorize", "Refresh token pattern"]],
        ["OAuth2 Overview", ["OAuth2 flows", "Spring Authorization Server awareness", "Social login", "Resource server", "Enterprise SSO intro"]],
      ]),
      section("05", "Microservices", [
        ["Configuration", ["application.yml profiles", "Externalized config", "@ConfigurationProperties", "Secrets management", "12-factor config"]],
        ["OpenFeign & REST Client", ["Service-to-service calls", "Resilience4j circuit breaker", "Timeouts and retries", "Service discovery intro", "API gateway awareness"]],
        ["Messaging", ["Spring Kafka/Rabbit intro", "Event-driven design", "Idempotent consumers", "Saga pattern awareness", "When messaging fits"]],
      ]),
      section("06", "Observability & Ops", [
        ["Actuator & Metrics", ["Health, info endpoints", "Micrometer metrics", "Prometheus/Grafana intro", "Distributed tracing", "Structured logging"]],
        ["Docker & Kubernetes Intro", ["Dockerfile for Spring Boot", "K8s deployment overview", "Liveness/readiness probes", "ConfigMaps", "Cloud-native patterns"]],
      ]),
      section("07", "Capstone", [
        ["Capstone Microservice", ["Domain design", "JPA entities", "Secured REST API", "Tests and docs", "Docker deploy"], "E-commerce or library API service"],
        ["Interview Prep", ["Bean lifecycle", "Transaction propagation", "Security filter order", "JPA vs JDBC", "System design Java"]],
      ]),
    ],
  },

  typescript: {
    technology: "TypeScript",
    idPrefix: "ts",
    domainHint: "TypeScript for typed JavaScript applications",
    sections: [
      section("01", "TypeScript Foundations", [
        ["Why TypeScript", ["JS pain points TypeScript solves", "Compile vs transpile", "tsc and tsconfig.json", "IDE benefits", "Industry adoption"]],
        ["Basic Types", ["string, number, boolean", "arrays and tuples", "any, unknown, never", "type annotations", "type inference"], "Type a small utility library"],
        ["Functions & Objects", ["Typed parameters and returns", "Optional and default params", "Object type aliases", "Index signatures", "Readonly modifier"]],
      ]),
      section("02", "Core Type System", [
        ["Unions & Intersections", ["Union types |", "Intersection types &", "Narrowing with typeof", "Discriminated unions", "Exhaustiveness checking"]],
        ["Interfaces vs Types", ["interface keyword", "type aliases", "Extending interfaces", "Declaration merging", "When to use which"]],
        ["Generics", ["Generic functions", "Generic interfaces", "Constraints extends", "Default type parameters", "Generic utility patterns"]],
      ]),
      section("03", "Advanced Types", [
        ["Utility Types", ["Partial, Required, Pick, Omit", "Record and ReturnType", "Parameters type", "Awaited", "Building custom utilities"]],
        ["Mapped & Conditional Types", ["keyof operator", "Mapped types", "Conditional types ? :", "infer keyword", "Template literal types"]],
        ["Type Guards", ["typeof and instanceof guards", "User-defined type predicates", "Assertion functions", "in operator narrowing", "Safe parsing patterns"]],
      ]),
      section("04", "Classes & OOP", [
        ["Classes in TS", ["public private protected", "implements interface", "Abstract classes", "Getters/setters", "Class generics"]],
        ["Modules", ["ES modules import/export", "Namespace awareness", "Path aliases", "Declaration files .d.ts", "DefinitelyTyped @types"]],
        ["Enums & Literals", ["String literal unions", "const enums", "as const assertions", "satisfies operator", "Branded types intro"]],
      ]),
      section("05", "TS with React", [
        ["Typing Components", ["FC vs explicit props types", "Children typing", "Event types", "useState generics", "useRef types"]],
        ["Hooks & Context", ["Custom hook types", "Context with generics", "Reducer typing", "Form libraries with TS", "Common React+TS errors"]],
        ["Third-Party Types", ["Installing @types packages", "Module augmentation", "Typing API responses", "zod for runtime validation", "End-to-end type safety"]],
      ]),
      section("06", "TS with Node", [
        ["Node + TypeScript Setup", ["ts-node vs compiled", "ESM in Node", "tsconfig for backend", "nodemon workflow", "Debugging TS Node"]],
        ["Express Typing", ["Request/Response generics", "Typed middleware", "Router types", "Error handler typing", "Shared types package"]],
        ["Prisma & tRPC Intro", ["Prisma client types", "tRPC end-to-end types", "Compared to REST", "Monorepo types", "Production builds"]],
      ]),
      section("07", "Tooling & Quality", [
        ["Strict Mode", ["strict flag family", "noImplicitAny", "strictNullChecks", "Migrating JS to TS", "Incremental adoption"]],
        ["ESLint & Prettier", ["typescript-eslint", "Type-aware lint rules", "Prettier integration", "CI typecheck", "Pre-commit hooks"]],
      ]),
      section("08", "Capstone", [
        ["Capstone Typed App", ["Shared types package", "React or Node app", "Zod validation layer", "Tests with types", "Build pipeline"], "Full-stack typed mini app"],
        ["Interview Prep", ["Variance awareness", "any vs unknown", "Generic constraints", "TS compiler errors reading", "Designing API types"]],
      ]),
    ],
  },

  mongodb: {
    technology: "MongoDB",
    idPrefix: "mongo",
    domainHint: "MongoDB document database design and operations",
    sections: [
      section("01", "MongoDB Foundations", [
        ["NoSQL & MongoDB Landscape", ["Document model vs relational", "When to choose MongoDB", "Atlas vs self-hosted", "Roles: DBA, backend dev", "CAP theorem intro"]],
        ["Installation & mongosh", ["Atlas cluster setup", "mongosh shell", "databases and collections", "insert, find basics", "BSON types overview"], "Insert and query sample documents"],
        ["CRUD Operations", ["insertOne/Many", "find with filters", "update operators $set, $inc", "delete operations", "upsert behavior"]],
      ]),
      section("02", "Querying Data", [
        ["Query Operators", ["Comparison: $gt, $in", "Logical: $and, $or", "Element: $exists", "Array operators", "Regex queries"]],
        ["Projection & Sorting", ["Projection inclusion/exclusion", "sort, limit, skip", "Covered queries intro", "Cursor batching", "Explain plans"]],
        ["Aggregation Pipeline", ["$match, $group, $project", "$lookup join", "$unwind", "$sort, $limit", "Pipeline optimization"], "Analytics aggregation report"],
      ]),
      section("03", "Data Modeling", [
        ["Schema Design Patterns", ["Embedding vs referencing", "One-to-many patterns", "Many-to-many", "Bucket pattern intro", "Anti-patterns"]],
        ["Validation & Schema", ["JSON Schema validation", "Required fields", "Enum validation", "Migration strategies", "Flexible schema trade-offs"]],
        ["Indexes", ["single and compound indexes", "Multikey indexes", "Text indexes", "Index selectivity", "explain() for indexes"]],
      ]),
      section("04", "Performance & Admin", [
        ["Performance Tuning", ["Working set", "Write concern, read preference", "Connection pooling", "Profiling slow queries", "Sharding intro"]],
        ["Replication", ["Replica set architecture", "Primary/secondary elections", "Read preferences", "Failover", "Backup strategies"]],
        ["Sharding", ["Shard key selection", "Chunks and balancer", "When to shard", "Global clusters awareness", "Atlas sharding"]],
      ]),
      section("05", "Drivers & Apps", [
        ["Node.js Driver", ["MongoClient connection", "CRUD with driver", "Sessions and transactions", "Change streams intro", "Error handling"]],
        ["Mongoose ODM", ["Schemas and models", "Middleware hooks", "Virtuals and methods", "Population", "Validation in Mongoose"], "Express API with Mongoose"],
        ["Python PyMongo", ["Connection strings", "CRUD in Python", "Aggregation in PyMongo", "pandas integration intro", "Choosing driver"]],
      ]),
      section("06", "Security & Ops", [
        ["Authentication & RBAC", ["Users and roles", "Least privilege", "Network security IP whitelist", "TLS connections", "Auditing"]],
        ["Atlas Operations", ["Backups and restores", "Monitoring alerts", "Performance advisor", "Data explorer", "Triggers/functions intro"]],
      ]),
      section("07", "Capstone", [
        ["Capstone Database Design", ["Domain modeling exercise", "Indexes for queries", "Aggregation reports", "API integration", "Documentation"], "Design DB for e-commerce or LMS"],
        ["Interview Prep", ["Embedding vs reference", "Index strategies", "Aggregation interview tasks", "Consistency models", "Comparison with SQL"]],
      ]),
    ],
  },
};

/** Extra sections to bring each stack to ~30–35 modules */
const EXTRA_SECTIONS = {
  html: [
    section("09", "Advanced HTML", [
      ["Microdata & SEO Advanced", ["Schema.org types", "Rich results", "Breadcrumb markup", "FAQ schema", "Testing with Google tools"]],
      ["Performance Markup", ["preload, prefetch, preconnect", "defer/async scripts", "lazy loading images", "Critical resource hints", "LCP and HTML"]],
      ["Email & Legacy HTML", ["Table-based layouts for email", "Inline CSS limits", "Outlook quirks", "MJML awareness", "HTML validators"]],
    ]),
    section("10", "Professional HTML", [
      ["Component Libraries Output", ["How React/Vue emit HTML", "Hydration awareness", "SSR HTML differences", "View source debugging", "Semantic component mapping"]],
      ["Maintenance & Refactors", ["Migrating legacy pages", "Accessibility retrofits", "HTML linting tools", "Team style guides", "Interview scenarios"]],
    ]),
  ],
  css: [
    section("09", "Advanced Layout & Motion", [
      ["Subgrid & Advanced Grid", ["subgrid", "Named lines", "Overlapping grid items", "Masonry intro", "Complex layouts"]],
      ["Motion & Accessibility", ["prefers-reduced-motion", "Animation performance", "Focus-visible styles", "Skip animations", "Inclusive motion design"]],
    ]),
    section("10", "Professional CSS", [
      ["Cross-Browser QA", ["@supports", "Progressive enhancement", "Testing matrix", "Bug workarounds", "Can I Use workflow"]],
      ["CSS at Scale", ["Refactoring strategies", "Token pipelines", "Documentation", "Code review checklist", "Senior interview topics"]],
    ]),
  ],
  react: [
    section("11", "Production React", [
      ["State Machines Intro", ["useReducer patterns", "XState awareness", "Complex UI flows", "Side effect isolation", "Testing state machines"]],
      ["Accessibility in React", ["ARIA in components", "Focus management", "Live regions", "eslint-plugin-jsx-a11y", "Screen reader testing"]],
    ]),
    section("12", "Career & Capstone Plus", [
      ["Monorepos & Tooling", ["Turborepo/nx awareness", "Shared packages", "Storybook for components", "Chromatic visual tests", "Release workflow"]],
      ["Open Source & Interviews", ["Reading React source", "RFC awareness", "Contributing guide", "Live coding tips", "System design for frontends"]],
    ]),
  ],
  nodejs: [
    section("09", "Production Node", [
      ["Caching Strategies", ["In-memory cache", "Redis with ioredis", "HTTP cache headers", "Cache invalidation", "CDN edge caching"]],
      ["API Design", ["REST conventions", "Versioning", "Pagination patterns", "HATEOAS intro", "OpenAPI spec"]],
    ]),
    section("10", "Microservices & Scale", [
      ["Message Queues", ["BullMQ jobs", "Retry and DLQ", "Idempotency keys", "Outbox pattern intro", "Event-driven APIs"]],
      ["Observability", ["OpenTelemetry intro", "Correlation IDs", "Metrics and alerts", "Load testing k6", "Capacity planning"]],
    ]),
    section("11", "Career", [
      ["Node in Enterprise", ["Monolith vs microservices", "TypeScript adoption", "Legacy migration", "On-call practices", "Interview system design"]],
    ]),
    section("12", "Node Plus", [
      ["Serverless Node", ["AWS Lambda handler", "Cold starts", "Serverless framework intro", "Edge functions", "When serverless fits"]],
      ["GraphQL Server", ["Apollo Server setup", "Resolvers", "DataLoader N+1 fix", "vs REST", "Schema-first design"]],
    ]),
  ],
  django: [
    section("09", "Production Django", [
      ["Caching Framework", ["Per-view cache", "Template fragment cache", "Redis cache backend", "Cache invalidation", "Performance wins"]],
      ["Custom Management Commands", ["management/commands", "Cron with django-crontab", "Data migrations scripts", "Seeding databases", "Ops automation"]],
    ]),
    section("10", "Scaling & Teams", [
      ["Multi-tenant Patterns", ["Schema per tenant awareness", "Shared database isolation", "Subdomain routing", "Security implications", "SaaS architecture"]],
      ["Django in Teams", ["Code review standards", "Settings split", "Feature flags", "Release process", "Interview scenarios"]],
    ]),
    section("11", "Advanced Topics", [
      ["GeoDjango Intro", ["PostGIS awareness", "Location queries", "Maps integration", "Use cases", "Learning resources"]],
      ["GraphQL with Django", ["Strawberry/Graphene intro", "vs DRF", "N+1 in GraphQL", "When to adopt", "Schema design"]],
    ]),
    section("12", "Django Plus", [
      ["Content Security", ["CSP headers", "XSS in templates", "Safe string marking", "File upload security", "Pen test checklist"]],
    ]),
  ],
  springboot: [
    section("08", "Integration & Messaging", [
      ["Spring Integration", ["@Scheduled tasks", "Email with JavaMailSender", "File processing batches", "Retry with Spring Retry", "Idempotent consumers"]],
      ["Caching", ["@Cacheable", "Redis cache manager", "Cache eviction", "Performance testing", "Cache pitfalls"]],
    ]),
    section("09", "Cloud Native", [
      ["Spring Cloud Config", ["Centralized configuration", "Refresh scope", "Secrets in cloud", "Profiles per env", "Git-backed config"]],
      ["Resilience Patterns", ["Circuit breaker deep dive", "Bulkhead", "Rate limiter", "Timeout configuration", "Chaos testing intro"]],
    ]),
    section("10", "Testing & Quality", [
      ["Contract Testing", ["Consumer-driven contracts", "Spring Cloud Contract intro", "API compatibility", "CI pipelines", "Versioning services"]],
      ["Performance Testing", ["JMeter/Gatling intro", "Load test Spring Boot", "Connection pool tuning", "GC awareness", "Profiling tools"]],
    ]),
    section("11", "Career", [
      ["Enterprise Patterns", ["DDD bounded contexts", "Hexagonal architecture", "Event sourcing intro", "CQRS awareness", "Interview architecture questions"]],
    ]),
    section("12", "Spring Plus", [
      ["Batch Processing", ["Spring Batch jobs", "Chunk-oriented processing", "Scheduling", "Error skip policies", "Large file imports"]],
      ["GraphQL Java", ["Spring GraphQL", "Schema mapping", "Data fetchers", "vs REST controllers", "When GraphQL in Java"]],
      ["Kotlin Interop", ["Kotlin with Spring", "Data classes", "Coroutines awareness", "Mixed projects", "Team adoption"]],
      ["Native Images & GraalVM", ["AOT compilation intro", "Startup time benefits", "Reflection config", "Trade-offs vs JVM", "When teams adopt native"]],
    ]),
  ],
  typescript: [
    section("09", "Advanced TypeScript", [
      ["Template Literal Types", ["String manipulation types", "Route typing", "SQL query builders", "Event name typing", "Practical patterns"]],
      ["Module Augmentation", ["Extending third-party types", "Global augmentation risks", "Declaration merging", "Ambient modules", "Publishing types"]],
    ]),
    section("10", "Tooling & Monorepos", [
      ["Project References", ["Composite projects", "Incremental builds", "Monorepo with pnpm workspaces", "Shared tsconfig", "CI typecheck"]],
      ["API Codegen", ["OpenAPI to types", "GraphQL codegen", "tRPC routers", "Keeping types in sync", "Breaking change detection"]],
    ]),
    section("11", "Career", [
      ["Migrating Large Codebases", ["allowJs strategy", "JSDoc migration", "Team rollout plan", "Measuring progress", "Interview type challenges"]],
    ]),
    section("12", "TypeScript Plus", [
      ["Decorators Stage 3", ["Class decorators", "Method decorators", "Metadata reflection", "NestJS connection", "Experimental flags"]],
      ["Performance & Build", ["Project references build order", "Incremental watch", "SWC/esbuild", "Bundle size types", "Tree shaking TS"]],
      ["Domain Modeling Types", ["Branded IDs", "Discriminated unions for state", "Parse don't validate", "zod infer types", "API boundary types"]],
    ]),
  ],
  mongodb: [
    section("08", "Atlas & Search", [
      ["Atlas Search", ["Search indexes", "Autocomplete", "Facets", "Relevance tuning", "Comparison with Elasticsearch"]],
      ["Atlas Data Federation", ["Query across S3", "Analytics nodes", "Data lake use cases", "Cost awareness", "When to use"]],
    ]),
    section("09", "Transactions & Consistency", [
      ["Multi-Document ACID", ["Sessions API", "Transaction limits", "Retry logic", "Write concern levels", "Design for consistency"]],
      ["Change Streams & Events", ["Watching collections", "Resume tokens", "Event-driven architectures", "Outbox with Mongo", "Integration patterns"]],
    ]),
    section("10", "Migration & Ops", [
      ["SQL to Mongo Migration", ["Schema mapping", "ETL tools", "Dual-write period", "Validation", "Rollback planning"]],
      ["Backup & Disaster Recovery", ["Point-in-time recovery", "Cross-region backups", "Restore drills", "RPO/RTO", "Compliance"]],
    ]),
    section("11", "Career", [
      ["MongoDB Certifications", ["Associate DBA path", "Study resources", "Hands-on labs", "Production war stories", "Interview whiteboard tasks"]],
    ]),
    section("12", "MongoDB Plus", [
      ["Time Series Collections", ["timeField and metaField", "Retention policies", "IoT metrics use case", "Query patterns", "vs regular collections"]],
      ["Atlas Triggers & Functions", ["Database triggers", "Serverless functions", "Event bridges", "Limits and costs", "Integration examples"]],
      ["Compass & Data Tools", ["Schema analysis", "Index suggestions", "Aggregation builder", "Import/export", "Team collaboration"]],
      ["Polyglot Persistence", ["MongoDB with PostgreSQL", "CQRS read models", "Sync strategies", "Choosing document vs relational", "Hybrid architectures"]],
    ]),
  ],
};

for (const [key, extra] of Object.entries(EXTRA_SECTIONS)) {
  if (SPECS[key]) SPECS[key].sections.push(...extra);
}

const outDir = path.join(__dirname, "syllabi");
for (const [key, spec] of Object.entries(SPECS)) {
  const content = `/** Auto-generated syllabus spec for ${spec.technology} */\nmodule.exports = ${JSON.stringify(spec, null, 2)};\n`;
  fs.writeFileSync(path.join(outDir, `${key}.js`), content, "utf8");
  console.log(`Wrote syllabi/${key}.js`);
}
