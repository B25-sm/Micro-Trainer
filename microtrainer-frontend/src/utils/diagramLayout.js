/** Grid layout for Groq wireframe node specs */

const MIN_NODE_W = 148;
const MAX_NODE_W = 220;
const GAP_X = 40;
const GAP_Y = 48;
const PAD = 28;
const CHAR_W = 6.5;
const MAX_LINES_PER_BLOCK = 4;

const LINE_H_LABEL = 13;
const LINE_H_TECH = 11;
const PAD_TOP = 14;
const PAD_BOTTOM = 10;
const LABEL_TECH_GAP = 6;

function measureNodeWidth(label, tech) {
  const labelLen = (label || "").length;
  const techLen = (tech || "").length;
  const longest = Math.max(labelLen, techLen);
  return Math.min(MAX_NODE_W, Math.max(MIN_NODE_W, Math.ceil(longest * CHAR_W) + 28));
}

function charsPerLine(width) {
  return Math.max(14, Math.floor((width - 24) / CHAR_W));
}

/**
 * Word-wrap text into complete lines (no mid-word chop). Extra content becomes
 * additional lines up to maxLines; only the last line gets "…" if still overflow.
 */
export function wrapLabel(text, maxChars = 18, maxLines = MAX_LINES_PER_BLOCK) {
  const t = (text || "").trim();
  if (!t) return [];
  if (t.length <= maxChars) return [t];

  const words = t.split(/\s+/);
  const lines = [];
  let line = "";

  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length <= maxChars) {
      line = next;
      continue;
    }
    if (line) lines.push(line);
    if (lines.length >= maxLines) break;
    if (word.length <= maxChars) {
      line = word;
    } else {
      lines.push(`${word.slice(0, maxChars - 1)}…`);
      line = "";
      if (lines.length >= maxLines) break;
    }
  }

  if (line && lines.length < maxLines) lines.push(line);

  if (lines.length > maxLines) {
    const trimmed = lines.slice(0, maxLines);
    const last = trimmed[maxLines - 1];
    trimmed[maxLines - 1] =
      last.length > maxChars - 1 ? `${last.slice(0, maxChars - 2)}…` : `${last}…`;
    return trimmed;
  }

  const used = lines.join(" ");
  if (used.length < t.length && lines.length > 0) {
    const last = lines[lines.length - 1];
    if (!last.endsWith("…")) {
      lines[lines.length - 1] =
        last.length > maxChars - 1 ? `${last.slice(0, maxChars - 2)}…` : `${last}…`;
    }
  }

  return lines;
}

function nodeHeight(labelLines, techLines) {
  const labelCount = labelLines.length || 1;
  const techCount = techLines.length;
  return (
    PAD_TOP +
    labelCount * LINE_H_LABEL +
    (techCount > 0 ? LABEL_TECH_GAP : 0) +
    techCount * LINE_H_TECH +
    PAD_BOTTOM
  );
}

export function layoutDiagram(diagram) {
  if (!diagram?.nodes?.length) {
    return { nodes: [], edges: [], width: 360, height: 220 };
  }

  const nodes = diagram.nodes.map((n) => {
    const col = Number(n.col) || 0;
    const row = Number(n.row) || 0;
    const w = measureNodeWidth(n.label, n.tech);
    const labelChars = charsPerLine(w);
    const techChars = charsPerLine(w);
    const labelLines = wrapLabel(n.label, labelChars, 2);
    const techLines = wrapLabel(n.tech, techChars, MAX_LINES_PER_BLOCK);
    const h = nodeHeight(labelLines, techLines);
    return {
      ...n,
      col,
      row,
      w,
      h,
      labelLines,
      techLines,
    };
  });

  const maxCol = Math.max(...nodes.map((n) => n.col));
  const maxRow = Math.max(...nodes.map((n) => n.row));

  const colWidths = [];
  for (let c = 0; c <= maxCol; c++) {
    colWidths[c] = Math.max(
      ...nodes.filter((n) => n.col === c).map((n) => n.w),
      MIN_NODE_W
    );
  }

  const rowHeights = [];
  for (let r = 0; r <= maxRow; r++) {
    rowHeights[r] = Math.max(
      ...nodes.filter((n) => n.row === r).map((n) => n.h),
      PAD_TOP + LINE_H_LABEL + PAD_BOTTOM
    );
  }

  let xCursor = PAD;
  const colX = [];
  for (let c = 0; c <= maxCol; c++) {
    colX[c] = xCursor;
    xCursor += colWidths[c] + GAP_X;
  }

  let yCursor = PAD;
  const rowY = [];
  for (let r = 0; r <= maxRow; r++) {
    rowY[r] = yCursor;
    yCursor += rowHeights[r] + GAP_Y;
  }

  const positioned = nodes.map((n) => {
    const x = colX[n.col];
    const y = rowY[n.row];
    const w = colWidths[n.col];
    const h = rowHeights[n.row];
    return {
      ...n,
      x,
      y,
      w,
      h,
      cx: x + w / 2,
      cy: y + h / 2,
    };
  });

  const width = xCursor - GAP_X + PAD;
  const height = yCursor - GAP_Y + PAD;

  const byId = Object.fromEntries(positioned.map((n) => [n.id, n]));
  const edges = (diagram.edges || [])
    .map((e) => {
      const from = byId[e.from];
      const to = byId[e.to];
      if (!from || !to) return null;
      return { ...e, from, to };
    })
    .filter(Boolean);

  return { nodes: positioned, edges, width, height };
}

export function edgePath(from, to) {
  const dx = to.cx - from.cx;
  const dy = to.cy - from.cy;
  const dist = Math.hypot(dx, dy) || 1;
  const ux = dx / dist;
  const uy = dy / dist;
  const startX = from.cx + ux * (from.w / 2 + 6);
  const startY = from.cy + uy * (from.h / 2 + 6);
  const endX = to.cx - ux * (to.w / 2 + 10);
  const endY = to.cy - uy * (to.h / 2 + 10);
  return { startX, startY, endX, endY, dx, dy };
}

/** Place edge label offset from line to reduce overlap */
export function edgeLabelPos(from, to, startX, startY, endX, endY) {
  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2;
  const dx = endX - startX;
  const dy = endY - startY;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  return { x: midX + nx * 12, y: midY + ny * 12 };
}

/** Y positions for label / tech lines inside a node */
export function nodeTextLayout(n) {
  const labelStartY = n.y + PAD_TOP + 10;
  const techStartY = n.y + PAD_TOP + n.labelLines.length * LINE_H_LABEL + LABEL_TECH_GAP + 8;
  return { labelStartY, techStartY };
}
