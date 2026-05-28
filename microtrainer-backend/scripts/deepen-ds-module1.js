/**
 * Deepens Module 1 (ds-1) lesson brief and teaching content for richer AI lessons.
 */
const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "../data/curriculums/datascience.json");
const curriculum = JSON.parse(fs.readFileSync(file, "utf8"));

const module1 = curriculum.concepts.find((c) => c.id === "ds-1");
if (!module1) {
  console.error("ds-1 not found");
  process.exit(1);
}

module1.objectives = [
  "Define data science and explain how it differs from traditional IT or software roles",
  "Compare Data Analyst, Data Scientist, ML Engineer, and Data Engineer — skills and daily work",
  "Give real industry examples (healthcare, finance, e-commerce) where data drove decisions",
  "Describe a realistic learning path and what employers expect at entry vs mid level",
  "Set honest expectations on salary bands, tools, and job market demand",
];

module1.lessonBrief = `
MODULE 1 DEEP BRIEF — Data Science Landscape & Career Paths

WHAT IS DATA SCIENCE (teach clearly):
- Interdisciplinary field: statistics + programming + domain knowledge + communication
- Goal: turn raw data into decisions (not just charts) — prediction, optimization, automation
- Real examples to mention: Netflix recommendations, fraud detection at banks, hospital readmission risk, inventory optimization at Amazon, sports analytics (player performance), social media feed ranking

CAREER PATHS (must contrast all four):
1. Data Analyst — SQL, Excel/Sheets, dashboards (Power BI/Tableau), KPIs, A/B test reports, stakeholders. Less model-building, more reporting and insights.
2. Data Scientist — end-to-end: EDA, modeling, experimentation, sometimes deployment. Bridge between business and ML.
3. ML Engineer — production ML: pipelines, APIs, scaling, monitoring, feature stores, MLOps. Strong software engineering + ML.
4. Data Engineer — pipelines, warehouses, Spark, Airflow, data quality at scale. Builds the plumbing analysts/scientists use.

INDUSTRY APPLICATIONS (one sentence each with outcome):
- Healthcare: predict readmission → reduce costs
- Finance: credit risk / fraud → save money
- E-commerce: recommendation + churn → revenue
- Sports: player metrics → team strategy
- Social media: engagement ranking → retention

SUCCESS STORIES (teach mindset):
- How Target-style analytics or similar case studies show correlation vs causation carefully
- How a simple dashboard saved hours vs how a model automated a decision

EXPECTATIONS (be honest, not hype):
- Entry roles often need Python + SQL + one viz tool + statistics basics
- Salaries vary by region; mention growth in GenAI/LLM skills
- Portfolio beats certificates; capstone projects matter

LESSON TONE: Career mentor + technical coach. Use one consistent analogy (e.g. data team as a restaurant: raw ingredients=data, prep=kitchen/ETL, plate=dashboard, recipe=model).
In Real-time use case: pick LinkedIn job feed or Netflix homepage — user-visible vs internal ML/analytics.
`;

module1.teachingContent = {
  beginner: `Data science is how companies use numbers and code to make smarter decisions — not magic, not just Excel charts. You'll meet four common roles: Analyst (reports and SQL), Scientist (models and experiments), ML Engineer (ships models to production), and Data Engineer (builds data pipes). We'll walk through hospitals catching risky patients early, banks stopping fraud, stores recommending products, and apps ranking feeds — so you see where YOU might fit before writing a single line of Python.`,
  intermediate: `Treat data science as a decision factory: ingest → clean → explore → model or metric → communicate. Analysts optimize clarity for stakeholders; scientists own hypothesis and model choice; ML engineers own latency, deployment, and drift; data engineers own reliable pipelines. Compare tool stacks (SQL + Python + BI vs PyTorch + Docker + feature stores). Discuss how the same company hires different profiles on one team.`,
  advanced: `Frame the landscape around organizational maturity: reporting-only analytics teams vs experimentation culture vs ML platform teams. Contrast when to hire analysts vs scientists vs ML engineers. Cover career arbitrage (analyst → scientist → MLE), interview signals per role, and how GenAI shifted job descriptions. Include trade-offs: build vs buy models, centralized vs embedded data teams, and ethical boundaries when data drives high-stakes decisions.`,
};

module1.crossQuestions = [
  "Data Analyst vs ML Engineer — what does each do on a typical Monday? Give a concrete example.",
  "Pick one industry (healthcare, finance, or e-commerce) and explain a data-driven decision that saved money or lives.",
  "What three skills would you learn first if you wanted an entry-level data role in 2026?",
  "Why is 'data science' not the same job everywhere? Explain with two different company examples.",
];

fs.writeFileSync(file, JSON.stringify(curriculum, null, 2), "utf8");
console.log("Deepened ds-1:", module1.title);
