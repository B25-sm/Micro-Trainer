const test = require("node:test");
const assert = require("node:assert/strict");
const { getOrGenerate, getStats, clear } = require("./lessonCacheService");

test.beforeEach(() => clear());

test("a warm cache hit does not re-run the generator", async () => {
  let calls = 0;
  const gen = async () => ({ n: ++calls });

  const first = await getOrGenerate("k", gen);
  const second = await getOrGenerate("k", gen);

  assert.equal(first.n, 1);
  assert.equal(second.n, 1);
  assert.equal(calls, 1);
});

test("single-flight: a simultaneous burst triggers ONE generation", async () => {
  // Simulates 20 students hitting the same concept before the first finishes.
  let calls = 0;
  const gen = async () => {
    calls += 1;
    await new Promise((r) => setTimeout(r, 20));
    return { built: calls };
  };

  const results = await Promise.all(
    Array.from({ length: 20 }, () => getOrGenerate("burst", gen))
  );

  assert.equal(calls, 1, "generator must run exactly once for the whole burst");
  for (const r of results) assert.equal(r.built, 1);
  assert.equal(getStats().coalesced, 19);
});

test("each caller gets an isolated clone (mutation cannot corrupt the cache)", async () => {
  const gen = async () => ({ questions: [{ q: "a" }] });

  const a = await getOrGenerate("clone", gen);
  a.questions[0].q = "MUTATED";
  a.questions.push({ q: "extra" });

  const b = await getOrGenerate("clone", gen);
  assert.equal(b.questions.length, 1);
  assert.equal(b.questions[0].q, "a");
});

test("failures are never cached — the next caller retries", async () => {
  let calls = 0;
  const gen = async () => {
    calls += 1;
    if (calls === 1) throw new Error("groq down");
    return { ok: true };
  };

  await assert.rejects(() => getOrGenerate("flaky", gen), /groq down/);
  const recovered = await getOrGenerate("flaky", gen);

  assert.equal(recovered.ok, true);
  assert.equal(calls, 2);
});

test("shouldCache=false serves the value but does not persist it", async () => {
  let calls = 0;
  const gen = async () => ({ n: ++calls, contentSource: "analogy-database" });
  const opts = { shouldCache: (v) => v.contentSource === "sai-mahendra-guided" };

  const first = await getOrGenerate("fallback", gen, opts);
  const second = await getOrGenerate("fallback", gen, opts);

  assert.equal(first.n, 1);
  assert.equal(second.n, 2, "un-cacheable result must regenerate next time");
});

test("expired entries regenerate", async () => {
  let calls = 0;
  const gen = async () => ({ n: ++calls });

  await getOrGenerate("ttl", gen, { ttlMs: 5 });
  await new Promise((r) => setTimeout(r, 15));
  const after = await getOrGenerate("ttl", gen, { ttlMs: 5 });

  assert.equal(after.n, 2);
});

test("distinct keys are cached independently", async () => {
  const gen = (label) => async () => ({ label });

  const a = await getOrGenerate("a", gen("a"));
  const b = await getOrGenerate("b", gen("b"));

  assert.equal(a.label, "a");
  assert.equal(b.label, "b");
  assert.equal(getStats().size, 2);
});
