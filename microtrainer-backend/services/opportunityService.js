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
const MAX_RESULTS = 6;
const cache = new Map(); // "tech::concept" -> { data, expiresAt }

// Seniority we never surface to a learner. Word-boundary matched so short
// tokens ("sr", "head") don't match inside unrelated words ("headless").
const SENIOR_RE =
  /\b(senior|sr|lead|principal|staff|architect|manager|head|director)\b/i;

// ---------------------------------------------------------
// Stack model — the heart of relevance. Resolves whatever a surface knows
// (a technology name, an interview subject, a role, or free text) into a
// canonical stack with a GitHub language + India-oriented job keywords.
// ---------------------------------------------------------

// jobPhrase is the single exact phrase we send to Adzuna as `what_phrase`.
// Tested against the live India feed — an exact role phrase + relevance sort
// returns real, on-target roles; broad OR-queries return noise.
const STACKS = {
  mern: {
    label: "MERN / Full-stack JS",
    githubLanguage: "javascript",
    jobPhrase: "full stack developer",
  },
  frontend: {
    label: "Frontend",
    githubLanguage: "javascript",
    jobPhrase: "frontend developer",
  },
  node: {
    label: "Node / Backend JS",
    githubLanguage: "javascript",
    jobPhrase: "node js developer",
  },
  pythonFullstack: {
    label: "Python full-stack",
    githubLanguage: "python",
    jobPhrase: "python developer",
  },
  django: {
    label: "Django / Python",
    githubLanguage: "python",
    jobPhrase: "python developer",
  },
  python: {
    label: "Python",
    githubLanguage: "python",
    jobPhrase: "python developer",
  },
  java: {
    label: "Java",
    githubLanguage: "java",
    jobPhrase: "java developer",
  },
  sql: {
    label: "SQL / Data",
    githubLanguage: "sql",
    jobPhrase: "sql developer",
  },
};

// A real dev role's title says so. Requiring one of these drops tangential
// matches (professor / sales / operations) that slip past a loose phrase.
const DEV_TITLE_RE =
  /develop|engineer|programmer|software|full[\s-]?stack|front[\s-]?end|back[\s-]?end|react|python|java|node|sde/i;

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
  const tokens = topicTokens(tech, concept).slice(0, 4);
  if (tokens.length) parts.push(...tokens);
  return parts;
}

const RELEVANCE_STOP_WORDS = new Set([
  "what", "why", "when", "where", "which", "with", "from", "this", "that",
  "about", "explain", "example", "code", "using", "used", "does", "work",
]);

function topicTokens(tech, concept) {
  return String(concept || tech || "")
    .toLowerCase()
    .match(/[a-z0-9+#.]{3,}/g)?.filter((token) => !RELEVANCE_STOP_WORDS.has(token)) || [];
}

function isGithubIssueRelevant(issue, tech, concept) {
  const tokens = topicTokens(tech, concept);
  if (!tokens.length) return false;
  const technologyTokens = new Set([
    "react", "javascript", "typescript", "python", "java", "django", "node",
    "express", "frontend", "backend", "mern", "sql", "mysql", "postgres",
  ]);
  const specificTokens = tokens.filter((token) => !technologyTokens.has(token));
  const requiredTokens = specificTokens.length ? specificTokens : tokens;
  const labels = (issue.labels || []).map((label) => label?.name || label).join(" ");
  const haystack = `${issue.title || ""} ${issue.body || ""} ${labels} ${issue.repository_url || ""}`.toLowerCase();
  return requiredTokens.some((token) => haystack.includes(token));
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
    return items.filter((issue) => isGithubIssueRelevant(issue, tech, concept)).map((issue) => ({
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
    return items.filter((issue) => isGithubIssueRelevant(issue, tech, concept)).map((issue) => ({
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
          // Exact role phrase + IT category + relevance sort is what actually
          // returns on-target roles; date-sort or OR-queries return noise.
          what_phrase: stack.jobPhrase,
          category: "it-jobs",
          sort_by: "relevance",
          max_days_old: 30,
          results_per_page: 10,
          "content-type": "application/json",
        },
        timeout: 6000,
      }
    );

    const items = res.data?.results || [];
    return items
      .filter((job) => {
        const title = String(job.title || "");
        // Drop senior/lead roles, and anything whose title isn't a dev role.
        if (SENIOR_RE.test(title)) return false;
        return DEV_TITLE_RE.test(title);
      })
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
  // A language-agnostic concept such as "inheritance" or "authentication"
  // cannot be mapped to credible jobs/issues without knowing the stack.
  if (!stack) return [];

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

module.exports = { getOpportunities, resolveStack, isGithubIssueRelevant };
