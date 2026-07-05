// =======================================================
// 💼 OPPORTUNITY SERVICE
// Maps what a student is practicing to real, live opportunities:
//   • GitHub good-first-issues + bounties  → concept-relevant, self-evidently
//     real (live GitHub links). Shown today, no key needed.
//   • Jobs / internships (Adzuna)          → matched to the STACK the student
//     is preparing (not a micro-concept), fresh, India-focused, senior roles
//     excluded. Dormant until ADZUNA_APP_ID / ADZUNA_APP_KEY are set.
//
// Design principles learned the hard way:
//   - Jobs map to STACK + LEVEL, never to a toy concept like "Sum of Digits".
//   - Never show a senior/lead role to someone still learning.
//   - Only credible sources. No scraping LinkedIn/Naukri/Indeed (no legal API);
//     no low-signal remote-gig boards that surface cleaning-company "jobs".
//   - No API can guarantee a listing is still open — we filter by freshness
//     and use a reputable aggregator, and claim nothing more.
//
// Cached per-concept (not per-student): keeps upstream API usage tiny at scale.
// Every fetcher swallows its own errors and returns [] so one dead feed never
// breaks the others or the chip.
// =======================================================

const axios = require("axios");

const CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12h
const MAX_RESULTS = 10;
const cache = new Map(); // "tech::concept" -> { data, expiresAt }

// Seniority we never surface to a learner.
const SENIOR_EXCLUDE = [
  "senior",
  "sr",
  "lead",
  "principal",
  "staff",
  "architect",
  "manager",
  "head",
  "director",
];

// ---------------------------------------------------------
// Stack model — the heart of relevance. Resolves whatever a surface knows
// (a technology name, an interview subject, a role, or free text) into a
// canonical stack with a GitHub language + India-oriented job keywords.
// ---------------------------------------------------------

const STACKS = {
  mern: {
    label: "MERN / Full-stack JS",
    githubLanguage: "javascript",
    jobKeywords: ["mern stack developer", "full stack developer", "react node"],
  },
  frontend: {
    label: "Frontend",
    githubLanguage: "javascript",
    jobKeywords: ["frontend developer", "react developer", "ui developer"],
  },
  node: {
    label: "Node / Backend JS",
    githubLanguage: "javascript",
    jobKeywords: ["node js developer", "backend developer"],
  },
  pythonFullstack: {
    label: "Python full-stack",
    githubLanguage: "python",
    jobKeywords: ["python full stack developer", "django developer"],
  },
  django: {
    label: "Django / Python",
    githubLanguage: "python",
    jobKeywords: ["django developer", "python developer"],
  },
  python: {
    label: "Python",
    githubLanguage: "python",
    jobKeywords: ["python developer"],
  },
  java: {
    label: "Java",
    githubLanguage: "java",
    jobKeywords: ["java developer", "spring boot developer"],
  },
  sql: {
    label: "SQL / Data",
    githubLanguage: "sql",
    jobKeywords: ["sql developer", "data analyst"],
  },
};

/**
 * Match free-form input to a canonical stack. Order matters — check the more
 * specific/compound stacks before the generic ones, and guard "java" against
 * matching inside "javascript".
 */
function resolveStack(tech, concept) {
  const text = `${tech || ""} ${concept || ""}`.toLowerCase();
  const has = (...terms) => terms.some((t) => text.includes(t));

  if (has("mern")) return STACKS.mern;
  if (has("python") && has("full")) return STACKS.pythonFullstack;
  if (has("django")) return STACKS.django;
  if (has("python")) return STACKS.python;
  if (has("spring")) return STACKS.java;
  // "javascript"/"react"/"html"/"css"/"node" all imply the JS family
  if (has("node", "express")) return STACKS.node;
  if (has("react", "frontend", "front end", "html", "css", "javascript", "js", "vue", "angular"))
    return STACKS.frontend;
  if (has("java")) return STACKS.java; // after javascript is handled above
  if (has("sql", "database", "mysql", "postgres")) return STACKS.sql;
  return null; // no confident stack → skip jobs rather than guess
}

// ---------------------------------------------------------
// Helpers
// ---------------------------------------------------------

function extractReward(text) {
  const match = String(text || "").match(/\$\s?[\d,]+(\.\d+)?/);
  return match ? match[0].replace(/\s+/, "") : null;
}

function daysAgo(iso) {
  if (!iso) return null;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return null;
  return Math.max(0, Math.round((Date.now() - then) / (24 * 60 * 60 * 1000)));
}

