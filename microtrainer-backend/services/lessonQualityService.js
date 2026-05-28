// =======================================================
// Lesson quality validation & cleanup (all guided courses)
// =======================================================

/** Framework terms that must NOT appear outside their stack */
const FORBIDDEN_TERMS_BY_TECH = {
  datascience: [
    /\bdjango\s+project\b/i,
    /\bdjango\s+app\b/i,
    /\bwaiter\b.*\bview\b/i,
    /\*\*waiter\*\*\s*=\s*\*\*view\*\*/i,
    /\bplated dish\b.*\*\*template\*\*.*html page/i,
    /\brestaurant building\b.*\*\*django/i,
  ],
  javascript: [/\bdjango\s+project\b/i, /\bspring\s+boot\b/i],
  python: [/\bdjango\s+project\b/i, /\breact\s+component\b/i],
  react: [/\bdjango\s+project\b/i, /\bmongodb\s+collection\b/i],
  django: [/\bembedding\s+model\b.*netflix/i], // optional loose
};

const ANALOGY_DOMAINS = [
  { id: "restaurant", patterns: [/restaurant/i, /\bchef\b/i, /\bwaiter\b/i, /kitchen/i, /recipe book/i] },
  { id: "hospital", patterns: [/hospital/i, /\bdoctor/i, /\bnurse/i, /patient/i, /readmission/i] },
  { id: "postoffice", patterns: [/post office/i, /mailbox/i, /postal/i] },
  { id: "factory", patterns: [/factory/i, /assembly line/i, /warehouse(?!.*data)/i] },
  { id: "school", patterns: [/classroom/i, /\bteacher\b/i, /\bstudent\b/i, /homework/i] },
];

function extractCastMappings(explanation) {
  return (explanation.match(/\*\*([^*]+)\*\*\s*=\s*([^\n]+)/g) || []).map((line) => {
    const m = line.match(/\*\*([^*]+)\*\*\s*=\s*(.+)/);
    if (!m) return null;
    return {
      simple: m[1].trim(),
      tech: m[2].replace(/\*\*/g, "").trim(),
      raw: line.trim(),
    };
  }).filter(Boolean);
}

function extractSection(explanation, name) {
  const re = new RegExp(
    `\\*\\*${name}\\*\\*([\\s\\S]*?)(?=\\*\\*(?:Why|What|How|Real-time use case|Key takeaway|Example)\\*\\*|$)`,
    "i"
  );
  const m = explanation.match(re);
  return m ? m[1].trim() : "";
}

function detectAnalogyDomains(text) {
  const lower = text.toLowerCase();
  return ANALOGY_DOMAINS.filter((d) =>
    d.patterns.some((p) => p.test(lower))
  ).map((d) => d.id);
}

function stripForbiddenTerms(text, technology) {
  const tech = (technology || "").toLowerCase().replace(/\.js$/, "");
  const patterns = FORBIDDEN_TERMS_BY_TECH[tech] || [];
  let out = text;
  for (const p of patterns) {
    if (p.test(out)) {
      console.warn(`⚠️ Lesson contained forbidden term for ${tech}: ${p}`);
    }
  }
  // Hard-remove common Django leak lines in non-django courses
  if (tech !== "django" && tech !== "springboot") {
    out = out
      .replace(/^- \*\*Restaurant building\*\* = \*\*Django project\*\*.*$/gim, "")
      .replace(/^- \*\*Kitchen station\*\* = \*\*Django app\*\*.*$/gim, "")
      .replace(/^- \*\*Waiter\*\* = \*\*View\*\*.*$/gim, "")
      .replace(/\*\*Restaurant building\*\* = \*\*Django project\*\*[^\n]*/gi, "")
      .replace(/\*\*Kitchen station\*\* = \*\*Django app\*\*[^\n]*/gi, "");
  }
  return out.replace(/\n{3,}/g, "\n\n").trim();
}

function countHowRepetition(howSection) {
  const lines = howSection
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 15);
  if (lines.length < 4) return { repetitive: false, ratio: 0 };

  const normalized = lines.map((l) =>
    l
      .toLowerCase()
      .replace(/\d+\./g, "")
      .replace(/\*\*/g, "")
      .replace(/\s+/g, " ")
      .trim()
  );
  const unique = new Set(normalized);
  const ratio = unique.size / normalized.length;
  return { repetitive: ratio < 0.55, ratio, lineCount: lines.length };
}

