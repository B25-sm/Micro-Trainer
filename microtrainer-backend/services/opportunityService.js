// =======================================================
// 💼 OPPORTUNITY SERVICE
// Maps a technology/concept the student is practicing to real, live
// opportunities: GitHub good-first-issues, bounty-labeled issues, remote
// jobs/internships, and hackathons — all normalized to one shape.
//
// Cached per-concept (not per-student) since opportunities barely change
// and concepts are finite — this keeps upstream API usage tiny regardless
// of how many students hit the endpoint.
//
// Every source fetcher swallows its own errors and returns [] on failure,
// so one dead/rate-limited feed never breaks the others or the chip.
// =======================================================

const axios = require("axios");

const CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12h
const MAX_RESULTS = 12;
const cache = new Map(); // "tech::concept" -> { data, expiresAt }

// GitHub's "language:" search qualifier wants a language name, not a
// framework name — map the technologies this app teaches onto it.
const GITHUB_LANGUAGE_MAP = {
  react: "javascript",
  reactjs: "javascript",
  javascript: "javascript",
  node: "javascript",
  nodejs: "javascript",
  typescript: "typescript",
  python: "python",
  django: "python",
  java: "java",
  spring: "java",
  springboot: "java",
  sql: "sql",
};

function cacheKey(tech, concept) {
  return `${String(tech || "").toLowerCase()}::${String(concept || "").toLowerCase()}`;
}

function extractReward(text) {
  const match = String(text || "").match(/\$\s?[\d,]+(\.\d+)?/);
  return match ? match[0].replace(/\s+/, "") : null;
}

function stripHtml(text) {
  return String(text || "").replace(/<[^>]*>/g, "").trim();
}

// ---------------------------------------------------------
// GitHub — good-first-issues (real OSS tickets solvable today)
// ---------------------------------------------------------

function githubHeaders() {
  const headers = { Accept: "application/vnd.github+json" };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
}

function buildGithubTechTerms(tech, concept) {
  const language = GITHUB_LANGUAGE_MAP[String(tech || "").toLowerCase().trim()];
  const parts = [];
  // language: qualifier substitutes for the tech term when we can map one;
  // otherwise keep the raw tech as a search term so it isn't dropped
  // whenever a concept is also present.
  if (language) parts.push(`language:${language}`);
  else if (tech) parts.push(String(tech));
  if (concept) parts.push(String(concept));
  return parts;
}

async function searchGithubIssues(query) {
  const res = await axios.get("https://api.github.com/search/issues", {
    params: { q: query, sort: "created", order: "desc", per_page: 5 },
    headers: githubHeaders(),
    timeout: 6000,
  });
  return res.data.items || [];
}

async function fetchGithubIssues(tech, concept) {
  try {
    const query = [
      'label:"good first issue"',
      "state:open",
      "type:issue",
      ...buildGithubTechTerms(tech, concept),
    ].join(" ");

    const items = await searchGithubIssues(query);
    return items.map((issue) => ({
      type: "issue",
      title: issue.title,
      org: (issue.repository_url || "").split("/").slice(-2).join("/"),
      url: issue.html_url,
      reward: null,
      tags: [tech].filter(Boolean),
      source: "github",
    }));
  } catch (err) {
    console.error("Opportunity fetch (github issues) error:", err.message);
    return [];
  }
}

// ---------------------------------------------------------
// Bounties — proxy via GitHub issues labeled/tagged as paid bounties
// (Algora, IssueHunt, Boost.small, etc. all sync bounty issues to GitHub
// with a "bounty" label and a $ amount in the title).
// ---------------------------------------------------------

async function fetchBounties(tech, concept) {
  try {
    const query = [
      "label:bounty",
      "state:open",
      "type:issue",
      ...buildGithubTechTerms(tech, concept),
    ].join(" ");

    const items = await searchGithubIssues(query);
    return items.map((issue) => ({
      type: "bounty",
      title: issue.title,
      org: (issue.repository_url || "").split("/").slice(-2).join("/"),
      url: issue.html_url,
      reward: extractReward(issue.title),
      tags: [tech].filter(Boolean),
      source: "github-bounty",
    }));
  } catch (err) {
    console.error("Opportunity fetch (bounties) error:", err.message);
    return [];
  }
}