function formatInrSalary(min) {
  if (!min || min < 100000) return null; // ignore missing / implausibly small
  return `₹${Math.round(min / 100000)}L+`;
}

function cacheKey(tech, concept) {
  return `${String(tech || "").toLowerCase()}::${String(concept || "").toLowerCase()}`;
}

// ---------------------------------------------------------
// GitHub — good-first-issues + bounties (concept-relevant, real links)
// ---------------------------------------------------------

function githubHeaders() {
  const headers = { Accept: "application/vnd.github+json" };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
}

function githubTechTerms(stack, tech, concept) {
  const parts = [];
  if (stack) parts.push(`language:${stack.githubLanguage}`);
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

async function fetchGithubIssues(stack, tech, concept) {
  try {
    const query = [
      'label:"good first issue"',
      "state:open",
      "type:issue",
      ...githubTechTerms(stack, tech, concept),
    ].join(" ");
    const items = await searchGithubIssues(query);
    return items.map((issue) => ({
      type: "issue",
      title: issue.title,
      org: (issue.repository_url || "").split("/").slice(-2).join("/"),
      url: issue.html_url,
      reward: null,
      postedDaysAgo: daysAgo(issue.created_at),
      tags: [tech].filter(Boolean),
      source: "github",
    }));
  } catch (err) {
    console.error("Opportunity fetch (github issues) error:", err.message);
    return [];
  }
}

async function fetchBounties(stack, tech, concept) {
  try {
    const query = [
      "label:bounty",
      "state:open",
      "type:issue",
      ...githubTechTerms(stack, tech, concept),
    ].join(" ");
    const items = await searchGithubIssues(query);
    return items.map((issue) => ({
      type: "bounty",
      title: issue.title,
      org: (issue.repository_url || "").split("/").slice(-2).join("/"),
      url: issue.html_url,
      reward: extractReward(issue.title),
      postedDaysAgo: daysAgo(issue.created_at),
      tags: [tech].filter(Boolean),
      source: "github-bounty",
    }));
  } catch (err) {
    console.error("Opportunity fetch (bounties) error:", err.message);
    return [];
  }
}

// ---------------------------------------------------------
// Adzuna — real, fresh jobs matched to the stack. Dormant until keys are set.
// India by default; senior roles excluded; freshness-filtered.
// ---------------------------------------------------------

function adzunaConfigured() {
  return Boolean(process.env.ADZUNA_APP_ID && process.env.ADZUNA_APP_KEY);
}

async function fetchAdzunaJobs(stack) {
  if (!stack || !adzunaConfigured()) return []; // no key → jobs stay dark

  const country = (process.env.ADZUNA_COUNTRY || "in").toLowerCase();
  try {
    const res = await axios.get(
      `https://api.adzuna.com/v1/api/jobs/${country}/search/1`,
      {
        params: {
          app_id: process.env.ADZUNA_APP_ID,
          app_key: process.env.ADZUNA_APP_KEY,
          what_or: stack.jobKeywords.join(" "),
          what_exclude: SENIOR_EXCLUDE.join(" "),
          max_days_old: 30,
          sort_by: "date",
          results_per_page: 6,
          "content-type": "application/json",
        },
        timeout: 6000,
      }
    );

    const items = res.data?.results || [];
    return items
      .filter(
        (job) =>
          // belt-and-suspenders: drop anything senior that slipped through
          !SENIOR_EXCLUDE.some((w) =>
            String(job.title || "").toLowerCase().includes(w)
          )
      )
      .slice(0, 5)
      .map((job) => ({
        type: /intern/i.test(job.title || "") ? "internship" : "job",
        title: job.title,
        org: job.company?.display_name || "Company",
        url: job.redirect_url,
        reward: formatInrSalary(job.salary_min),
        postedDaysAgo: daysAgo(job.created),
        tags: [job.category?.label].filter(Boolean),
        source: "adzuna",
      }));
  } catch (err) {
    console.error("Opportunity fetch (adzuna) error:", err.message);
    return [];
  }
}

// ---------------------------------------------------------
// Merge — round-robin so a cap never crowds out variety
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

  const stack = resolveStack(tech, concept);

  const [issues, bounties, jobs] = await Promise.all([
    fetchGithubIssues(stack, tech, concept),
    fetchBounties(stack, tech, concept),
    fetchAdzunaJobs(stack),
  ]);

  // Jobs first (highest motivation when they're real + stack-matched), then
  // bounties, then good-first-issues.
  const data = interleave([jobs, bounties, issues], MAX_RESULTS);

  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
  return data;
}

module.exports = { getOpportunities, resolveStack };
