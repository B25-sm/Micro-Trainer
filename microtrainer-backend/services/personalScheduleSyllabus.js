/**
 * Track categories and interview-prep syllabi for Personal Schedule.
 * Each concept has estimated study minutes used when building day plans.
 */

const CATEGORIES = {
  fullstack: {
    id: "fullstack",
    label: "Full Stack Developer",
    description: "MERN / Java / Python full stack interview prep",
    interviewSubjectDefault: "MERN Stack",
  },
  data_science: {
    id: "data_science",
    label: "Data Science",
    description: "Statistics, ML, Python, and modeling for DS roles",
    interviewSubjectDefault: "Data Science",
  },
  data_analyst: {
    id: "data_analyst",
    label: "Data Analyst",
    description: "SQL, dashboards, storytelling, and analytics",
    interviewSubjectDefault: "Data Analyst",
  },
  ai_ml: {
    id: "ai_ml",
    label: "AI / ML Engineer",
    description: "ML, deep learning, deployment, and MLOps fundamentals",
    interviewSubjectDefault: "ML Engineer",
  },
};

/** Map UI technology names to interview `subject` for questionService */
const TECHNOLOGY_TO_INTERVIEW_SUBJECT = {
  JavaScript: "JavaScript",
  React: "React",
  "Node.js": "Node.js",
  Express: "Node.js",
  MongoDB: "MERN Stack",
  SQL: "SQL",
  Java: "Java",
  "Spring Boot": "Java Full Stack",
  Python: "Python",
  Django: "Python Full Stack",
  Flask: "Python",
  PostgreSQL: "SQL",
  TypeScript: "TypeScript",
  Angular: "Angular",
  "REST API": "Node.js",
  Git: "JavaScript",
  "System Design": "MERN Stack",
  Statistics: "Data Science",
  Pandas: "Data Science",
  NumPy: "Data Science",
  "Machine Learning": "ML Engineer",
  "Deep Learning": "ML Engineer",
  NLP: "ML Engineer",
  MLOps: "ML Engineer",
  MCP: "AI/ML Master",
  RAG: "AI/ML Master",
  Embeddings: "AI/ML Master",
  "Vector DBs": "AI/ML Master",
  FastAPI: "AI/ML Master",
  Excel: "Data Analyst",
  Visualization: "Data Analyst",
  Storytelling: "Data Analyst",
  "A/B Testing": "Data Analyst",
  Dashboards: "Data Analyst",
};

