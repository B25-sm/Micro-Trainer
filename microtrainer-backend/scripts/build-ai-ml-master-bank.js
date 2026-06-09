/**
 * Builds data/ai-ml-master-bank.json from section modules.
 * Run: node scripts/build-ai-ml-master-bank.js
 */
const fs = require("fs");
const path = require("path");

const SECTION_MODULES = [
  require("../data/aiMlBank/section01"),
  require("../data/aiMlBank/section02"),
  require("../data/aiMlBank/section03"),
  require("../data/aiMlBank/section04"),
  require("../data/aiMlBank/section05"),
  require("../data/aiMlBank/section06"),
  require("../data/aiMlBank/section07"),
  require("../data/aiMlBank/section08"),
  require("../data/aiMlBank/section09"),
  require("../data/aiMlBank/section10"),
  require("../data/aiMlBank/section11"),
  require("../data/aiMlBank/section12"),
  require("../data/aiMlBank/section13"),
];

const STUDY_TIERS = {
  1: {
    label: "Must Know (2–3 weeks)",
    topics: [
      "Python",
      "Statistics",
      "ML Fundamentals",
      "Transformers",
      "LLMs",
      "RAG",
      "Embeddings",
      "Vector DBs",
      "FastAPI",
      "MCP",
      "Tool Calling",
      "Agents",
      "OCR/PDF Processing",
      "MLOps Basics",
    ],
  },
  2: {
    label: "High Value",
    topics: [
      "CNN",
      "RNN",
      "XGBoost/LightGBM",
      "Recommendation Systems",
      "Deep Learning Optimization",
      "System Design",
    ],
  },
  3: {
    label: "Advanced",
    topics: [
      "Graph RAG",
      "Multi-Agent Systems",
      "RLHF Internals",
      "Research-Level DL",
      "Advanced MLOps",
    ],
  },
};

function inferDifficulty(text) {
  const t = text.toLowerCase();
  if (
    /from scratch|design a|design large|build .* pipeline|implement |production pipeline|mnc-level/.test(
      t
    )
  ) {
    return "hard";
  }
  if (/^what is |^define |vs |difference between/.test(t)) {
    return "easy";
  }
  return "medium";
}

let globalId = 0;
const questions = [];
const sections = [];

for (const mod of SECTION_MODULES) {
  const sectionQuestions = [];
  for (const block of mod.blocks) {
    for (const text of block.questions) {
      globalId += 1;
      const q = {
        id: globalId,
        sectionId: mod.sectionId,
        sectionName: mod.sectionName,
        tier: block.tier ?? mod.defaultTier ?? 1,
        topic: block.topic,
        text,
        difficulty: inferDifficulty(text),
      };
      questions.push(q);
      sectionQuestions.push(q);
    }
  }
  sections.push({
    id: mod.sectionId,
    name: mod.sectionName,
    defaultTier: mod.defaultTier,
    questionCount: sectionQuestions.length,
  });
}

const out = {
  meta: {
    title: "AI / ML Master Interview Bank",
    subtitle:
      "For AI Engineer | ML Engineer | Data Scientist | GenAI Engineer | Applied Scientist | Research Engineer",
    totalQuestions: questions.length,
    sectionCount: sections.length,
    studyTiers: STUDY_TIERS,
  },
  sections,
  questions,
};

const outPath = path.join(__dirname, "../data/ai-ml-master-bank.json");
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
console.log(`✅ Wrote ${questions.length} questions to ${outPath}`);
