const assert = require("node:assert/strict");
const test = require("node:test");
const { buildAnswerPlan, assessAnswer } = require("./chatAnswerQualityService");
const { getConceptReference } = require("./conceptReferenceService");

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

test("daemon-thread questions get a focused, authoritative teaching contract even with the common typo", () => {
  const plan = buildAnswerPlan("Python deamon thread");
  assert.equal(plan.mode, "focused-concept");
  assert.match(plan.instruction, /threading\.Event/);
  assert.match(plan.instruction, /set before start\(\)/);
  assert.match(plan.instruction, /cleanup are not guaranteed/);

  const reference = getConceptReference("Python deamon thread");
  assert.match(reference, /raises RuntimeError/);
  assert.match(reference, /join\(\) only makes the calling thread wait/);
});

test("rejects the old definition-first daemon explanation as too shallow", () => {
  const plan = buildAnswerPlan("Python daemon thread");
  const oldAnswer = `**Daemon Threads in Python**\n### Plain Definition\nA daemon thread is a background thread.\n### Mental Model\nIt is service staff.\n**Real-World Application**\nIt runs background work.\n**Code Example**\n\`\`\`python\nimport threading\nt = threading.Thread(target=print)\nt.daemon = True\nt.start()\nt.join()\n\`\`\``;
  const result = assessAnswer(oldAnswer, plan);
  assert.equal(result.passed, false);
  assert.ok(result.issues.some((issue) => issue.includes("too shallow")));
  assert.ok(result.issues.some((issue) => issue.includes("how it works")));
  assert.ok(result.issues.some((issue) => issue.includes("finally / cleanup")));
  assert.ok(result.issues.some((issue) => issue.includes("join() waits")));
  assert.ok(result.issues.some((issue) => issue.includes("threading.Event")));
});

test("accepts a complete causal daemon-thread lesson with runnable code and predicted behavior", () => {
  const plan = buildAnswerPlan("Python daemon thread");
  const answer = `**Python Daemon Threads: Shutdown Semantics**

### Direct Answer
A Python daemon thread is an ordinary Thread whose daemon flag tells the interpreter that this thread alone must not keep the process alive. When no alive non-daemon thread remains, Python may shut down and stop daemon threads abruptly, so unfinished work and cleanup can be lost.

### Why It Exists
Some background helpers, such as a best-effort metrics sampler, should not make an otherwise finished command wait forever. Without this lifecycle option, every helper would keep the process alive until it returned, even when its output was disposable. The option solves process-lifetime coordination; it does not make work faster and it is not an operating-system daemon process.

### Mental Model
Treat the daemon flag like an exit vote: a non-daemon thread votes to keep the process open, while a daemon thread does not; the real mechanism is Python checking whether any live non-daemon threads remain.

### How It Works
1. The creating thread constructs Thread(..., daemon=True); a child otherwise inherits its creator's daemon value.
2. The caller must choose the value before start(); changing daemon after start() raises RuntimeError.
3. start() schedules the same target function used by any other Python thread.
4. The main and other non-daemon threads continue running; join() merely makes its caller wait and never changes daemon status.
5. When no alive non-daemon thread remains, interpreter shutdown can terminate the daemon abruptly. A finally block, buffered file write, database transaction, or released lock is therefore not guaranteed.

### When to Use — and When Not To
- Use daemon=True for disposable observation such as a local status pulse where losing the final sample is acceptable.
- Do not use it for payments, file persistence, queue acknowledgements, or audit logs: those operations must finish or roll back predictably.
- For required work, prefer a non-daemon worker, signal it with threading.Event, and join it during an explicit shutdown path.
- The trade-off is convenient exit versus a guarantee of completion; daemon gives the former, not the latter.

### Common Pitfall
Putting a save() call inside finally and assuming it always runs is unsafe. If main returns while only daemon threads remain, shutdown can interrupt the worker before finally executes, leaving a partial file or transaction. Calling join() can wait for completion in a particular path, but it does not permanently convert the thread into non-daemon behavior.

### Key Insight
Use daemon threads only when abrupt loss is acceptable; if the work matters, own its shutdown with a signal and join().

**Real-World Application**
### Production Walkthrough
A command-line data importer starts a helper that prints progress every 100 milliseconds. The importer owns a stop Event, the helper reads it, and the importer signals and joins the helper in a finally block. Users see timely progress while the import runs, and normal completion is orderly. The daemon setting is only a last-resort escape if the controlling path crashes; it is not the cleanup strategy. A team should choose a non-daemon worker or durable job queue instead when progress data itself must be persisted.

**Code Example**
### Runnable Example
\`\`\`python
import threading
import time

stop = threading.Event()

def pulse():
    try:
        while not stop.wait(0.05):
            print("working")
    finally:
        print("worker cleaned up")

worker = threading.Thread(target=pulse, daemon=True)
worker.start()
time.sleep(0.12)
stop.set()
worker.join()
print("main finished")
\`\`\`

### What Happens
The worker normally prints working twice, receives the Event, runs its finally block, and then main prints main finished after join() confirms completion; exact pulse count can vary because scheduling is concurrent. Change daemon=True to daemon=False and remove stop.set() plus join(): the process stays alive because the non-daemon worker still votes to keep it running. With daemon=True and no cooperative shutdown, main may exit immediately and worker cleaned up is not guaranteed to appear. This contrast exposes the lifecycle mechanism rather than merely labeling the thread as background work.`;

  const result = assessAnswer(answer, plan);
  assert.deepEqual(result, { passed: true, issues: [] });
});

