// =======================================================
// Builds searchable reference index from ALL curriculums,
// question banks, and the AI/ML master bank.
// =======================================================

const { getAvailableTechnologies, getCurriculum } = require("./curriculumService");
const { SQL_QUESTION_BANK } = require("./sqlQuestionBank");
const { JS_QUESTION_BANK } = require("./javascriptQuestionBank");
const { PYTHON_QUESTION_BANK } = require("./pythonQuestionBank");
const { JAVA_QUESTION_BANK } = require("./javaQuestionBank");
const { NODEJS_QUESTION_BANK } = require("./nodejsQuestionBank");
const { REACT_QUESTION_BANK } = require("./reactQuestionBank");
const { MONGODB_QUESTION_BANK } = require("./mongodbQuestionBank");
const { PROBLEM_SOLVING_BANK } = require("./problemSolvingQuestionBank");

let indexCache = null;
let indexByKey = null;

const TECH_ALIASES = {
  javascript: ["javascript", "js", "ecmascript", "vanilla js"],
  nodejs: ["nodejs", "node.js", "node js", "express", "npm"],
  typescript: ["typescript", "ts", "tsx"],
  react: ["react", "reactjs", "jsx", "hooks", "redux"],
  python: ["python", "flask", "fastapi", "pip"],
  django: ["django", "mvt", "orm", "manage.py"],
  java: ["java", "jvm", "hibernate", "maven", "gradle"],
  springboot: ["spring boot", "springboot", "spring"],
  mongodb: ["mongodb", "mongo", "mongoose", "nosql"],
  html: ["html", "html5", "semantic"],
  css: ["css", "flexbox", "grid", "tailwind"],
  datascience: [
    "data science",
    "datascience",
    "data scientist",
    "data analyst",
    "machine learning",
    "ml engineer",
  ],
  sql: ["sql", "mysql", "postgresql", "postgres", "sqlite", "query", "join"],
  dsa: [
    "dsa",
    "algorithm",
    "algorithms",
    "data structure",
    "data structures",
    "leetcode",
    "binary search",
    "dynamic programming",
    "recursion",
  ],
  "ai-ml": [
    "ai/ml",
    "llm",
    "rag",
    "transformer",
    "embedding",
    "vector db",
    "mlops",
    "genai",
    "xgboost",
    "pytorch",
    "tensorflow",
  ],
};

function normalizeText(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^\w\s+#./-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTerms(...parts) {
  const terms = new Set();
  for (const part of parts) {
    if (!part) continue;
    if (Array.isArray(part)) {
      part.forEach((p) => extractTerms(p).forEach((t) => terms.add(t)));
      continue;
    }
    const norm = normalizeText(part);
    if (!norm) continue;
    terms.add(norm);
    norm.split(" ").forEach((word) => {
      if (word.length >= 3) terms.add(word);
    });
  }
  return [...terms];
}

function formatCurriculumReference(entry) {
  const topics = entry.topics.length
    ? entry.topics.map((t) => `- ${t}`).join("\n")
    : "- (see objectives)";
  const objectives = entry.objectives.length
    ? entry.objectives.map((o) => `- ${o}`).join("\n")
    : "";

  return `REFERENCE FACTS (${entry.id}) — authoritative curriculum scope; cover ALL listed topics; do not omit or contradict:

Technology: ${entry.technologyName}
Concept: ${entry.title}
${entry.description ? `Summary: ${entry.description}` : ""}

Topics to include when explaining this concept:
${topics}
${objectives ? `\nLearning objectives:\n${objectives}` : ""}
${entry.teachingSnippet ? `\nTeaching scope (beginner):\n${entry.teachingSnippet}` : ""}`;
}

function formatBankReference(entry) {
  const conceptList = entry.concepts || entry.topics || [];
  const concepts = conceptList.length
    ? conceptList.map((c) => `- ${c}`).join("\n")
    : "- (see topic title)";

  return `REFERENCE FACTS (${entry.id}) — authoritative ${entry.technologyName} interview scope:

Topic: ${entry.title}
Key concepts to mention completely (do not give partial lists):
${concepts}`;
}

function buildCurriculumEntries() {
  const entries = [];

  for (const { id, name } of getAvailableTechnologies()) {
    const curriculum = getCurriculum(id);
    for (const concept of curriculum.concepts || []) {
      const topics = concept.topics || [];
      const objectives = concept.objectives || [];
      const teachingSnippet = String(
        concept.teachingContent?.beginner || concept.teachingContent?.intermediate || ""
      ).slice(0, 450);

      const entry = {
        id: `${id}/${concept.id}`,
        source: "curriculum",
        technology: id,
        technologyName: curriculum.technology || name,
        conceptId: concept.id,
        title: concept.title,
        description: concept.description || "",
        topics,
        objectives,
        teachingSnippet,
        searchTerms: extractTerms(
          id,
          name,
          curriculum.technology,
          concept.title,
          concept.description,
          topics,
          objectives,
          teachingSnippet
        ),
      };
      entry.reference = formatCurriculumReference(entry);
      entries.push(entry);
    }
  }

  return entries;
}

