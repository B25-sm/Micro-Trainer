const assert = require("node:assert/strict");
const test = require("node:test");
const { normalizeForMatching } = require("./inputNormalizationService");
const { getTechnicalIntent, isScopeRefusal } = require("./chatTechnicalIntentService");

test("recognizes OOPs shorthand and React spelling variants as technical", () => {
  for (const prompt of ["oops", "OOP", "react", "React.js", "cookies"]) {
    const normalized = normalizeForMatching(prompt);
    assert.equal(getTechnicalIntent(normalized).recognized, true, prompt);
  }
});

test("does not positively classify an obviously non-technical name", () => {
  assert.equal(getTechnicalIntent("Donald Trump").recognized, false);
});

test("detects the stock scope refusal", () => {
  assert.equal(
    isScopeRefusal("I'm here to help with technical concepts and interview preparation only"),
    true
  );
});
