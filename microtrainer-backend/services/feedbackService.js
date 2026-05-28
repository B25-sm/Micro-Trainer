/**
 * Student bug / inconvenience reports → email trainers, Sheets, local log
 */

const fs = require("fs");
const path = require("path");
const { sendEmail } = require("./emailService");
const { logFeedbackReport } = require("./sheetsService");

const DATA_DIR = path.join(__dirname, "..", "data");
const FEEDBACK_LOG = path.join(DATA_DIR, "feedback-reports.jsonl");

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

function logReportBanner(record, { emailSent, recipients, sheetsLogged }) {
  const lines = [
    "══════════════════════════════════════════════════",
    "🐛 NEW BUG REPORT — MicroTrainer",
    `   Time:    ${record.timestamp}`,
    `   Student: ${record.name} (${record.studentId})`,
    `   Email:   ${record.email}`,
    `   Page:    ${record.pagePath}`,
    `   Message: ${record.message.slice(0, 120)}${record.message.length > 120 ? "…" : ""}`,
    `   Saved:   data/feedback-reports.jsonl`,
    `   Email:   ${emailSent ? `sent to ${recipients.join(", ")}` : "NOT sent — configure SMTP email settings"}`,
    `   Sheets:  ${sheetsLogged ? "logged to BugReports tab" : "skipped or failed"}`,
    "══════════════════════════════════════════════════",
  ];
  console.log(lines.join("\n"));
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
}) {
  const key = rateLimitKey(authUser, req);
  if (!checkRateLimit(key)) {
    const err = new Error("Too many reports. Please try again in an hour.");
    err.statusCode = 429;
    throw err;
  }

  const trimmedMessage = String(message || "").trim().slice(0, 2000);
  const recipients = getBugReportRecipients();
  const timestamp = new Date().toISOString();

  const studentId = authUser?.studentId || "(not signed in)";
  const email = authUser?.email || "(guest)";
  const name = authUser?.name || "(guest)";
  const role = authUser?.role || "guest";

  const record = {
    timestamp,
    studentId,
    email,
    name,
    role,
    message: trimmedMessage || "(quick report — no extra details)",
    pageUrl: String(pageUrl || "").slice(0, 500),
    pagePath: String(pagePath || "").slice(0, 300),
    userAgent: String(userAgent || "").slice(0, 400),
  };

  const saved = appendLocalLog(record);
  let sheetsLogged = false;
  try {
    await logFeedbackReport(record);
    sheetsLogged = true;
  } catch (_) {
    sheetsLogged = false;
  }

  let emailSent = false;
  if (recipients.length > 0) {
    const subject = `[MicroTrainer] Issue — ${record.pagePath || "app"} (${studentId})`;
    const html = `
      <h2>Student issue report</h2>
      <p><strong>Time:</strong> ${escapeHtml(timestamp)}</p>
      <p><strong>Student:</strong> ${escapeHtml(name)} (${escapeHtml(studentId)})</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Role:</strong> ${escapeHtml(role)}</p>
      <p><strong>Page:</strong> <a href="${escapeHtml(record.pageUrl)}">${escapeHtml(record.pagePath || record.pageUrl)}</a></p>
      <hr/>
      <p><strong>Message:</strong></p>
      <pre style="white-space:pre-wrap;font-family:inherit;background:#f4f4f5;padding:12px;border-radius:8px;">${escapeHtml(record.message)}</pre>
      <p style="color:#666;font-size:12px;">User-Agent: ${escapeHtml(record.userAgent)}</p>
    `;
    const text = [
      "Student issue report",
      `Time: ${timestamp}`,
      `Student: ${name} (${studentId})`,
      `Email: ${email}`,
      `Page: ${record.pageUrl || record.pagePath}`,
      "",
      record.message,
      "",
      `User-Agent: ${record.userAgent}`,
    ].join("\n");

    const results = await Promise.all(
      recipients.map((to) => sendEmail(to, subject, html, text))
    );
    emailSent = results.some((r) => r.success === true);
  }

  logReportBanner(record, { emailSent, recipients, sheetsLogged });

  let userMessage = "Report sent. Thank you!";
  if (!emailSent && recipients.length > 0) {
    userMessage =
      "Report saved. Email could not be sent — your trainer will see it in the server log and Google Sheet.";
  } else if (!emailSent && recipients.length === 0) {
    userMessage =
      "Report saved on the server. Set BUG_REPORT_EMAIL or TRAINER_EMAILS in backend .env.";
  } else if (emailSent) {
    userMessage = "Report sent to your trainer. Thank you!";
  }

  return {
    success: true,
    emailSent,
    sheetsLogged,
    saved,
    message: userMessage,
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
};
