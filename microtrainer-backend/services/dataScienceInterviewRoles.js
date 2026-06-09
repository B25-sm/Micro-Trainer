/**
 * Role-specific interview topic pools for Data Analyst vs ML Engineer.
 */

const DATA_ANALYST_TOPICS = [
  "SQL",
  "Excel pivot tables",
  "A/B testing",
  "Data visualization",
  "Descriptive statistics",
  "Power BI",
  "Tableau",
  "ETL basics",
  "Dashboard KPIs",
  "Data storytelling",
];

const ML_ENGINEER_TOPICS = [
  "RAG",
  "LLMs",
  "Embeddings",
  "Vector databases",
  "FastAPI",
  "MCP",
  "Tool calling",
  "AI agents",
  "MLOps",
  "Model deployment",
  "XGBoost",
  "Transformers",
  "OCR and PDF processing",
];

const DATA_SCIENCE_GENERAL_TOPICS = [
  "Python for ML",
  "Statistics",
  "Machine Learning fundamentals",
  "Deep Learning",
  "NLP and LLMs",
  "RAG",
  "SQL",
  "Feature engineering",
  "MLOps basics",
  "Model evaluation",
];

const ROLE_PROMPT_HINTS = {
  "data analyst": `
ROLE: Data Analyst interview (NOT ML Engineer).
Focus: SQL queries, Excel/Sheets, dashboards, KPIs, A/B tests, stakeholder communication, data quality, reporting.
Ask practical questions like: "Write SQL for second-highest salary", "How do you explain a drop in conversion to executives?", "When would you use a pivot table vs a formula?"
Avoid: training deep neural networks, Kubernetes, distributed training unless clearly about analytics infra.`,
  "ml engineer": `
ROLE: ML Engineer interview (NOT pure analyst).
Focus: model training, evaluation metrics, feature stores, deployment (Flask/FastAPI), Docker, drift monitoring, pipelines, scaling inference.
Ask practical questions like: "How do you handle class imbalance in production?", "Explain train-serve skew", "When would you pick XGBoost over logistic regression?"
Avoid: only Excel/Tableau questions unless tied to ML product analytics.`,
};

function normalizeRoleSubject(subject) {
  return String(subject || "").toLowerCase().trim();
}

function isDataAnalystRole(subject) {
  const s = normalizeRoleSubject(subject);
  return s === "data analyst" || s.includes("data analyst");
}

function isMLEngineerRole(subject) {
  const s = normalizeRoleSubject(subject);
  return s === "ml engineer" || s.includes("ml engineer");
}

function isGeneralDataScience(subject) {
  const s = normalizeRoleSubject(subject);
  return (
    s === "data science" ||
    s === "datascience" ||
    s === "data scientist" ||
    (s.includes("data scien") && !isDataAnalystRole(subject) && !isMLEngineerRole(subject))
  );
}

function isAiMlMasterRole(subject) {
  const s = normalizeRoleSubject(subject);
  return (
    s === "ai/ml master" ||
    s.includes("ai/ml master") ||
    s === "ai engineer" ||
    s === "genai engineer" ||
    s === "applied scientist" ||
    s === "research engineer"
  );
}

function pickInterviewTopic(subject) {
  if (isDataAnalystRole(subject)) {
    return DATA_ANALYST_TOPICS[
      Math.floor(Math.random() * DATA_ANALYST_TOPICS.length)
    ];
  }
  if (isMLEngineerRole(subject)) {
    return ML_ENGINEER_TOPICS[
      Math.floor(Math.random() * ML_ENGINEER_TOPICS.length)
    ];
  }
  if (isGeneralDataScience(subject)) {
    return DATA_SCIENCE_GENERAL_TOPICS[
      Math.floor(Math.random() * DATA_SCIENCE_GENERAL_TOPICS.length)
    ];
  }
  return null;
}

const AI_ML_MASTER_HINT = `
ROLE: AI / ML Master interview (AI Engineer, ML Engineer, Data Scientist, GenAI, Applied Scientist).
Draw from the full stack: Python, statistics, classical ML, deep learning, NLP/LLMs, RAG, agents, MCP, FastAPI, document AI, MLOps, and system design.
Ask practical, depth-testing questions with real examples — not textbook definitions only.`;

function getRolePromptHint(subject) {
  if (isAiMlMasterRole(subject)) return AI_ML_MASTER_HINT;
  if (isDataAnalystRole(subject)) return ROLE_PROMPT_HINTS["data analyst"];
  if (isMLEngineerRole(subject)) return ROLE_PROMPT_HINTS["ml engineer"];
  return "";
}

module.exports = {
  DATA_ANALYST_TOPICS,
  ML_ENGINEER_TOPICS,
  DATA_SCIENCE_GENERAL_TOPICS,
  pickInterviewTopic,
  getRolePromptHint,
  isDataAnalystRole,
  isMLEngineerRole,
  isGeneralDataScience,
  isAiMlMasterRole,
};
