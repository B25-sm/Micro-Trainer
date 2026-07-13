const test = require("node:test");
const assert = require("node:assert/strict");
const {
  feedbackSignal,
  normalizeAssessmentRows,
} = require("./assessmentResultNormalizer");

test("recognizes positive and negative grading feedback", () => {
  assert.equal(feedbackSignal("The answer correctly notes the licensing difference."), "positive");
  assert.equal(feedbackSignal("The answer confuses JRE and JDK roles."), "negative");
});

test("recovers an omitted score from positive feedback", () => {
  const [row] = normalizeAssessmentRows({
    answers: ["Oracle for commercial support; Temurin for an open-source build."],
    questions: ["Why choose Oracle JDK or Temurin?"],
    rawScores: [],
    feedback: ["The answer correctly identifies licensing and open-source considerations."],
  });
  assert.equal(row.score, 9);
  assert.equal(row.recovered, true);
});

test("repairs score and feedback contradictions in either direction", () => {
  const rows = normalizeAssessmentRows({
    answers: ["answer one", "answer two"],
    questions: ["q1", "q2"],
    rawScores: [10, 0],
    feedback: [
      "The answer incorrectly confuses the two runtime roles.",
      "The answer correctly notes both core functionality and licensing.",
    ],
  });
  assert.equal(rows[0].score, 3);
  assert.equal(rows[1].score, 9);
});
