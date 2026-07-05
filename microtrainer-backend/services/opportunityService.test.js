const assert = require("node:assert/strict");
const test = require("node:test");
const { resolveStack, isGithubIssueRelevant } = require("./opportunityService");

test("does not guess a stack for a language-agnostic concept", () => {
  assert.equal(resolveStack("inheritance"), null);
  assert.equal(resolveStack("python inheritance"), resolveStack("python"));
});

test("rejects GitHub issues unrelated to the requested topic", () => {
  const rustBounty = {
    title: "Star and review an open source crate",
    body: "A bounty for a Rust wallet",
    repository_url: "https://api.github.com/repos/example/rust-bounties",
    labels: [{ name: "bounty" }],
  };
  const reactIssue = {
    title: "Fix useEffect cleanup in React hooks example",
    body: "The hooks documentation leaks a subscription.",
    repository_url: "https://api.github.com/repos/example/react-course",
    labels: [{ name: "good first issue" }],
  };

  assert.equal(isGithubIssueRelevant(rustBounty, "react hooks"), false);
  assert.equal(isGithubIssueRelevant(reactIssue, "react hooks"), true);
});
