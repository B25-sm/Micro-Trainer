/**
 * Interview question quality gate — all live questions use curated banks only.
 */

const {
  getRandomMongoQuestion,
  getRandomExpressQuestion,
  getRandomReactQuestionCurated,
  getRandomNodeQuestionCurated,
  getRandomJSQuestionCurated,
  getRandomJavaQuestionCurated,
  getRandomPythonQuestionCurated,
  getRandomSQLQuestionCurated,
  isOffTopicQuestion,
} = require("./curatedInterviewBanks");

const { getRandomAiMlQuestion } = require("./aiMlQuestionBank");

const BROAD_TECH_NAMES = new Set([
  "mongodb", "mongoose", "express", "react", "node.js", "nodejs", "node",
  "javascript", "java", "python", "sql", "angular", "django", "flask",
  "postgresql", "html", "css", "typescript", "mern", "hibernate",
  "nosql", "mysql", "redis", "kubernetes", "docker", "spring boot",
  "spring", "mern stack", "full stack", "fullstack",
]);

const ABSURD_PATTERNS = [
  /^show me the code for /i,
  /^write the syntax for (mongodb|mongoose|express|react|node\.?js|javascript|java|python|sql|mern)/i,
  /^code (mongodb|mongoose|express|react|node\.?js|javascript|java|python|sql|mern)\b/i,
  /^write a working example of (mongodb|express|react|node\.?js|javascript|java|python|mern)\b/i,
  /^give me the syntax of /i,
];

const GENERIC_TEMPLATE_PATTERNS = [
  /\bgive a practical example from a real (mern )?project\b/i,
  /\bwhen would you use it vs an alternative\b/i,
  /\bexplain a production edge case you have handled\b/i,
  /^this topic — /i,
  /^in a real project, how have you used /i,
];

const PRACTICAL_MARKERS =
  /\b(write|show|implement|sketch|outline|how do|how does|how would|when (do|would|use)|why (use|would)|difference between|vs |compare|query|schema|route|middleware|join|example|trade-?off|steps|pattern|fix|debug|design|prevent|handle)\b/i;

