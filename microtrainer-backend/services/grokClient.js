// =======================================================
// Central Grok (xAI) API client — non-streaming + streaming
// =======================================================

const axios = require("axios");
const path = require("path");

const GROK_BASE_URL = "https://api.x.ai/v1/chat/completions";

// Models this backend allows a client to request; anything else is clamped
// to the default so a caller can never point the server at an arbitrary model.
const ALLOWED_MODELS = ["grok-4-latest", "grok-3-mini"];
const DEFAULT_MODEL = "grok-4-latest";

function loadGrokKey() {
  let key = process.env.GROK_API_KEY;
  if (!key) {
    require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
    key = process.env.GROK_API_KEY;
  }
  return (key || "").trim();
}

function resolveModel(model) {
  return ALLOWED_MODELS.includes(model) ? model : DEFAULT_MODEL;
}

function clampTemperature(temperature) {
  const n = Number(temperature);
  if (!Number.isFinite(n)) return 0.7;
  return Math.min(2, Math.max(0, n));
}

function formatGrokError(err) {
  if (err.response) {
    const status = err.response.status;
    const msg = err.response.data?.error?.message || err.message;
    if (status === 401) {
      return "Invalid GROK API key. Add GROK_API_KEY to your backend host, then restart. Local: microtrainer-backend/.env";
    }
    if (status === 429) {
      return "Grok is busy (rate limit). Wait a few seconds and try again.";
    }
    if (status === 503 || status === 502) {
      return "Grok servers are busy. Try again in a few seconds.";
    }
    return `Grok API error (${status}): ${msg}`;
  }
  if (err.name === "AbortError") {
    return "Request was stopped.";
  }
  if (err.code === "ECONNABORTED") {
    return "Request timed out. Check your internet connection.";
  }
  if (err.code === "ENOTFOUND" || err.code === "ECONNREFUSED") {
    return "Cannot reach Grok API. Check internet / firewall.";
  }
  return err.message || "Unknown Grok error";
}

/**
 * Non-streaming call — used for cheap one-off tasks like title generation.
 */
async function callGrokOnce({ messages, model, maxTokens = 20, temperature = 0.4 }) {
  const key = loadGrokKey();
  if (!key) {
    throw new Error(
      "GROK_API_KEY is missing. Set it on your backend host or in microtrainer-backend/.env for local dev, then restart."
    );
  }

  try {
    const response = await axios.post(
      GROK_BASE_URL,
      {
        model: resolveModel(model),
        messages,
        max_tokens: maxTokens,
        temperature: clampTemperature(temperature),
        stream: false,
      },
      {
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        timeout: 20000,
      }
    );
    return response.data?.choices?.[0]?.message?.content?.trim() || "";
  } catch (err) {
    throw new Error(formatGrokError(err));
  }
}

/**
 * Streaming call — returns the raw fetch Response so the caller can read
 * response.body as Server-Sent Events coming from xAI (OpenAI-compatible
 * format: lines like `data: {...}` ending with `data: [DONE]`).
 */
async function streamGrokChat({ messages, model, temperature, maxTokens, signal }) {
  const key = loadGrokKey();
  if (!key) {
    throw new Error(
      "GROK_API_KEY is missing. Set it on your backend host or in microtrainer-backend/.env for local dev, then restart."
    );
  }

  const response = await fetch(GROK_BASE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: resolveModel(model),
      messages,
      temperature: clampTemperature(temperature),
      max_tokens: maxTokens || 4096,
      stream: true,
      stream_options: { include_usage: true },
    }),
    signal,
  });

  if (!response.ok || !response.body) {
    let detail = "";
    try {
      detail = await response.text();
    } catch {
      /* ignore */
    }
    const err = new Error(
      `Grok API error (${response.status}): ${detail || response.statusText}`
    );
    err.status = response.status;
    throw err;
  }

  return response;
}

module.exports = {
  ALLOWED_MODELS,
  DEFAULT_MODEL,
  loadGrokKey,
  resolveModel,
  clampTemperature,
  formatGrokError,
  callGrokOnce,
  streamGrokChat,
};
