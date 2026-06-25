/**
 * Student bug / inconvenience reports → email trainers, Sheets, local log
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { sendEmail } = require("./emailService");
const { logFeedbackReport } = require("./sheetsService");

const DATA_DIR = path.join(__dirname, "..", "data");
const FEEDBACK_LOG = path.join(DATA_DIR, "feedback-reports.jsonl");
const SCREENSHOTS_DIR = path.join(DATA_DIR, "feedback-screenshots");

const MAX_SCREENSHOTS = 3;
const MAX_SCREENSHOT_BYTES = 2.5 * 1024 * 1024;
const ALLOWED_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
]);

/** @type {Map<string, { count: number, resetAt: number }>} */
const rateLimit = new Map();
const RATE_LIMIT_MAX = 8;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

function getBugReportRecipients() {
  const set = new Set();
  const explicit = process.env.BUG_REPORT_EMAIL?.trim();
  if (explicit) {
    explicit.split(",").forEach((e) => {
      const t = e.trim().toLowerCase();
      if (t) set.add(t);
    });
  }
  (process.env.TRAINER_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
    .forEach((e) => set.add(e));
  return [...set];
}

function rateLimitKey(authUser, req = {}) {
  return (
    authUser?.studentId ||
    authUser?.email ||
    authUser?.sub ||
    req.ip ||
    "anonymous"
  );
}

function checkRateLimit(key) {
  const now = Date.now();
  let entry = rateLimit.get(key);
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };
    rateLimit.set(key, entry);
  }
  entry.count += 1;
  if (entry.count > RATE_LIMIT_MAX) {
    return false;
  }
  return true;
}

function appendLocalLog(record) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.appendFileSync(FEEDBACK_LOG, `${JSON.stringify(record)}\n`, "utf8");
    return true;
  } catch (e) {
    console.warn("⚠️  Feedback local log failed:", e.message);
    return false;
  }
}

function escapeHtml(text) {
  return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function withTimeout(promise, ms, label = "operation") {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(
        () => reject(new Error(`${label} timed out after ${ms}ms`)),
        ms
      );
    }),
  ]);
}

async function deliverFeedbackReport(record, savedScreenshots) {
  let sheetsLogged = false;
  try {
    sheetsLogged = await withTimeout(
      logFeedbackReport(record),
      12_000,
      "Google Sheets"
    );
  } catch (e) {
    console.warn("⚠️  Feedback sheets delivery:", e.message);
  }

  const recipients = getBugReportRecipients();
  let emailSent = false;

  if (recipients.length > 0) {
    const { reportId, timestamp, studentId, email, name, role } = record;
    const subject = `[MicroTrainer] Issue — ${record.pagePath || "app"} (${studentId})`;
    const inlineImages = savedScreenshots
      .map((shot, index) => {
        return `<p><strong>Screenshot ${index + 1}:</strong></p><img src="cid:screenshot${index}" alt="Screenshot ${index + 1}" style="max-width:100%;border:1px solid #e5e7eb;border-radius:8px;" />`;
      })
      .join("");

    const html = `
      <h2>Student issue report</h2>
      <p><strong>Time:</strong> ${escapeHtml(timestamp)}</p>
      <p><strong>Student:</strong> ${escapeHtml(name)} (${escapeHtml(studentId)})</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Role:</strong> ${escapeHtml(role)}</p>
      <p><strong>Page:</strong> <a href="${escapeHtml(record.pageUrl)}">${escapeHtml(record.pagePath || record.pageUrl)}</a></p>
      <p><strong>Screenshots:</strong> ${savedScreenshots.length}</p>
      <hr/>
      <p><strong>Message:</strong></p>
      <pre style="white-space:pre-wrap;font-family:inherit;background:#f4f4f5;padding:12px;border-radius:8px;">${escapeHtml(record.message)}</pre>
      ${inlineImages}
      <p style="color:#666;font-size:12px;">User-Agent: ${escapeHtml(record.userAgent)}</p>
    `;
    const text = [
      "Student issue report",
      `Time: ${timestamp}`,
      `Student: ${name} (${studentId})`,
      `Email: ${email}`,
      `Page: ${record.pageUrl || record.pagePath}`,
      `Screenshots: ${savedScreenshots.length}`,
      "",
      record.message,
      "",
      `User-Agent: ${record.userAgent}`,
    ].join("\n");

    const attachments = savedScreenshots.map((shot, index) => {
      const filePath = path.join(SCREENSHOTS_DIR, reportId, shot.filename);
      return {
        filename: shot.filename,
        content: fs.readFileSync(filePath),
        contentType: shot.mimeType,
        cid: `screenshot${index}`,
      };
    });

    try {
      const results = await withTimeout(
        Promise.all(
          recipients.map((to) =>
            sendEmail(to, subject, html, text, { attachments })
          )
        ),
        20_000,
        "Email delivery"
      );
      emailSent = results.some((r) => r.success === true);
    } catch (e) {
      console.warn("⚠️  Feedback email delivery:", e.message);
    }
  }

  logReportBanner(record, {
    emailSent,
    recipients: getBugReportRecipients(),
    sheetsLogged,
  });
}

