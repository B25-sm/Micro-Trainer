const { detectTechnologies } = require("./conceptReferenceService");

// Concepts that may look like ordinary English to a small language model.
// This is deliberately only a positive allow-list: it never decides that a
// prompt is non-technical.
const TECHNICAL_CONCEPT_PATTERN = /\b(?:object[- ]oriented programming|apis?|algorithms?|arrays?|async|await|caches?|classes|closures?|cloud|commits?|containers?|cookies?|css|databases?|docker|dom|exceptions?|frameworks?|functions?|git|heaps?|hooks?|html|http|inheritance|interfaces?|javascript|java|json|kernel|kubernetes|linux|mongodb|node(?:\.js)?|oop|pipelines?|promises?|python|queues?|react(?:\.js)?|recursion|redux|rest|scopes?|sockets?|sql|stacks?|threads?|tokens?|typescript|variables?|vite)\b/i;

const REFUSAL_PATTERN = /\b(?:technical concepts? and interview preparation only|can(?:not|'t) help with that|ask(?:ing)? me (?:about )?something technical)\b/i;

function getTechnicalIntent(text) {
  const value = String(text || "").trim();
  const technologies = detectTechnologies(value);
  return {
    recognized: technologies.length > 0 || TECHNICAL_CONCEPT_PATTERN.test(value),
    technologies,
  };
}

function isScopeRefusal(text) {
  return REFUSAL_PATTERN.test(String(text || ""));
}

module.exports = { getTechnicalIntent, isScopeRefusal };
