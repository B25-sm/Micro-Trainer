const assert = require("node:assert/strict");
const test = require("node:test");
const { buildAnswerPlan, assessAnswer } = require("./chatAnswerQualityService");

test("treats hooks as an umbrella topic with explicit ecosystem coverage", () => {
  const plan = buildAnswerPlan("hooks");
  assert.equal(plan.mode, "broad-overview");
  assert.match(plan.instruction, /useReducer/);
  assert.match(plan.instruction, /useEffect/);
  assert.match(plan.instruction, /Rules of Hooks/);
});

test("rejects the shallow and off-topic hooks answer shown in the product", () => {
  const plan = buildAnswerPlan("hooks");
  const result = assessAnswer(
    "**React Hooks**\nOnly useState matters. **let** changes.\n**Real-World Application** forms\n**Code Example**\n```js\nconst [x,setX]=useState(0)\n```",
    plan
  );
  assert.equal(result.passed, false);
  assert.ok(result.issues.some((issue) => issue.includes("useContext")));
  assert.ok(result.issues.some((issue) => issue.includes("unrelated")));
});

test("classifies comparisons and debugging separately", () => {
  assert.equal(buildAnswerPlan("useMemo vs useCallback").mode, "comparison");
  assert.equal(buildAnswerPlan("Why does my useEffect loop forever?").mode, "debugging");
});

test("plans other umbrella topics without forcing greetings through concept QA", () => {
  assert.equal(buildAnswerPlan("SQL").mode, "broad-overview");
  const greetingPlan = buildAnswerPlan("hi", { technical: false });
  assert.deepEqual(assessAnswer("Hi! Ask me a technical question.", greetingPlan), {
    passed: true,
    issues: [],
  });
});

test("standard-set contracts prevent partial lists", () => {
  const joins = buildAnswerPlan("SQL joins");
  const partial = assessAnswer(
    `${"x".repeat(1900)}\n**Real-World Application**\nOnly INNER JOIN.\n**Code Example**\n\`\`\`sql\nSELECT 1\n\`\`\``,
    joins
  );
  assert.equal(partial.passed, false);
  assert.ok(partial.issues.some((issue) => issue.includes("FULL OUTER JOIN")));
});
