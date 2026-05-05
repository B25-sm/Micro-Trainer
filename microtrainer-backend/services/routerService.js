function detectSubject(question) {
  const q = question.toLowerCase();

  if (q.includes("select") || q.includes("join") || q.includes("sql")) {
    return "sql";
  }

  if (q.includes("useeffect") || q.includes("react")) {
    return "react";
  }

  if (q.includes("array") || q.includes("loop") || q.includes("python")) {
    return "python";
  }

  return "general";
}

module.exports = { detectSubject };