/**
 * AI / ML Master Interview Bank — 535 questions across 13 sections.
 * Data: data/ai-ml-master-bank.json (run scripts/build-ai-ml-master-bank.js to regenerate)
 */

const fs = require("fs");
const path = require("path");

const BANK_PATH = path.join(__dirname, "../data/ai-ml-master-bank.json");

let cachedBank = null;

function loadBank() {
  if (cachedBank) return cachedBank;
  if (!fs.existsSync(BANK_PATH)) {
    throw new Error(
      "AI/ML master bank not found. Run: node scripts/build-ai-ml-master-bank.js"
    );
  }
  cachedBank = JSON.parse(fs.readFileSync(BANK_PATH, "utf8"));
  return cachedBank;
}

function isAiMlMasterSubject(subject) {
  const s = String(subject || "").toLowerCase().trim();
  return (
    s === "ai/ml master" ||
    s === "ai ml master" ||
    s.includes("ai/ml master") ||
    s === "genai engineer" ||
    s === "ai engineer" ||
    s === "applied scientist" ||
    s === "research engineer" ||
    (s.includes("ai") && s.includes("ml") && s.includes("master"))
  );
}

function matchesRoleSubject(subject) {
  const s = String(subject || "").toLowerCase().trim();
  if (isAiMlMasterSubject(subject)) return true;
  return (
    s === "ml engineer" ||
    s.includes("ml engineer") ||
    s === "data science" ||
    s === "data scientist" ||
    s.includes("data scien") ||
    s === "data analyst" ||
    s.includes("data analyst")
  );
}

/**
 * Pick a random question from the master bank.
 * @param {object} opts
 * @param {string} opts.difficulty - easy | medium | hard
 * @param {number} [opts.tier] - 1 | 2 | 3
 * @param {number} [opts.sectionId] - 1-13
 * @param {string} [opts.topic] - substring match on topic
 */
function normalizeQuestionText(q) {
  return String(q || "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function getRandomAiMlQuestion(difficulty = "medium", opts = {}) {
  const bank = loadBank();
  let pool = bank.questions;

  if (opts.tier) {
    pool = pool.filter((q) => q.tier === Number(opts.tier));
  }
  if (opts.sectionId) {
    pool = pool.filter((q) => q.sectionId === Number(opts.sectionId));
  }
  if (opts.topic) {
    const t = opts.topic.toLowerCase();
    pool = pool.filter((q) => q.topic.toLowerCase().includes(t));
  }

  const exclude = new Set(
    (opts.excludeQuestions || []).map((q) => normalizeQuestionText(q))
  );

  const difficulties = [difficulty, "easy", "medium", "hard"].filter(
    (d, i, arr) => arr.indexOf(d) === i
  );

  for (const diff of difficulties) {
    const tierPool = pool.filter((q) => q.difficulty === diff);
    const candidates = tierPool.filter(
      (q) => !exclude.has(normalizeQuestionText(q.text))
    );
    if (candidates.length > 0) {
      return candidates[Math.floor(Math.random() * candidates.length)].text;
    }
  }

  const pick = pool[Math.floor(Math.random() * pool.length)];
  return pick.text;
}

function getBankMeta() {
  return loadBank().meta;
}

function getSections() {
  return loadBank().sections;
}

function getQuestionsBySection(sectionId) {
  const bank = loadBank();
  return bank.questions.filter((q) => q.sectionId === Number(sectionId));
}

function getTierCounts() {
  const bank = loadBank();
  const counts = { 1: 0, 2: 0, 3: 0 };
  for (const q of bank.questions) {
    counts[q.tier] = (counts[q.tier] || 0) + 1;
  }
  return counts;
}

module.exports = {
  isAiMlMasterSubject,
  matchesRoleSubject,
  getRandomAiMlQuestion,
  getBankMeta,
  getSections,
  getQuestionsBySection,
  getTierCounts,
  loadBank,
};