test("a first-principles topic is flagged foundational and gets a beginner directive", () => {
  const plan = buildAnswerPlan("python variables");
  assert.equal(plan.isFoundational, true);
  assert.equal(plan.mode, "focused-concept");
  assert.match(plan.instruction, /BEGINNER-CONCEPT MODE/);
  assert.match(plan.instruction, /shopping-cart|game score|counting/);
});

test("named contracts and umbrella topics are never treated as foundational", () => {
  assert.equal(buildAnswerPlan("hooks").isFoundational, false); // react-hooks contract
  assert.equal(buildAnswerPlan("sql joins").isFoundational, false); // sql-joins contract
  assert.equal(buildAnswerPlan("python").isFoundational, false); // umbrella
  // borrows a foundational word but is an advanced DSA topic
  assert.equal(buildAnswerPlan("linked list").isFoundational, false);
  assert.equal(buildAnswerPlan("list comprehension").isFoundational, false);
});

test("a SIMPLE beginner answer passes the relaxed foundational gate", () => {
  const plan = buildAnswerPlan("python variables");
  const answer = `**Python Variables**

### Direct Answer
A variable is a name that points to a value in memory. You create one with a name, an equals sign, and a value, and you can point it at something new whenever you like.

### Why It Exists
Without variables you would have to write the same value everywhere and change every copy by hand. A variable lets you store a value once and reuse it by name, so your program can remember things and change them as it runs.

### Mental Model
Think of a variable as a labelled sticky note on a box: the label is the name, and you can move it to a different box any time.

### How It Works
1. You write \`score = 10\`.
2. Python stores the value 10 and links the name \`score\` to it.
3. When you use \`score\`, Python looks up the value behind the name.
4. Assigning again, like \`score = 20\`, just moves the label to a new value.

### Common Pitfall
Using a variable before you assign it raises a NameError. Always give it a value first.

### Key Insight
A variable is a name for a value, not the value itself.

**Real-World Application**
### Real-World Walkthrough
Imagine a simple game score. You start with \`score = 0\`, add points as the player wins, and show the score on screen. The variable remembers the running total between rounds.

**Code Example**
### Runnable Example
\`\`\`python
score = 0        # start the score
score = score + 10  # player scores 10
print(score)     # shows 10
\`\`\`

### What Happens
The score starts at 0, becomes 10 after adding points, and \`print\` shows 10. Change the 10 to 25 and the output becomes 25.`;

  const result = assessAnswer(answer, plan);
  assert.deepEqual(result, { passed: true, issues: [] });
});

test("career and study-plan questions are not forced into the concept-card schema", () => {
  const plan = buildAnswerPlan("Give me a Python study plan");
  assert.equal(plan.isConceptQuestion, false);
  assert.deepEqual(assessAnswer("Start with syntax, then build a small project.", plan), {
    passed: true,
    issues: [],
  });
});