function buildBankEntries(technology, technologyName, bank) {
  const entries = [];

  for (const [sectionKey, section] of Object.entries(bank || {})) {
    if (!section || typeof section !== "object") continue;

    const title = section.topic || sectionKey;
    const concepts =
      section.concepts ||
      (Array.isArray(section.problems)
        ? section.problems.map((p) => p.title).filter(Boolean)
        : []);

    if (!title) continue;

    const entry = {
      id: `${technology}/bank-${sectionKey}`,
      source: "question-bank",
      technology,
      technologyName,
      conceptId: null,
      title,
      description: "",
      topics: concepts,
      concepts,
      objectives: [],
      teachingSnippet: "",
      searchTerms: extractTerms(technology, technologyName, title, concepts, sectionKey),
    };
    entry.reference = formatBankReference(entry);
    entries.push(entry);
  }

  return entries;
}

function buildAiMlEntries() {
  try {
    const { getSections } = require("./aiMlQuestionBank");
    const sections = getSections();
    return sections.map((section) => {
      const entry = {
        id: `ai-ml/section-${section.id}`,
        source: "ai-ml-bank",
        technology: "ai-ml",
        technologyName: "AI / ML Master",
        conceptId: null,
        title: section.name,
        description: `${section.questionCount} interview questions`,
        topics: [section.name],
        objectives: [],
        teachingSnippet: "",
        searchTerms: extractTerms(
          "ai-ml",
          "ai ml master",
          section.name,
          `section ${section.id}`
        ),
      };
      entry.reference = formatBankReference(entry);
      return entry;
    });
  } catch {
    return [];
  }
}

function buildIndex() {
  const entries = [
    ...buildCurriculumEntries(),
    ...buildBankEntries("sql", "SQL", SQL_QUESTION_BANK),
    ...buildBankEntries("javascript", "JavaScript", JS_QUESTION_BANK),
    ...buildBankEntries("python", "Python", PYTHON_QUESTION_BANK),
    ...buildBankEntries("java", "Java", JAVA_QUESTION_BANK),
    ...buildBankEntries("nodejs", "Node.js", NODEJS_QUESTION_BANK),
    ...buildBankEntries("react", "React", REACT_QUESTION_BANK),
    ...buildBankEntries("mongodb", "MongoDB", MONGODB_QUESTION_BANK),
    ...buildBankEntries("dsa", "Problem Solving / DSA", PROBLEM_SOLVING_BANK),
    ...buildAiMlEntries(),
  ];

  const byKey = new Map();
  for (const entry of entries) {
    if (entry.conceptId) {
      byKey.set(`${entry.technology}/${entry.conceptId}`, entry);
    }
  }

  indexCache = entries;
  indexByKey = byKey;
  const curriculumCount = entries.filter((e) => e.source === "curriculum").length;
  console.log(
    `📚 Concept reference index: ${entries.length} entries (${curriculumCount} curriculum concepts + ${entries.length - curriculumCount} bank sections)`
  );
  return entries;
}

function getIndex() {
  if (!indexCache) buildIndex();
  return indexCache;
}

function getEntryByConceptId(technology, conceptId) {
  if (!indexByKey) buildIndex();
  if (!technology || !conceptId) return null;
  return indexByKey.get(`${String(technology).toLowerCase()}/${conceptId}`) || null;
}

function detectTechnologies(text) {
  const norm = normalizeText(text);
  const hits = [];

  for (const [tech, aliases] of Object.entries(TECH_ALIASES)) {
    if (aliases.some((alias) => norm.includes(alias))) {
      hits.push(tech);
    }
  }

  return hits;
}

function scoreEntry(queryNorm, entry, hintedTechs = []) {
  let score = 0;

  if (hintedTechs.includes(entry.technology)) score += 40;

  const titleNorm = normalizeText(entry.title);
  if (titleNorm.length >= 8 && queryNorm.includes(titleNorm.slice(0, Math.min(24, titleNorm.length)))) {
    score += 35;
  }

  for (const term of entry.searchTerms) {
    if (term.length < 3) continue;
    if (queryNorm.includes(term)) {
      score += Math.min(term.length, 12);
    }
  }

  if (entry.description && queryNorm.includes(normalizeText(entry.description))) {
    score += 20;
  }

  return score;
}

function findMatchingEntries(text, options = {}) {
  const index = getIndex();
  const queryNorm = normalizeText(text);
  if (!queryNorm) return [];

  const hintedTechs = [
    ...(options.technology ? [String(options.technology).toLowerCase()] : []),
    ...detectTechnologies(text),
  ];

  const scored = index
    .map((entry) => ({
      entry,
      score: scoreEntry(queryNorm, entry, hintedTechs),
    }))
    .filter((row) => row.score >= 18)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, options.limit || 3).map((row) => row.entry);
}

function getIndexStats() {
  const index = getIndex();
  const byTech = {};
  for (const entry of index) {
    byTech[entry.technology] = (byTech[entry.technology] || 0) + 1;
  }
  return { total: index.length, byTechnology: byTech };
}

module.exports = {
  TECH_ALIASES,
  buildIndex,
  getIndex,
  getEntryByConceptId,
  detectTechnologies,
  findMatchingEntries,
  getIndexStats,
};
