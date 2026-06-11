/**
 * Company-style starter shells only — no solution logic.
 */

function normalizeLang(language) {
  const l = String(language || "").toLowerCase();
  if (l === "js") return "javascript";
  if (l === "py") return "python";
  return l;
}

function inferTypes(problem) {
  const sample = problem?.testCases?.[0];
  if (!sample) {
    return { inputType: "unknown", outputType: "unknown", sampleInput: null };
  }
  const input = sample.input;
  const output = sample.output;
  const typeOf = (v) => (Array.isArray(v) ? "array" : v === null ? "null" : typeof v);
  return {
    inputType: typeOf(input),
    outputType: typeOf(output),
    sampleInput: input,
  };
}

function typeLabel(kind) {
  switch (kind) {
    case "number":
      return "number";
    case "string":
      return "string";
    case "boolean":
      return "boolean";
    case "array":
      return "array";
    default:
      return "mixed";
  }
}

function exampleComment(inputType, sampleInput) {
  if (sampleInput === undefined || sampleInput === null) return "";
  const preview =
    typeof sampleInput === "string"
      ? `"${sampleInput}"`
      : JSON.stringify(sampleInput);
  return ` — e.g. ${preview}`;
}

function buildProblemTemplate(language, problem = null) {
  const lang = normalizeLang(language);
  const title = problem?.title ? String(problem.title) : "Coding challenge";
  const { inputType, outputType, sampleInput } = inferTypes(problem);
  const inLabel = typeLabel(inputType);
  const outLabel = typeLabel(outputType);
  const example = exampleComment(inputType, sampleInput);

  if (lang === "python") {
    return `"""
${title}
Implement solution(value). The runner passes each test case automatically${example}.
Input type: ${inLabel} | Expected output type: ${outLabel}
Do not hardcode answers. Do not add print(solution(...)) — Run/Submit calls your function.
"""

def solution(value):
    # Write your code here
    pass
`;
  }

  if (lang === "java") {
    return `/**
 * ${title}
 * Implement solution(input). Test input is passed automatically${example}.
 * Input: ${inLabel} | Output: ${outLabel}
 */
class Solution {
    public Object solution(Object input) {
        // Write your code here
        return null;
    }
}
`;
  }

  return `/**
 * ${title}
 * Implement solution(input). Test input is passed automatically${example}.
 * @param {*} input
 * @returns {*} 
 */
function solution(input) {
  // Write your code here
  return null;
}
`;
}

function getStarterCode(language, problem) {
  return buildProblemTemplate(language, problem);
}

module.exports = {
  buildProblemTemplate,
  getStarterCode,
};
