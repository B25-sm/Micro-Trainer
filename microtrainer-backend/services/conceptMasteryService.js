// =======================================================
// 🧠 CONCEPT MASTERY ENGINE
// Judges a student's UNDERSTANDING of each concept from every graded
// answer they give anywhere in the app (interview, guided quiz,
// quick-check, coding problem, assessment). Each answer nudges a
// confidence-weighted, recency-decayed mastery score per concept, which
// rolls up into a per-technology understanding band + trend + the
// specific weak concepts. Fully explainable — no black box.
//
// Fed from ONE choke-point: studentLearningLedgerService.appendEvent ->
// syncConceptMastery(). So the whole app contributes automatically.
// =======================================================

const fs = require("fs");
const path = require("path");
const { extractConcept } = require("./conceptExtractionService");

const DATA_DIR = path.join(__dirname, "../data/progress");
const STORE_FILE = path.join(DATA_DIR, "concept-mastery.json");

// How much a single answer of each type counts toward confidence. Deeper
// probes (explain in an interview, apply in code) are stronger evidence of
// real understanding than a light recognition check.
const DEPTH_WEIGHT = {
  interview: 1.0, // explanation
  coding_problem: 1.0, // application
  guided_quiz: 0.8,
  mini_assessment: 0.7,
  ask_quick_check: 0.6,
};

const CONF_CAP = 12; // confidence saturates — avoids one topic dominating forever
const PASS_THRESHOLD = 60;

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

let store = {};
try {
  if (fs.existsSync(STORE_FILE)) {
    store = JSON.parse(fs.readFileSync(STORE_FILE, "utf8")) || {};
  }
} catch (err) {
  console.error("Concept mastery load error:", err.message);
  store = {};
}

let saveTimer = null;
function persist() {
  // Debounced write — scored answers aren't high-frequency, but batching
  // avoids hammering disk during a backfill replay.
  if (saveTimer) return;
  saveTimer = setTimeout(() => {
    saveTimer = null;
    try {
      fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2));
    } catch (err) {
      console.error("Concept mastery save error:", err.message);
    }
  }, 800);
}

/** Older evidence loses weight so mastery reflects the student TODAY. */
function decayFactor(lastUpdated) {
  if (!lastUpdated) return 1;
  const ageDays = (Date.now() - new Date(lastUpdated).getTime()) / 86400000;
  if (ageDays <= 7) return 1;
  if (ageDays <= 30) return 0.9;
  if (ageDays <= 90) return 0.75;
  return 0.6;
}

function masteryToBand(mastery, attempts) {
  if (!attempts) return "Not assessed";
  if (mastery >= 75) return "Good";
  if (mastery >= 50) return "Average";
  return "Weak";
}

function confidenceLabel(confidence) {
  if (confidence >= 6) return "high";
  if (confidence >= 2.5) return "medium";
  return "low";
}

/** Trend from the recent history tail: improving / declining / steady. */
function trendFromHistory(history) {
  const h = (history || []).map((x) => x.u);
  if (h.length < 4) return "steady";
  const half = Math.floor(h.length / 2);
  const older = h.slice(0, half);
  const recent = h.slice(half);
  const avg = (a) => a.reduce((s, v) => s + v, 0) / a.length;
  const delta = avg(recent) - avg(older);
  if (delta >= 8) return "improving";
  if (delta <= -8) return "declining";
  return "steady";
}

function studentBucket(studentId) {
  if (!store[studentId]) {
    store[studentId] = { concepts: {}, backfilled: false, lastEventTs: null, updatedAt: null };
  }
  return store[studentId];
}

/**
 * Apply one graded answer to the mastery model.
 * @param {object} record - a ledger event (needs studentId, technology, score 0-100)
 * @returns {boolean} whether it was applied
 */
function applySignal(record) {
  if (!record || !record.studentId || record.studentId === "anonymous") return false;
  if (record.source === "behavior") return false;
  if (record.score == null || Number.isNaN(Number(record.score))) return false;

  const bucket = studentBucket(record.studentId);
  const ts = record.timestamp || new Date().toISOString();
  // Monotonic guard so live + backfill never double-count the same answer.
  if (bucket.lastEventTs && new Date(ts) <= new Date(bucket.lastEventTs)) return false;

  const understanding = Math.max(0, Math.min(100, Number(record.score)));
  const depthW = DEPTH_WEIGHT[record.activityType] ?? 0.5;
  const { slug, label } = extractConcept(
    record.technology,
    record.topic || record.conceptId || ""
  );
  const key = `${record.technology}::${slug}`;

  const existing = bucket.concepts[key];
  if (!existing) {
    bucket.concepts[key] = {
      technology: record.technology,
      slug,
      label,
      mastery: understanding,
      confidence: depthW,
      attempts: 1,
      correct: understanding >= PASS_THRESHOLD ? 1 : 0,
      lastUpdated: ts,
      history: [{ t: ts, u: understanding }],
    };
  } else {
    const decayedConf = existing.confidence * decayFactor(existing.lastUpdated);
    existing.mastery = Math.round(
      (existing.mastery * decayedConf + understanding * depthW) / (decayedConf + depthW)
    );
    existing.confidence = Math.min(CONF_CAP, decayedConf + depthW);
    existing.attempts += 1;
    existing.correct += understanding >= PASS_THRESHOLD ? 1 : 0;
    existing.lastUpdated = ts;
    existing.history.push({ t: ts, u: understanding });
    if (existing.history.length > 20) existing.history = existing.history.slice(-20);
    if (label && label.length > (existing.label || "").length) existing.label = label;
  }

  bucket.lastEventTs = ts;
  bucket.updatedAt = new Date().toISOString();
  return true;
}

