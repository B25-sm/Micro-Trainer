/**
 * Feature verification — run while server is up:
 *   node scripts/feature-verify.js
 */
const axios = require("axios");

const BASE = (process.env.SMOKE_BASE_URL || "http://127.0.0.1:5000").replace(/\/$/, "");
const results = [];

function pass(name, detail = "") {
  results.push({ name, ok: true, detail });
  console.log(`✅ ${name}${detail ? ` — ${detail}` : ""}`);
}
function fail(name, err) {
  const msg = err?.response?.data?.error || err?.message || String(err);
  results.push({ name, ok: false, detail: msg });
  console.log(`❌ ${name} — ${msg}`);
}

async function get(path, opts = {}) {
  return axios.get(`${BASE}${path}`, { timeout: opts.timeout || 10000, headers: opts.headers });
}
async function post(path, body, opts = {}) {
  return axios.post(`${BASE}${path}`, body, { timeout: opts.timeout || 30000, headers: opts.headers });
}

async function main() {
  console.log(`\n🔍 Feature verification @ ${BASE}\n`);

  // 1. Health
  try {
    const { data } = await get("/health");
    if (data.status === "healthy") pass("Health check");
    else fail("Health check", new Error(data.status));
  } catch (e) { fail("Health check", e); }

  // 2. Learning path — technologies & curriculum
  try {
    const { data } = await get("/learning-path/technologies");
    const count = data?.technologies?.length ?? data?.length ?? 0;
    if (count >= 10) pass("Learning path — technologies", `${count} technologies`);
    else fail("Learning path — technologies", new Error(`only ${count}`));
  } catch (e) { fail("Learning path — technologies", e); }

  try {
    const { data } = await get("/learning-path/curriculum/javascript");
    const concepts = data?.concepts?.length ?? 0;
    if (concepts >= 4) pass("Learning path — curriculum", `${concepts} JS concepts`);
    else fail("Learning path — curriculum", new Error(`only ${concepts} concepts`));
  } catch (e) { fail("Learning path — curriculum", e); }

  // 3. Problems bank
  try {
    const { data } = await get("/problems/stats/all");
    const total = data?.total ?? data?.stats?.total ?? 0;
    if (total > 0) pass("Problems — stats", `${total} problems`);
    else fail("Problems — stats", new Error("empty bank"));
  } catch (e) { fail("Problems — stats", e); }

  try {
    const { data } = await get("/problems/random");
    if (data?.id || data?.problem?.id) pass("Problems — random", data.title || data.problem?.title || "ok");
    else fail("Problems — random", new Error("no problem returned"));
  } catch (e) { fail("Problems — random", e); }

  // 4. Code execution (local fallback)
  try {
    const { data } = await post("/code/execute", {
      language: "javascript",
      code: "function solution(x) { return x * 2; }",
      testCases: [{ input: 3, output: 6 }, { input: 0, output: 0 }],
    });
    if (data.success && data.passedTests === 2) pass("Code execution", data.executionMode || "ok");
    else fail("Code execution", new Error(JSON.stringify({ success: data.success, passed: data.passedTests })));
  } catch (e) { fail("Code execution", e); }

  // 5. Code template
  try {
    const { data } = await get("/code/template/python");
    if (data.template || data.code) pass("Code template", "python");
    else fail("Code template", new Error("empty template"));
  } catch (e) { fail("Code template", e); }

  // 6. Adaptive teaching (/ask) — needs Groq
  try {
    const { data } = await post("/ask", {
      question: "What is a variable?",
      studentId: "verify_student_1",
    });
    if (data.explanation && data.explanation.length > 50) {
      pass("Adaptive teaching (/ask)", `level=${data.level || "detecting"}, len=${data.explanation.length}`);
    } else fail("Adaptive teaching (/ask)", new Error("short or missing explanation"));
  } catch (e) { fail("Adaptive teaching (/ask)", e); }

  // 7. Home chat (/chat/ask)
  try {
    const { data } = await post("/chat/ask", { question: "What is React used for?" });
    if (data.answer && data.answer.length > 20) pass("Home chat (/chat/ask)", `${data.answer.length} chars`);
    else fail("Home chat (/chat/ask)", new Error("empty answer"));
  } catch (e) { fail("Home chat (/chat/ask)", e); }

  // 8. Interview session start — needs Groq
  let sessionId;
  try {
    const { data } = await post("/interview/start", {
      subject: "javascript",
      studentId: "verify_student_1",
    });
    sessionId = data.sessionId;
    if (sessionId && data.question) pass("Interview — start session", `Q1: ${String(data.question).slice(0, 60)}...`);
    else fail("Interview — start session", new Error("no session/question"));
  } catch (e) { fail("Interview — start session", e); }

  // 9. Interview answer
  if (sessionId) {
    try {
      const { data } = await post("/interview/answer", {
        sessionId,
        answer: "A variable stores data in memory. In JavaScript we use let and const. Example: let count = 0;",
      });
      if (data.feedback || data.score !== undefined || data.nextQuestion || data.completed !== undefined) {
        pass("Interview — submit answer", data.completed ? "session done" : "got feedback/next Q");
      } else fail("Interview — submit answer", new Error(JSON.stringify(Object.keys(data))));
    } catch (e) { fail("Interview — submit answer", e); }
  }

  // 10. Student analytics (may need sheets)
  try {
    const { data } = await get("/student/verify_student_1/analytics");
    pass("Student analytics", `attempts=${data?.totalAttempts ?? data?.questionsAnswered ?? 0}`);
  } catch (e) { fail("Student analytics", e); }

  // 11. Student memory
  try {
    const { data } = await get("/student/verify_student_1/memory");
    pass("Student memory", data?.level ? `level=${data.level}` : "empty (new student ok)");
  } catch (e) { fail("Student memory", e); }

  // 12. Engagement
  try {
    const { data } = await get("/api/engagement/status/verify_student_1");
    pass("Engagement status", data?.status || "ok");
  } catch (e) { fail("Engagement status", e); }

  try {
    const { data } = await get("/api/badges/verify_student_1");
    pass("Badges", `${data?.badges?.length ?? 0} badges`);
  } catch (e) { fail("Badges", e); }

  // 13. Anti-cheat session
  let cheatSessionId = "verify_cheat_" + Date.now();
  try {
    const { data } = await post("/anticheat/session", {
      sessionId: cheatSessionId,
      studentId: "verify_student_1",
      subject: "javascript",
    });
    cheatSessionId = data.sessionId || cheatSessionId;
    if (cheatSessionId) pass("Anti-cheat — create session", cheatSessionId);
    else fail("Anti-cheat — create session", new Error("no sessionId"));
  } catch (e) { fail("Anti-cheat — create session", e); }

  if (cheatSessionId) {
    try {
      await post("/anticheat/event", { sessionId: cheatSessionId, eventType: "tab_switch" });
      pass("Anti-cheat — log event");
    } catch (e) { fail("Anti-cheat — log event", e); }
  }

  // 14. Trainer-only (should 403 without header)
  try {
    await get("/trainer/leaderboard");
    fail("Trainer auth guard", new Error("should have returned 403"));
  } catch (e) {
    if (e?.response?.status === 403) pass("Trainer auth guard", "403 without role header");
    else fail("Trainer auth guard", e);
  }

  try {
    const { data } = await get("/trainer/leaderboard", { headers: { role: "trainer" } });
    pass("Trainer leaderboard", Array.isArray(data) ? `${data.length} entries` : "ok");
  } catch (e) { fail("Trainer leaderboard", e); }

  // 15. Dashboard overview
  try {
    const { data } = await get("/dashboard/overview");
    pass("Dashboard overview", typeof data === "object" ? "ok" : "empty");
  } catch (e) { fail("Dashboard overview", e); }

  // 16. Notifications prefs
  try {
    const { data } = await get("/api/notifications/preferences/verify_student_1");
    pass("Notification preferences", "ok");
  } catch (e) { fail("Notification preferences", e); }

  // Summary
  const ok = results.filter((r) => r.ok).length;
  const bad = results.filter((r) => !r.ok).length;
  console.log(`\n${"=".repeat(50)}`);
  console.log(`RESULT: ${ok} passed, ${bad} failed (${results.length} checks)\n`);
  if (bad) {
    console.log("Failed:");
    results.filter((r) => !r.ok).forEach((r) => console.log(`  - ${r.name}: ${r.detail}`));
    process.exit(1);
  }
}

main().catch((e) => {
  console.error("VERIFY CRASHED:", e.message);
  process.exit(1);
});