const SYLLABI = {
  fullstack: [
    { technology: "JavaScript", concept: "Variables, scope, and hoisting", minutes: 45 },
    { technology: "JavaScript", concept: "Closures and the event loop", minutes: 60 },
    { technology: "JavaScript", concept: "Promises, async/await, and fetch", minutes: 60 },
    { technology: "JavaScript", concept: "ES6+ features (destructuring, modules)", minutes: 45 },
    { technology: "React", concept: "Components, props, and state", minutes: 60 },
    { technology: "React", concept: "useEffect and side effects", minutes: 60 },
    { technology: "React", concept: "Context, custom hooks, and performance", minutes: 75 },
    { technology: "React", concept: "React Router and forms", minutes: 45 },
    { technology: "Node.js", concept: "Modules, npm, and package.json", minutes: 45 },
    { technology: "Node.js", concept: "Express routing and middleware", minutes: 60 },
    { technology: "Node.js", concept: "REST API design and error handling", minutes: 60 },
    { technology: "MongoDB", concept: "Documents, collections, and CRUD", minutes: 60 },
    { technology: "MongoDB", concept: "Schema design and Mongoose", minutes: 60 },
    { technology: "SQL", concept: "JOINs, aggregations, and indexes", minutes: 75 },
    { technology: "Git", concept: "Branching, merge, and PR workflow", minutes: 45 },
    { technology: "System Design", concept: "Client-server, caching, and scaling basics", minutes: 90 },
  ],
  data_science: [
    { technology: "Python", concept: "Data structures and comprehensions", minutes: 45 },
    { technology: "Python", concept: "Pandas DataFrames and cleaning", minutes: 75 },
    { technology: "NumPy", concept: "Arrays, broadcasting, and vectorization", minutes: 60 },
    { technology: "Statistics", concept: "Distributions, hypothesis testing", minutes: 90 },
    { technology: "Statistics", concept: "Regression and correlation", minutes: 75 },
    { technology: "Machine Learning", concept: "Train/test split and cross-validation", minutes: 60 },
    { technology: "Machine Learning", concept: "Classification vs regression models", minutes: 75 },
    { technology: "Machine Learning", concept: "Feature engineering and pipelines", minutes: 75 },
    { technology: "SQL", concept: "Analytics queries and window functions", minutes: 60 },
    { technology: "Visualization", concept: "Charts, dashboards, and storytelling", minutes: 60 },
  ],
  data_analyst: [
    { technology: "SQL", concept: "SELECT, WHERE, GROUP BY", minutes: 45 },
    { technology: "SQL", concept: "JOINs and subqueries", minutes: 60 },
    { technology: "SQL", concept: "Window functions and CTEs", minutes: 75 },
    { technology: "Excel", concept: "Pivot tables and lookups", minutes: 45 },
    { technology: "Python", concept: "Pandas for analysis", minutes: 60 },
    { technology: "Statistics", concept: "Descriptive stats and A/B basics", minutes: 60 },
    { technology: "Visualization", concept: "Dashboard design principles", minutes: 60 },
    { technology: "Storytelling", concept: "Executive summaries from data", minutes: 45 },
    { technology: "A/B Testing", concept: "Experiment design and interpretation", minutes: 60 },
    { technology: "Dashboards", concept: "KPIs and metric definitions", minutes: 45 },
  ],
  ai_ml: [
    { technology: "Python", concept: "Python fundamentals for ML engineering", minutes: 45 },
    { technology: "Python", concept: "DSA patterns for AI interviews", minutes: 60 },
    { technology: "Statistics", concept: "Probability, Bayes, and hypothesis testing", minutes: 75 },
    { technology: "Machine Learning", concept: "Bias-variance, CV, and evaluation metrics", minutes: 75 },
    { technology: "Machine Learning", concept: "XGBoost / ensemble models", minutes: 60 },
    { technology: "Deep Learning", concept: "Transformers and attention", minutes: 90 },
    { technology: "NLP", concept: "LLMs — tokens, context, decoding", minutes: 75 },
    { technology: "Machine Learning", concept: "RAG pipeline — chunk, embed, retrieve, generate", minutes: 90 },
    { technology: "Machine Learning", concept: "Embeddings and vector databases", minutes: 60 },
    { technology: "Python", concept: "FastAPI — streaming chat and tool endpoints", minutes: 60 },
    { technology: "MCP", concept: "Model Context Protocol and tool integration", minutes: 45 },
    { technology: "Machine Learning", concept: "Tool calling and AI agents", minutes: 75 },
    { technology: "MLOps", concept: "Deployment, monitoring, drift", minutes: 75 },
    { technology: "Deep Learning", concept: "CNNs (Tier 2 — computer vision)", minutes: 60 },
    { technology: "Deep Learning", concept: "RNNs / LSTM (Tier 2)", minutes: 60 },
    { technology: "Machine Learning", concept: "Recommendation systems (Tier 2)", minutes: 75 },
    { technology: "Machine Learning", concept: "Graph RAG and multi-agent systems (Tier 3)", minutes: 90 },
  ],
};

const COMMON_TECH_OPTIONS = {
  fullstack: [
    "JavaScript",
    "React",
    "Node.js",
    "Express",
    "MongoDB",
    "SQL",
    "Java",
    "Python",
    "TypeScript",
    "Git",
  ],
  data_science: ["Python", "SQL", "Statistics", "Pandas", "NumPy", "Machine Learning", "Visualization"],
  data_analyst: ["SQL", "Excel", "Python", "Visualization", "Statistics", "Dashboards"],
  ai_ml: [
    "Python",
    "Statistics",
    "Machine Learning",
    "Deep Learning",
    "NLP",
    "RAG",
    "Embeddings",
    "FastAPI",
    "MCP",
    "MLOps",
    "SQL",
    "Vector DBs",
  ],
};

function getCategoryList() {
  return Object.values(CATEGORIES).map((c) => ({
    id: c.id,
    label: c.label,
    description: c.description,
  }));
}

function getTechOptionsForCategory(categoryId) {
  return COMMON_TECH_OPTIONS[categoryId] || COMMON_TECH_OPTIONS.fullstack;
}

function getSyllabusForCategory(categoryId) {
  return SYLLABI[categoryId] || SYLLABI.fullstack;
}

function getInterviewSubject(technology) {
  return TECHNOLOGY_TO_INTERVIEW_SUBJECT[technology] || technology;
}

function getCategoryMeta(categoryId) {
  return CATEGORIES[categoryId] || null;
}

module.exports = {
  CATEGORIES,
  getCategoryList,
  getTechOptionsForCategory,
  getSyllabusForCategory,
  getInterviewSubject,
  getCategoryMeta,
  TECHNOLOGY_TO_INTERVIEW_SUBJECT,
};
