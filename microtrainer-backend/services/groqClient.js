// =======================================================
// Central Groq API client — queue, retries, rate-limit aware
// =======================================================

const axios = require("axios");
const path = require("path");

let groqQueue = Promise.resolve();

function loadGroqKey() {
  let key = process.env.GROQ_API_KEY;
  if (!key) {
    require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
    key = process.env.GROQ_API_KEY;
  }
  return (key || "").trim();
}

function parseRetryAfterMs(err) {
  const msg = err.response?.data?.error?.message || err.message || "";
  const match = msg.match(/try again in ([\d.]+)s/i);
  if (match) {
    return Math.ceil(parseFloat(match[1]) * 1000) + 1500;
  }
  return null;
}

function formatGroqError(err) {
  if (err.response) {
    const status = err.response.status;
    const msg = err.response.data?.error?.message || err.message;
    if (status === 401) {
      return "Invalid GROQ API key. Add GROQ_API_KEY to your backend host (Render → Environment), then redeploy. Local: microtrainer-backend/.env";
    }
    if (status === 429) {
      const waitSec = parseRetryAfterMs(err);
      if (waitSec) {
        return `AI is busy (rate limit). Wait about ${Math.round(waitSec / 1000)} seconds and try again.`;
      }
      return "AI is busy (rate limit). Wait 20 seconds and refresh the page.";
    }
    if (status === 503 || status === 502) {
      return "Groq servers are busy. Try again in a few seconds.";
    }
    return `Groq API error (${status}): ${msg}`;
  }
  if (err.code === "ECONNABORTED") {
    return "Request timed out. Check your internet connection.";
  }
  if (err.code === "ENOTFOUND" || err.code === "ECONNREFUSED") {
    return "Cannot reach Groq API. Check internet / firewall.";
  }
  return err.message || "Unknown Groq error";
}

function isRateLimitError(err) {
  return err?.response?.status === 429;
}

/**
 * Serialize Groq calls so lesson + quiz don't burst the same TPM window.
 */
async function callGroq(payload, retries = 5) {
  const run = async () => {
    const key = loadGroqKey();
    if (!key) {
      throw new Error(
        "GROQ_API_KEY is missing. Set it on your backend host (e.g. Render Environment) or in microtrainer-backend/.env for local dev, then restart."
      );
    }

    let lastError;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await axios.post(
          "https://api.groq.com/openai/v1/chat/completions",
          payload,
          {
            headers: {
              Authorization: `Bearer ${key}`,
              "Content-Type": "application/json",
            },
            timeout: 60000,
          }
        );
      } catch (err) {
        lastError = err;
        if (attempt < retries) {
          const parsedWait = parseRetryAfterMs(err);
          const waitMs =
            parsedWait ||
            (isRateLimitError(err) ? 18000 : 1200 * (attempt + 1));
          console.warn(
            `⚠️ Groq ${attempt + 1}/${retries + 1} failed — waiting ${Math.round(waitMs / 1000)}s (${formatGroqError(err)})`
          );
          await new Promise((r) => setTimeout(r, waitMs));
        }
      }
    }

    const formatted = formatGroqError(lastError);
    const rateErr = new Error(formatted);
    rateErr.isRateLimit = isRateLimitError(lastError);
    rateErr.retryAfterMs = parseRetryAfterMs(lastError) || 20000;
    throw rateErr;
  };

  groqQueue = groqQueue.then(run, run);
  return groqQueue;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function testGroqConnection() {
  const response = await callGroq({
    model: "llama-3.1-8b-instant",
    messages: [{ role: "user", content: "Reply with exactly: ok" }],
    max_tokens: 5,
    temperature: 0,
  });
  return {
    ok: true,
    model: "llama-3.1-8b-instant",
    reply: response?.data?.choices?.[0]?.message?.content?.trim() || "",
  };
}

module.exports = {
  callGroq,
  loadGroqKey,
  formatGroqError,
  isRateLimitError,
  testGroqConnection,
  sleep,
};
