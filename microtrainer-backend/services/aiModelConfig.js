const QUALITY_MODEL =
  process.env.GROQ_QUALITY_MODEL ||
  process.env.GROQ_CHAT_MODEL ||
  process.env.GROQ_MODEL ||
  "openai/gpt-oss-120b";

const FAST_MODEL =
  process.env.GROQ_FAST_MODEL ||
  process.env.GROQ_MODEL ||
  "openai/gpt-oss-20b";

module.exports = { QUALITY_MODEL, FAST_MODEL };
