// =======================================================
// Context-window management — keeps requests to Grok within a char budget
// by dropping the oldest turns first. Tokens are approximated as chars/4
// (no tokenizer dependency); this is a heuristic, not an exact count.
// =======================================================

const CHARS_PER_TOKEN = 4;

/**
 * Build the `messages` array to send to Grok: a system prompt followed by
 * as much recent conversation history as fits in the budget.
 *
 * @param {Array} messages - full stored conversation messages (role/content)
 * @param {object} opts
 * @param {string} opts.systemPrompt
 * @param {number} opts.maxChars - approx char budget for history (excludes system prompt)
 * @param {number} opts.minKeep - always keep at least this many most-recent turns
 */
// Merge the displayed text with any model-only context (extracted document
// text / image notes) into the single string the model actually receives.
function messageText(m) {
  return [m.content, m.contextText].filter((s) => s && s.trim()).join("\n\n");
}

function buildContextWindow(messages, { systemPrompt, maxChars = 24000, minKeep = 4 } = {}) {
  const usable = messages
    .map((m) => ({ role: m.role, content: messageText(m) }))
    .filter((m) => m.content.trim());

  let kept = [...usable];
  let totalChars = kept.reduce((sum, m) => sum + m.content.length, 0);

  while (kept.length > minKeep && totalChars > maxChars) {
    const dropped = kept.shift();
    totalChars -= dropped.content.length;
  }

  return systemPrompt
    ? [{ role: "system", content: systemPrompt }, ...kept]
    : kept;
}

function estimateTokens(text) {
  return Math.ceil((text || "").length / CHARS_PER_TOKEN);
}

module.exports = { buildContextWindow, estimateTokens };