/** Replay a student's historical ledger answers the first time we need them. */
function ensureBackfilled(studentId) {
  const bucket = studentBucket(studentId);
  if (bucket.backfilled) return;

  try {
    const { getEventsForStudent } = require("./studentLearningLedgerService");
    const events = getEventsForStudent(studentId, { limit: 100000 })
      .filter((e) => e.score != null && e.source !== "behavior")
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    for (const e of events) applySignal(e);
  } catch (err) {
    console.error("Concept mastery backfill error:", err.message);
  }

  bucket.backfilled = true;
  persist();
}

/**
 * Live hook — called from appendEvent for every ledger write. Only applies
 * incremental updates AFTER the student has been backfilled, so we never
 * process the same historical answer twice.
 */
function syncConceptMastery(record) {
  try {
    if (!record || record.source === "behavior" || record.score == null) return;
    const bucket = store[record.studentId];
    if (!bucket || !bucket.backfilled) return; // backfill will pick this up later
    if (applySignal(record)) persist();
  } catch (err) {
    console.error("syncConceptMastery error:", err.message);
  }
}

function conceptView(c) {
  return {
    slug: c.slug,
    label: c.label,
    mastery: c.mastery,
    band: masteryToBand(c.mastery, c.attempts),
    attempts: c.attempts,
    accuracy: c.attempts ? Math.round((c.correct / c.attempts) * 100) : 0,
    confidence: confidenceLabel(c.confidence),
    trend: trendFromHistory(c.history),
    lastUpdated: c.lastUpdated,
  };
}

/**
 * Full understanding picture for a student, grouped by technology.
 * @returns {{studentId, technologies: Array, topWeakConcepts: Array, updatedAt}}
 */
function getStudentMastery(studentId) {
  ensureBackfilled(studentId);
  const bucket = store[studentId];
  const concepts = Object.values(bucket?.concepts || {});

  const byTech = {};
  for (const c of concepts) {
    (byTech[c.technology] = byTech[c.technology] || []).push(c);
  }

  const technologies = Object.entries(byTech)
    .map(([technology, list]) => {
      let wSum = 0;
      let wTot = 0;
      let attempts = 0;
      for (const c of list) {
        const w = Math.max(0.5, c.confidence);
        wSum += c.mastery * w;
        wTot += w;
        attempts += c.attempts;
      }
      const mastery = wTot > 0 ? Math.round(wSum / wTot) : 0;
      const conceptViews = list
        .map(conceptView)
        .sort((a, b) => a.mastery - b.mastery);
      return {
        technology,
        mastery,
        band: masteryToBand(mastery, attempts),
        attempts,
        conceptCount: list.length,
        weakConcepts: conceptViews.filter((c) => c.mastery < 50),
        strongConcepts: conceptViews.filter((c) => c.mastery >= 75),
        concepts: conceptViews,
        trend: trendFromHistory(
          list.flatMap((c) => c.history).sort((a, b) => new Date(a.t) - new Date(b.t))
        ),
      };
    })
    .sort((a, b) => b.mastery - a.mastery);

  const topWeakConcepts = concepts
    .filter((c) => c.mastery < 50 && c.attempts >= 1)
    .sort((a, b) => a.mastery - b.mastery)
    .slice(0, 6)
    .map((c) => ({ technology: c.technology, label: c.label, mastery: c.mastery }));

  return {
    studentId,
    technologies,
    topWeakConcepts,
    hasData: concepts.length > 0,
    updatedAt: bucket?.updatedAt || null,
  };
}

/** Compact per-technology mastery map, used to enrich the placement scorecard. */
function getTechnologyMasteryMap(studentId) {
  const view = getStudentMastery(studentId);
  const map = {};
  for (const t of view.technologies) {
    map[t.technology] = {
      mastery: t.mastery,
      band: t.band,
      attempts: t.attempts,
      weakConcepts: t.weakConcepts.map((c) => c.label),
      trend: t.trend,
    };
  }
  return { map, topWeakConcepts: view.topWeakConcepts };
}

module.exports = {
  syncConceptMastery,
  getStudentMastery,
  getTechnologyMasteryMap,
  masteryToBand,
  DEPTH_WEIGHT,
};
