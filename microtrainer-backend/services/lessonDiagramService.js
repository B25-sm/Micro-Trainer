/**
 * Groq-generated wireframe diagram specs for guided lessons.
 * Returns structured JSON — frontend renders as SVG (no image APIs).
 */

const { callGroq } = require("./groqClient");
const { QUALITY_MODEL } = require("./aiModelConfig");

const DIAGRAM_SCHEMA = `{
  "title": "short diagram title",
  "subtitle": "one line what this shows",
  "nodes": [
    { "id": "a", "label": "simple name", "tech": "Technical term", "row": 0, "col": 0 }
  ],
  "edges": [
    { "from": "a", "to": "b", "label": "optional arrow label" }
  ]
}`;

/** Truncate at word boundary so wireframes never show cut-off phrases like "requests and re". */
function truncateAtWord(text, maxLen) {
  const t = String(text || "").trim();
  if (t.length <= maxLen) return t;
  const cut = t.slice(0, maxLen);
  const lastSpace = cut.lastIndexOf(" ");
  if (lastSpace > Math.floor(maxLen * 0.45)) {
    return `${cut.slice(0, lastSpace)}…`;
  }
  return `${cut.slice(0, maxLen - 1)}…`;
}

function parseJsonFromGroq(raw) {
  let text = (raw || "").trim();
  text = text.replace(/^```json?\s*/i, "").replace(/```\s*$/i, "").trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON in diagram response");
  return JSON.parse(text.slice(start, end + 1));
}

function normalizeDiagram(parsed, fallbackTitle) {
  const nodes = (parsed.nodes || [])
    .filter((n) => n && n.id && n.label)
    .slice(0, 8)
    .map((n, i) => ({
      id: String(n.id).replace(/\s+/g, "_"),
      label: truncateAtWord(String(n.label), 28),
      tech: truncateAtWord(String(n.tech || n.sublabel || ""), 52),
      row: Number.isFinite(Number(n.row)) ? Number(n.row) : Math.floor(i / 2),
      col: Number.isFinite(Number(n.col)) ? Number(n.col) : i % 2,
    }));

  const idSet = new Set(nodes.map((n) => n.id));
  const edges = (parsed.edges || [])
    .filter((e) => e && idSet.has(e.from) && idSet.has(e.to))
    .slice(0, 10)
    .map((e) => ({
      from: e.from,
      to: e.to,
      label: e.label ? String(e.label).slice(0, 24) : "",
    }));

  if (nodes.length < 2) {
    throw new Error("Diagram needs at least 2 nodes");
  }

  return {
    title: String(parsed.title || fallbackTitle).slice(0, 60),
    subtitle: String(parsed.subtitle || "Concept wireframe").slice(0, 80),
    nodes,
    edges: edges.length ? edges : autoChainEdges(nodes),
  };
}

function autoChainEdges(nodes) {
  const edges = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    edges.push({ from: nodes[i].id, to: nodes[i + 1].id, label: "" });
  }
  return edges;
}

/** Build a simple left-to-right wireframe from cast-mapping bullets */
function buildDiagramFallback(lucidExplanation, title) {
  const mappings = (lucidExplanation.match(/\*\*([^*]+)\*\*\s*=\s*([^\n(]+)/g) || [])
    .slice(0, 6)
    .map((line, i) => {
      const m = line.match(/\*\*([^*]+)\*\*\s*=\s*(.+)/);
      if (!m) return null;
      const techPart = m[2].replace(/\*\*/g, "").trim();
      const tech = truncateAtWord(techPart.split("(")[0].trim(), 52);
      return {
        id: `n${i}`,
        label: m[1].trim().slice(0, 28),
        tech,
        row: 0,
        col: i,
      };
    })
    .filter(Boolean);

  if (mappings.length >= 2) {
    return {
      title: `${title} — at a glance`,
      subtitle: "Cast → tech (from your lesson)",
      nodes: mappings,
      edges: autoChainEdges(mappings),
    };
  }

  return {
    title: title.slice(0, 60),
    subtitle: "Core flow",
    nodes: [
      { id: "n0", label: "Input", tech: "Request / User", row: 0, col: 0 },
      { id: "n1", label: "Process", tech: truncateAtWord(title, 52), row: 0, col: 1 },
      { id: "n2", label: "Output", tech: "Response / UI", row: 0, col: 2 },
    ],
    edges: [
      { from: "n0", to: "n1", label: "" },
      { from: "n1", to: "n2", label: "" },
    ],
  };
}

async function generateLessonDiagram({ technology, title, lucidExplanation }) {
  const prompt = `You design minimal student wireframes for programming lessons.

Technology: ${technology}
Concept: ${title}

Lesson (use the SAME cast names and technical terms from this lesson):
${lucidExplanation.substring(0, 2400)}

Create a simple wireframe diagram students can sketch in rough notes.

RULES:
- 3 to 6 nodes max — boxes with a simple label + tech term
- Use ONLY cast names from the lesson's **What** mapping list — same analogy world as the lesson (if lesson uses hospital, diagram uses hospital terms; if restaurant, use restaurant — never mix)
- NEVER introduce Django/View/Template unless the lesson is about Django
- Keep "label" SHORT (1-3 words). Put detail in "tech"
- Keep "tech" a COMPLETE short phrase (under ~45 characters). Never end mid-word
- Nodes should follow the lesson's How flow order (data in → storage → model → output)
- "row" and "col" are grid positions (0-based). Prefer one row (row:0) left-to-right for flows, or two rows for MVC-style
- "edges" show flow with short optional labels (e.g. "request", "data", "HTML")
- Wireframe style only — no colors, no icons, no artistic descriptions
- Match the lesson mapping list if present

Return ONLY valid JSON matching this schema:
${DIAGRAM_SCHEMA}`;

  try {
    const response = await callGroq({
      model: QUALITY_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You output only valid JSON wireframe specs. No markdown. No explanation.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.35,
      max_tokens: 650,
    });

    const parsed = parseJsonFromGroq(
      response?.data?.choices?.[0]?.message?.content || ""
    );
    return normalizeDiagram(parsed, title);
  } catch (err) {
    console.warn("Lesson diagram Groq failed, using fallback:", err.message);
    return buildDiagramFallback(lucidExplanation, title);
  }
}

module.exports = {
  generateLessonDiagram,
  buildDiagramFallback,
  normalizeDiagram,
  truncateAtWord,
};