// ---------------------------------------------------------
// Jobs & internships — free public job boards
// ---------------------------------------------------------

async function fetchRemoteOkJobs(tech) {
  try {
    const tag = String(tech || "").toLowerCase().trim().replace(/\s+/g, "-");
    if (!tag) return [];

    const res = await axios.get("https://remoteok.com/api", {
      params: { tags: tag },
      headers: { "User-Agent": "Mozilla/5.0 (MicroTrainer opportunity feed)" },
      timeout: 6000,
    });

    const items = Array.isArray(res.data) ? res.data.slice(1) : []; // first item is a legal notice
    // Postings tagged with 20-30 generic tags to reach every search are spam-y
    // and rarely relevant to the specific tech — keep only tightly-tagged ones.
    const relevant = items.filter((job) => (job.tags || []).length <= 10);
    return relevant.slice(0, 5).map((job) => ({
      type: /intern/i.test(job.position || "") ? "internship" : "job",
      title: job.position,
      org: job.company,
      url: job.url,
      reward: job.salary_min ? `$${Math.round(job.salary_min / 1000)}k+` : null,
      tags: job.tags || [],
      source: "remoteok",
    }));
  } catch (err) {
    console.error("Opportunity fetch (remoteok) error:", err.message);
    return [];
  }
}

async function fetchArbeitnowJobs(tech, concept) {
  try {
    const search = [tech, concept].filter(Boolean).join(" ");
    const res = await axios.get(
      "https://www.arbeitnow.com/api/job-board-api",
      { params: { search }, timeout: 6000 }
    );

    const items = res.data?.data || [];
    return items.slice(0, 5).map((job) => ({
      type: (job.job_types || []).some((t) => /intern/i.test(t))
        ? "internship"
        : "job",
      title: job.title,
      org: job.company_name,
      url: job.url,
      reward: null,
      tags: job.tags || [],
      source: "arbeitnow",
    }));
  } catch (err) {
    console.error("Opportunity fetch (arbeitnow) error:", err.message);
    return [];
  }
}

// ---------------------------------------------------------
// Hackathons — best-effort; unofficial endpoint, degrades to [] silently
// ---------------------------------------------------------

async function fetchHackathons(tech) {
  try {
    const res = await axios.get("https://devpost.com/api/hackathons", {
      params: { search: tech, status: "open" },
      timeout: 6000,
    });

    const items = res.data?.hackathons || [];
    return items.slice(0, 3).map((h) => ({
      type: "hackathon",
      title: stripHtml(h.title),
      org: "Devpost",
      url: h.url,
      reward:
        h.prize_amount && !/^\$?\s?0+(\.0+)?$/.test(stripHtml(h.prize_amount))
          ? stripHtml(h.prize_amount)
          : null,
      tags: (h.themes || []).map((t) => t.name).filter(Boolean),
      source: "devpost",
    }));
  } catch (err) {
    console.error("Opportunity fetch (hackathons) error:", err.message);
    return [];
  }
}

// ---------------------------------------------------------
// Merge — round-robin across sources so a cap never crowds out variety
// ---------------------------------------------------------

function interleave(lists, limit) {
  const result = [];
  let i = 0;
  while (result.length < limit && lists.some((list) => list.length > i)) {
    for (const list of lists) {
      if (list[i]) result.push(list[i]);
      if (result.length >= limit) break;
    }
    i += 1;
  }
  return result;
}

/** Concept-scoped, cached list of live opportunities for a technology/concept. */
async function getOpportunities(tech, concept) {
  if (!tech) return [];

  const key = cacheKey(tech, concept);
  const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const [issues, bounties, remoteOkJobs, arbeitnowJobs, hackathons] =
    await Promise.all([
      fetchGithubIssues(tech, concept),
      fetchBounties(tech, concept),
      fetchRemoteOkJobs(tech),
      fetchArbeitnowJobs(tech, concept),
      fetchHackathons(tech),
    ]);

  const data = interleave(
    [bounties, [...remoteOkJobs, ...arbeitnowJobs], issues, hackathons],
    MAX_RESULTS
  );

  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
  return data;
}

module.exports = { getOpportunities };