function validateHowFlow(howSection, mappings) {
  const how = howSection.toLowerCase();
  const errors = [];

  const numberedSteps = (howSection.match(/^\s*\d+\./gm) || []).length;
  if (numberedSteps < 3) {
    errors.push("How needs at least 3 numbered steps (1. 2. 3.)");
  }

  const mappingNames = mappings.map((m) => m.simple.toLowerCase());
  const referenced = mappingNames.filter((name) => how.includes(name.split(" ")[0]));
  if (mappings.length >= 4 && referenced.length < 2) {
    errors.push("How must reference cast names from the What list");
  }

  const flowSignals = [
    /provides? data|collect|store|warehouse|pipeline|raw data/i,
    /model|recipe|learn|predict/i,
    /dashboard|report|insight|plate|template|render|show/i,
  ];
  const flowHits = flowSignals.filter((p) => p.test(how)).length;
  if (flowHits < 2) {
    errors.push(
      "How must explain a clear chain: data in → stored/processed → model/insight → shown to user"
    );
  }

  const { repetitive } = countHowRepetition(howSection);
  if (repetitive) {
    errors.push(
      "How repeats the same sentence — each numbered step must add a NEW step in the flow"
    );
  }

  return errors;
}

function validateAnalogyConsistency(explanation) {
  const errors = [];
  const why = extractSection(explanation, "Why");
  const what = extractSection(explanation, "What");
  const how = extractSection(explanation, "How");
  const realtime = extractSection(explanation, "Real-time use case");

  const whyDomains = detectAnalogyDomains(why);
  const whatDomains = detectAnalogyDomains(what);
  const howDomains = detectAnalogyDomains(how);

  const storyDomains = [...new Set([...whyDomains, ...whatDomains, ...howDomains])];
  if (storyDomains.length > 1) {
    errors.push(
      `Mixed analogies in one lesson (${storyDomains.join(" + ")}) — use ONE setting only in Why/What/How`
    );
  }

  const rtDomains = detectAnalogyDomains(realtime);
  if (rtDomains.length > 0 && /chef|waiter|kitchen|hospital ward/i.test(realtime)) {
    errors.push("Real-time use case must use a real app only — no story analogy there");
  }

  return { errors, primaryDomain: storyDomains[0] || null };
}

function validateLessonQuality({ explanation, technology, objectives = [] }) {
  const errors = [];
  const warnings = [];

  if (!explanation || explanation.length < 700) {
    errors.push(`Lesson too short (${explanation?.length || 0} chars)`);
  }

  const hasStructure =
    /\*\*Why\*\*/i.test(explanation) &&
    /\*\*What\*\*/i.test(explanation) &&
    /\*\*How\*\*/i.test(explanation) &&
    /\*\*Real-time use case\*\*/i.test(explanation);

  if (!hasStructure) {
    errors.push("Missing required sections: Why, What, How, Real-time use case");
  }

  const mappings = extractCastMappings(explanation);
  if (mappings.length < 4) {
    errors.push("What section needs at least 4 cast-mapping bullets (**X** = **Y** (role))");
  }

  const tech = (technology || "").toLowerCase();
  const forbidden = FORBIDDEN_TERMS_BY_TECH[tech] || [];
  for (const p of forbidden) {
    if (p.test(explanation)) {
      errors.push(`Lesson contains off-topic term for ${technology} (${p})`);
    }
  }

  const howSection = extractSection(explanation, "How");
  errors.push(...validateHowFlow(howSection, mappings));

  const { errors: analogyErrors, primaryDomain } = validateAnalogyConsistency(explanation);
  errors.push(...analogyErrors);

  const hasAppUseCase =
    /what the user sees|what happens internally|user sees on|on the app|on the website/i.test(
      explanation
    );
  if (!hasAppUseCase) {
    errors.push("Real-time use case missing user-visible vs internal pattern");
  }

  if (objectives.length > 0 && howSection.length < 400) {
    warnings.push("How section may be too thin for the number of learning objectives");
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    mappings,
    primaryDomain,
    castNames: mappings.map((m) => m.simple),
  };
}

function buildRepairPrompt(errors, technology, title) {
  return `Your previous lesson for ${technology} — "${title}" — failed quality checks. Rewrite the FULL lesson fixing ALL issues:

${errors.map((e, i) => `${i + 1}. ${e}`).join("\n")}

Keep Sai Mahendra tone. Same sections: **Why**, **What**, **How**, **Real-time use case**, **Key takeaway**.
Use ONE analogy domain only. How must have 4-6 numbered steps with a clear data/process chain and NO repeated sentences.`;
}

module.exports = {
  extractCastMappings,
  extractSection,
  detectAnalogyDomains,
  stripForbiddenTerms,
  validateLessonQuality,
  validateHowFlow,
  validateAnalogyConsistency,
  buildRepairPrompt,
  countHowRepetition,
};
