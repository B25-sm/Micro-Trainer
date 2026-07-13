const test = require("node:test");
const assert = require("node:assert/strict");
const {
  dismissalDelay,
  effectiveStatus,
} = require("./quickCheckProgressService");

const DAY_MS = 24 * 60 * 60 * 1000;

test("dismissals back off from one day to one week", () => {
  assert.equal(dismissalDelay(1), DAY_MS);
  assert.equal(dismissalDelay(2), 3 * DAY_MS);
  assert.equal(dismissalDelay(3), 7 * DAY_MS);
  assert.equal(dismissalDelay(10), 7 * DAY_MS);
});

test("an unresolved started check becomes abandoned after 30 minutes", () => {
  const now = Date.parse("2026-07-13T12:00:00.000Z");
  assert.equal(
    effectiveStatus({ status: "started", updatedAt: "2026-07-13T11:29:59.000Z" }, now),
    "abandoned"
  );
  assert.equal(
    effectiveStatus({ status: "started", updatedAt: "2026-07-13T11:45:00.000Z" }, now),
    "started"
  );
});

test("an ignored offer is distinct from a failed assessment", () => {
  const now = Date.parse("2026-07-13T12:00:00.000Z");
  assert.equal(
    effectiveStatus({ status: "offered", updatedAt: "2026-07-13T11:00:00.000Z" }, now),
    "ignored"
  );
});