function logReportBanner(record, { emailSent, recipients, sheetsLogged }) {
  const shotCount = record.screenshotCount || 0;
  const lines = [
    "══════════════════════════════════════════════════",
    "🐛 NEW BUG REPORT — MicroTrainer",
    `   Time:    ${record.timestamp}`,
    `   Student: ${record.name} (${record.studentId})`,
    `   Email:   ${record.email}`,
    `   Page:    ${record.pagePath}`,
    `   Message: ${record.message.slice(0, 120)}${record.message.length > 120 ? "…" : ""}`,
    `   Screens: ${shotCount}`,
    `   Saved:   data/feedback-reports.jsonl`,
    `   Email:   ${emailSent ? `sent to ${recipients.join(", ")}` : "NOT sent — configure SMTP email settings"}`,
    `   Sheets:  ${sheetsLogged ? "logged to BugReports tab" : "skipped or failed"}`,
    "══════════════════════════════════════════════════",
  ];
  console.log(lines.join("\n"));
}

function extensionForMime(mimeType) {
  const map = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/webp": "webp",
    "image/gif": "gif",
  };
  return map[mimeType] || "png";
}

function parseScreenshotPayload(item) {
  if (!item || typeof item !== "object") return null;

  let mimeType = String(item.mimeType || item.type || "").toLowerCase();
  let base64 = item.data || item.base64 || "";

  if (item.dataUrl && typeof item.dataUrl === "string") {
    const match = item.dataUrl.match(/^data:(image\/[a-z+]+);base64,(.+)$/i);
    if (match) {
      mimeType = match[1].toLowerCase();
      base64 = match[2];
    }
  }

  if (!mimeType.startsWith("image/")) return null;
  if (!ALLOWED_MIME.has(mimeType)) return null;
  if (!base64 || typeof base64 !== "string") return null;

  base64 = base64.replace(/\s/g, "");
  let buffer;
  try {
    buffer = Buffer.from(base64, "base64");
  } catch {
    return null;
  }

  if (!buffer.length || buffer.length > MAX_SCREENSHOT_BYTES) return null;

  return { mimeType, buffer };
}

function saveScreenshots(reportId, screenshotsInput = []) {
  if (!Array.isArray(screenshotsInput) || screenshotsInput.length === 0) {
    return [];
  }

  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }

  const reportDir = path.join(SCREENSHOTS_DIR, reportId);
  fs.mkdirSync(reportDir, { recursive: true });

  const saved = [];
  for (const item of screenshotsInput.slice(0, MAX_SCREENSHOTS)) {
    const parsed = parseScreenshotPayload(item);
    if (!parsed) continue;

    const id = crypto.randomBytes(8).toString("hex");
    const ext = extensionForMime(parsed.mimeType);
    const filename = `${id}.${ext}`;
    const filePath = path.join(reportDir, filename);

    fs.writeFileSync(filePath, parsed.buffer);

    saved.push({
      id,
      filename,
      mimeType: parsed.mimeType,
      size: parsed.buffer.length,
      reportId,
    });
  }

  return saved;
}