function normalizeQuestion(q) {
  return String(q || "")
    .replace(/^["'\s]+|["'\s]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function questionDedupKey(q) {
  return normalizeQuestion(q).toLowerCase();
}

function isQuestionExcluded(question, excludeQuestions = []) {
  const key = questionDedupKey(question);
  if (!key) return true;
  return excludeQuestions.some((prev) => questionDedupKey(prev) === key);
}

function isBroadTopic(concept) {
  return BROAD_TECH_NAMES.has(normalizeQuestion(concept).toLowerCase());
}

function isAbsurdQuestion(question) {
  const q = normalizeQuestion(question);
  if (!q) return true;
  return ABSURD_PATTERNS.some((re) => re.test(q));
}

/** Pure definition recall — not a real interview task */
function isDefinitionOnlyQuestion(question) {
  const q = normalizeQuestion(question);

  if (/^what is (?:an? |the )?.+\??$/i.test(q) && !PRACTICAL_MARKERS.test(q)) {
    return true;
  }
  if (/^define .+\??$/i.test(q)) return true;
  if (/^explain .+\??$/i.test(q) && !PRACTICAL_MARKERS.test(q)) return true;

  const whatIs = q.match(/^what is (?:an? |the )?(.+?)\??$/i);
  if (whatIs && isBroadTopic(whatIs[1])) return true;

  if (/^what is (react|mongodb|node\.?js|javascript|java|python|sql|express|mern)\??$/i.test(q)) {
    return true;
  }

  return false;
}

function isTooGeneric(question) {
  const q = normalizeQuestion(question);
  if (GENERIC_TEMPLATE_PATTERNS.some((re) => re.test(q))) return true;
  if (q.length < 20) return true;
  if (!PRACTICAL_MARKERS.test(q)) return true;
  return false;
}

function isInterviewQualityQuestion(question, subject = "") {
  const q = normalizeQuestion(question);
  if (!q || q.length < 20 || q.length > 220) return false;
  if (isAbsurdQuestion(q)) return false;
  if (isDefinitionOnlyQuestion(q)) return false;
  if (isTooGeneric(q)) return false;
  if (isOffTopicQuestion(q, subject)) return false;
  if (subject && isBroadTopic(q.replace(/[?.!]/g, "").trim())) return false;
  return true;
}

function curatedGetterForSubject(subject) {
  const s = String(subject || "").toLowerCase();

  if (s.includes("mongo")) return getRandomMongoQuestion;
  if (s.includes("express")) return getRandomExpressQuestion;
  if (s.includes("react")) return getRandomReactQuestionCurated;
  if (s.includes("node")) return getRandomNodeQuestionCurated;
  if (s.includes("javascript") || s === "js") return getRandomJSQuestionCurated;
  if (s.includes("java")) return getRandomJavaQuestionCurated;
  if (s.includes("python")) return getRandomPythonQuestionCurated;
  if (s.includes("sql")) return getRandomSQLQuestionCurated;
  if (s.includes("data") || s.includes("ml") || s.includes("ai")) {
    return (difficulty) => getRandomAiMlQuestion(difficulty);
  }
  if (s.includes("mern")) {
    const techs = [
      getRandomMongoQuestion,
      getRandomExpressQuestion,
      getRandomReactQuestionCurated,
      getRandomNodeQuestionCurated,
    ];
    return (difficulty) => techs[Math.floor(Math.random() * techs.length)](difficulty);
  }

  return null;
}

function getCuratedFallback(subject, difficulty = "medium", options = {}) {
  const getter = curatedGetterForSubject(subject);
  if (getter) {
    return pickCuratedQuestion(getter, subject, difficulty, options);
  }

  const templates = {
    easy: `Describe one ${subject} feature you built — what was your specific contribution?`,
    medium: `Walk through a ${subject} bug you fixed — root cause and fix?`,
    hard: `What ${subject} trade-off would you make when scaling to production?`,
  };
  for (const tier of [difficulty, "medium", "easy", "hard"]) {
    const template = templates[tier];
    if (template && !isQuestionExcluded(template, options.excludeQuestions || [])) {
      return template;
    }
  }
  return templates.medium;
}

function pickCuratedQuestion(getter, subject, difficulty, options = {}) {
  const { excludeQuestions = [], maxTries = 24 } = options;
  const difficulties = [difficulty, "easy", "medium", "hard"].filter(
    (d, i, arr) => arr.indexOf(d) === i
  );
  const tried = new Set();

  for (const diff of difficulties) {
    for (let i = 0; i < maxTries; i += 1) {
      const raw = getter(diff);
      if (!raw) continue;
      const key = questionDedupKey(raw);
      if (tried.has(key) || isQuestionExcluded(raw, excludeQuestions)) continue;
      tried.add(key);
      if (isInterviewQualityQuestion(raw, subject)) {
        return normalizeQuestion(raw);
      }
    }
  }

  for (const diff of difficulties) {
    for (let i = 0; i < maxTries; i += 1) {
      const raw = getter(diff);
      if (!raw || isQuestionExcluded(raw, excludeQuestions)) continue;
      return normalizeQuestion(raw);
    }
  }

  return normalizeQuestion(getter(difficulty));
}

function ensureInterviewQuestion(question, subject, difficulty) {
  const q = normalizeQuestion(question);
  if (isInterviewQualityQuestion(q, subject)) {
    return q;
  }
  return getCuratedFallback(subject, difficulty);
}

function pickBankQuestion(getQuestionFn, subject, difficulty, options = {}) {
  const getter = curatedGetterForSubject(subject) || getQuestionFn;
  return pickCuratedQuestion(getter, subject, difficulty, options);
}

module.exports = {
  isAbsurdQuestion,
  isInterviewQualityQuestion,
  isDefinitionOnlyQuestion,
  isBroadTopic,
  ensureInterviewQuestion,
  getCuratedFallback,
  pickBankQuestion,
  pickCuratedQuestion,
  pickExpressQuestion: getRandomExpressQuestion,
  normalizeQuestion,
  questionDedupKey,
  isQuestionExcluded,
};
