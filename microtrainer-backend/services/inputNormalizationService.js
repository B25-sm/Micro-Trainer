// =======================================================
// Normalizes chat shorthand and common tech-word misspellings
// so typo-tolerant matching (concept reference lookup, tech
// detection) still finds the right topic. Only used to build
// internal matching hints — never rewrites what the student
// typed or sees.
// =======================================================

const WORD_CORRECTIONS = {
  // chat shorthand / abbreviations
  wat: "what", wats: "whats", wut: "what", hw: "how", u: "you", ur: "your",
  y: "why", pls: "please", plz: "please", btw: "by the way", abt: "about",
  diff: "difference", coz: "because", bcoz: "because", cuz: "because",
  thx: "thanks", tnx: "thanks", msg: "message", def: "definition",
  expln: "explain", xplain: "explain", py: "python", db: "database",

  // common tech-word misspellings
  pyhton: "python", phyton: "python", pyton: "python",
  javascrip: "javascript", javascrit: "javascript", jscript: "javascript",
  raect: "react", ract: "react",
  mondodb: "mongodb", monogdb: "mongodb", mongoo: "mongodb",
  fucntion: "function", funtion: "function", functoin: "function",
  diffrence: "difference", diference: "difference",
  explian: "explain",
  recurtion: "recursion", recurssion: "recursion",
  algoritm: "algorithm", algorythm: "algorithm",
  arrray: "array", arary: "array",
  objct: "object",
  asyc: "async", asnyc: "async",
  dictonary: "dictionary", dictionery: "dictionary",
  databse: "database", databas: "database",
};

/** Best-effort correction pass used only for internal topic matching. */
function normalizeForMatching(text) {
  const raw = String(text || "");
  if (!raw.trim()) return "";

  return raw
    .split(/(\s+)/)
    .map((token) => {
      const stripped = token.replace(/[^\w']/g, "");
      if (!stripped) return token;
      const replacement = WORD_CORRECTIONS[stripped.toLowerCase()];
      return replacement ? token.replace(stripped, replacement) : token;
    })
    .join("");
}

module.exports = { normalizeForMatching };