function resolveScreenshotPath(reportId, screenshotId) {
  if (!reportId || !screenshotId) return null;
  if (!/^[a-zA-Z0-9_-]+$/.test(reportId) || !/^[a-f0-9]+$/.test(screenshotId)) {
    return null;
  }

  const reportDir = path.join(SCREENSHOTS_DIR, reportId);
  if (!fs.existsSync(reportDir)) return null;

  const match = fs
    .readdirSync(reportDir)
    .find((name) => name.startsWith(`${screenshotId}.`));

  if (!match) return null;

  const fullPath = path.join(reportDir, match);
  if (!fullPath.startsWith(reportDir)) return null;

  return fullPath;
}

/**
 * @param {object} params
 */
async function submitFeedbackReport({
  authUser,
  req,
  message = "",
  pageUrl = "",
  pagePath = "",
  userAgent = "",
  screenshots = [],
}) {
  const key = rateLimitKey(authUser, req);
  if (!checkRateLimit(key)) {
    const err = new Error("Too many reports. Please try again in an hour.");
    err.statusCode = 429;
    throw err;
  }

  const trimmedMessage = String(message || "").trim().slice(0, 2000);
  const timestamp = new Date().toISOString();
  const reportId = `rpt_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;

  const studentId = authUser?.studentId || "(not signed in)";
  const email = authUser?.email || "(guest)";
  const name = authUser?.name || "(guest)";
  const role = authUser?.role || "guest";

  const savedScreenshots = saveScreenshots(reportId, screenshots);

  if (!trimmedMessage && savedScreenshots.length === 0) {
    const err = new Error("Please describe the problem or attach a screenshot.");
    err.statusCode = 400;
    throw err;
  }

  const record = {
    reportId,
    timestamp,
    studentId,
    email,
    name,
    role,
    message:
      trimmedMessage ||
      (savedScreenshots.length > 0
        ? `(screenshot report — ${savedScreenshots.length} image(s))`
        : "(quick report — no extra details)"),
    pageUrl: String(pageUrl || "").slice(0, 500),
    pagePath: String(pagePath || "").slice(0, 300),
    userAgent: String(userAgent || "").slice(0, 400),
    screenshotCount: savedScreenshots.length,
    screenshots: savedScreenshots.map((s) => ({
      id: s.id,
      mimeType: s.mimeType,
      size: s.size,
      reportId: s.reportId,
    })),
  };

  const saved = appendLocalLog(record);

  // Respond quickly — email and Sheets can be slow on production (SMTP timeouts).
  void deliverFeedbackReport(record, savedScreenshots).catch((err) => {
    console.error("Background feedback delivery failed:", err.message);
  });

  return {
    success: true,
    saved,
    message: saved
      ? "Report sent. Thank you!"
      : "Report received. Thank you!",
  };
}

function getRecentFeedbackReports(limit = 20) {
  if (!fs.existsSync(FEEDBACK_LOG)) {
    return [];
  }
  try {
    const lines = fs
      .readFileSync(FEEDBACK_LOG, "utf8")
      .split("\n")
      .filter(Boolean);
    const parsed = lines
      .map((line) => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter(Boolean);
    return parsed.slice(-limit).reverse();
  } catch (e) {
    console.error("Failed to read feedback log:", e.message);
    return [];
  }
}

module.exports = {
  submitFeedbackReport,
  getBugReportRecipients,
  getRecentFeedbackReports,
  resolveScreenshotPath,
  SCREENSHOTS_DIR,
};
