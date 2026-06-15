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

function extractWhatBullets(whatSection) {
  return (whatSection.match(/^-\s+\*\*[^*]+\*\*[^\n]+/gm) || [])
    .map((line) => line.replace(/^-\s+/, "").trim())
    .filter((line) => line.length > 10);
}

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

function validateHowFlow(howSection, mappings, { beginner = false } = {}) {
  const how = howSection.toLowerCase();
  const errors = [];

  const numberedSteps = (howSection.match(/^\s*\d+\./gm) || []).length;
  if (numberedSteps < 3) {
    errors.push("How needs at least 3 numbered steps (1. 2. 3.)");
  }

  if (!beginner) {
    const mappingLabels = mappings.flatMap((m) => {
      const terms = [m.simple, m.tech.replace(/\*\*/g, "")];
      return terms
        .join(" ")
        .toLowerCase()
        .split(/\W+/)
        .filter((w) => w.length > 4);
    });
    const uniqueLabels = [...new Set(mappingLabels)];
    const referenced = uniqueLabels.filter((label) => how.includes(label));
    if (mappings.length >= 4 && referenced.length < 2) {
      errors.push(
        "How must reference technical terms or mapping labels from the What list"
      );
    }
  }

  const flowSignals = beginner
    ? [
        /read|write|user|browser|page|screen|see|show|display|click|apply|pick|choose|rule|style|send|receive|store|process|build|update/i,
        /step|first|then|next|finally|when|if|conflict|result|output|input/i,
      ]
    : [
        /provides? data|collect|store|warehouse|pipeline|raw data/i,
        /model|recipe|learn|predict/i,
        /dashboard|report|insight|plate|template|render|show/i,
      ];
  const flowHits = flowSignals.filter((p) => p.test(how)).length;
  const minHits = beginner ? 1 : 2;
  if (flowHits < minHits) {
    errors.push(
      beginner
        ? "How must walk through a clear step-by-step flow in plain language"
        : "How must explain a clear chain: data in → stored/processed → model/insight → shown to user"
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

function validateLessonQuality({
  explanation,
  technology,
  objectives = [],
  level = "beginner",
}) {
  const errors = [];
  const warnings = [];
  const beginner = (level || "beginner").toLowerCase() === "beginner";
  const minLength = beginner ? 650 : 700;

  if (!explanation || explanation.length < minLength) {
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

  const whatSection = extractSection(explanation, "What");
  const mappings = extractCastMappings(explanation);
  const ideaBullets = extractWhatBullets(whatSection);

  if (beginner) {
    if (ideaBullets.length < 3 && mappings.length < 3) {
      errors.push(
        "What section needs at least 3 plain-English idea bullets (**Label** — explanation)"
      );
    }
  } else if (mappings.length < 4) {
    errors.push(
      "What section needs at least 4 cast-mapping bullets (**X** = **Y** (role))"
    );
  }

  const tech = (technology || "").toLowerCase();
  const forbidden = FORBIDDEN_TERMS_BY_TECH[tech] || [];
  for (const p of forbidden) {
    if (p.test(explanation)) {
      errors.push(`Lesson contains off-topic term for ${technology} (${p})`);
    }
  }

  const howSection = extractSection(explanation, "How");
  errors.push(...validateHowFlow(howSection, mappings, { beginner }));

  const { errors: analogyErrors, primaryDomain } = validateAnalogyConsistency(explanation);
  errors.push(...analogyErrors);

  const hasAppUseCase = beginner
    ? /what you see|what the user sees|what happens behind|what happens internally|on the screen|on the app|on the website/i.test(
        explanation
      )
    : /what the user sees|what happens internally|user sees on|on the app|on the website/i.test(
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

function buildRepairPrompt(errors, technology, title, level = "beginner") {
  const beginner = (level || "beginner").toLowerCase() === "beginner";
  const whatRule = beginner
    ? "What must have 3-5 plain-English bullets (**Label** — explanation), NOT cast-mapping lines."
    : "What must have 4-6 cast-mapping bullets (**X** = **Y**).";

  return `Your previous lesson for ${technology} — "${title}" — failed quality checks. Rewrite the FULL lesson fixing ALL issues:

${errors.map((e, i) => `${i + 1}. ${e}`).join("\n")}

Keep Sai Mahendra tone. Same sections: **Why**, **What**, **How**, **Real-time use case**, **Key takeaway**${
    beginner ? "" : ", **Example**"
  }.
${whatRule} How must have 4-6 numbered steps with a clear flow and NO repeated sentences.${
    beginner
      ? " End **How** with one tiny fenced code snippet (3-6 lines, plain comments)."
      : " Include 1-2 small code snippets in **How** and an **Example** block tying steps together."
  }${
    beginner ? " Use plain English — avoid jargon walls." : ""
  }`;
}

module.exports = {
  extractCastMappings,
  extractWhatBullets,
  extractSection,
  detectAnalogyDomains,
  stripForbiddenTerms,
  validateLessonQuality,
  validateHowFlow,
  validateAnalogyConsistency,
  buildRepairPrompt,
  countHowRepetition,
};
