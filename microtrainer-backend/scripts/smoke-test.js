/**
 * Smoke checks. Run: npm test
 *
 * - Always: local / Piston-backed code execution path
 * - Optional: GET /health when SMOKE_BASE_URL is set (e.g. http://127.0.0.1:5000)
 * - Strict: set SMOKE_STRICT=1 to fail if health check URL is set but server is down
 */
process.env.NODE_ENV = process.env.NODE_ENV || "development";

const assert = require("node:assert");
const axios = require("axios");

async function checkHealth() {
  const base = (process.env.SMOKE_BASE_URL || "").replace(/\/$/, "");
  if (!base) {
    console.log("SKIP /health (set SMOKE_BASE_URL=http://127.0.0.1:5000 to verify a running server)");
    return;
  }
  try {
    const { data } = await axios.get(`${base}/health`, { timeout: 3000 });
    assert.strictEqual(data.status, "healthy");
    console.log("OK server health", base);
  } catch (e) {
    if (process.env.SMOKE_STRICT === "1") throw e;
    console.log("SKIP server health (unreachable):", e.message);
  }
}

async function checkCodeExecution() {
  const { executeCode } = require("../services/codeExecutionService");
  const r = await executeCode(
    "javascript",
    "function solution(x) { return x + 1; }",
    [
      { input: 1, output: 2 },
      { input: 10, output: 11 },
    ]
  );
  assert.strictEqual(r.success, true, "executeCode should succeed");
  assert.strictEqual(r.passedTests, 2, "all tests should pass");
  console.log("OK code execution", r.executionMode || "piston");
}

async function run() {
  await checkCodeExecution();
  await checkHealth();
}

run().catch((e) => {
  console.error("SMOKE TEST FAILED:", e);
  process.exit(1);
});
