import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { Send, X, ImagePlus, ClipboardPaste } from "lucide-react";
import { reportIssue } from "../api";
import { getAuthUser } from "../utils/authSession";

const MAX_SCREENSHOTS = 3;
const MAX_BYTES = 2.5 * 1024 * 1024;

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function buildScreenshotEntry(file) {
  if (!file?.type?.startsWith("image/")) {
    throw new Error("Only image files are allowed.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Each screenshot must be under 2.5 MB.");
  }
  const dataUrl = await readFileAsDataUrl(file);
  const match = String(dataUrl).match(/^data:(image\/[a-z+]+);base64,(.+)$/i);
  if (!match) {
    throw new Error("Could not read that image.");
  }
  return {
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    preview: dataUrl,
    mimeType: match[1].toLowerCase(),
    data: match[2],
  };
}

/**
 * Floating help / bug report — works signed in or on login (guest reports by IP).
 */
export default function ReportIssueButton() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const authUser = getAuthUser();
  const [contactEmail, setContactEmail] = useState(
    () => authUser?.email || localStorage.getItem("userEmail") || ""
  );
  const [screenshots, setScreenshots] = useState([]);
  const [status, setStatus] = useState("idle");
  const [toast, setToast] = useState("");
  const panelRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (authUser?.email) setContactEmail(authUser.email);
  }, [authUser?.email]);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 5000);
    return () => clearTimeout(t);
  }, [toast]);

  const addScreenshotFiles = useCallback(async (files) => {
    const list = Array.from(files || []);
    if (!list.length) return;

    const remaining = MAX_SCREENSHOTS - screenshots.length;
    if (remaining <= 0) {
      setToast(`You can attach up to ${MAX_SCREENSHOTS} screenshots.`);
      return;
    }

    const next = [...screenshots];
    for (const file of list.slice(0, remaining)) {
      try {
        next.push(await buildScreenshotEntry(file));
      } catch (err) {
        setToast(err.message || "Could not add screenshot.");
      }
    }
    setScreenshots(next.slice(0, MAX_SCREENSHOTS));
  }, [screenshots]);

  useEffect(() => {
    if (!open) return undefined;

    function onPaste(e) {
      const items = e.clipboardData?.items;
      if (!items) return;

      const imageFiles = [];
      for (const item of items) {
        if (item.type?.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) imageFiles.push(file);
        }
      }
      if (imageFiles.length > 0) {
        e.preventDefault();
        addScreenshotFiles(imageFiles);
      }
    }

    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
  }, [open, addScreenshotFiles]);

  async function submit(note = "", includeScreenshots = true) {
    if (status === "sending") return;
    setStatus("sending");
    try {
      const pageUrl = window.location.href;
      const pagePath = location.pathname + location.search;
      const payload = {
        message: note,
        contactEmail: contactEmail.trim(),
        pageUrl,
        pagePath,
        userAgent: navigator.userAgent,
      };

      if (includeScreenshots && screenshots.length > 0) {
        payload.screenshots = screenshots.map((shot) => ({
          mimeType: shot.mimeType,
          data: shot.data,
        }));
      }

      const res = await reportIssue(payload);
      setStatus("ok");
      setOpen(false);
      setMessage("");
      setScreenshots([]);
      setToast(res.data?.message || "Report sent. Thank you!");
    } catch (err) {
      setStatus("err");
      const message =
        err?.error ||
        (err?.status === 408
          ? "Request timed out — please try again."
          : null) ||
        err?.message ||
        "Could not send report. Try again.";
      setToast(message);
    } finally {
      setTimeout(() => setStatus("idle"), 1200);
    }
  }

  const isSending = status === "sending";
  const canSubmit = message.trim().length > 0 || screenshots.length > 0;
  return (
    <div
      ref={panelRef}
      className="fixed z-[120] bottom-16 right-4 lg:bottom-4 flex flex-col gap-3 items-end"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      aria-live="polite"
    >
      {toast && (
        <div
          role="status"
          className={`max-w-sm px-4 py-3 rounded-xl shadow-lg border text-sm leading-snug ${
            status === "err"
              ? "bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-100"
              : "bg-white border-slate-200 text-slate-800 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
          }`}
        >
          {toast}
        </div>
      )}

      {open && (
        <div className="w-[min(100vw-3rem,22rem)] rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-900 shadow-2xl shadow-slate-900/10 dark:shadow-black/40 overflow-hidden read-mode:bg-[var(--read-surface-elevated)] read-mode:border-[var(--read-border)]">
          <div className="flex items-start justify-between gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Report a problem
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                We&apos;ll notify your trainer with this page, your account
                details, and any screenshots you attach.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit(message.trim());
            }}
            className="p-4 space-y-3"
          >
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Page:{" "}
              <span className="font-mono text-slate-700 dark:text-slate-300">
                {location.pathname}
              </span>
            </p>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What happened? Steps to reproduce help us fix it faster."
              rows={4}
              maxLength={2000}
              className="w-full text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 resize-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 read-mode:bg-[var(--read-surface)]"
            />

            {!authUser?.email && (
              <div>
                <label
                  htmlFor="snag-contact-email"
                  className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300"
                >
                  Your email
                </label>
                <input
                  id="snag-contact-email"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  maxLength={254}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                />
                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                  Add this so your trainer can identify and reply to you.
                </p>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                multiple
                className="hidden"
                onChange={(e) => {
                  addScreenshotFiles(e.target.files);
                  e.target.value = "";
                }}
              />
              <button
                type="button"
                disabled={isSending || screenshots.length >= MAX_SCREENSHOTS}
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition"
              >
                <ImagePlus className="w-3.5 h-3.5" />
                Attach screenshot
              </button>
              <span className="inline-flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                <ClipboardPaste className="w-3.5 h-3.5" />
                or paste (Ctrl+V)
              </span>
            </div>

            {screenshots.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {screenshots.map((shot) => (
                  <div key={shot.id} className="relative">
                    <img
                      src={shot.preview}
                      alt="Attached screenshot"
                      className="w-16 h-16 object-cover rounded-lg border border-slate-200 dark:border-slate-700"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setScreenshots((prev) =>
                          prev.filter((item) => item.id !== shot.id)
                        )
                      }
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center shadow"
                      aria-label="Remove screenshot"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              type="submit"
              disabled={isSending || !canSubmit}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-60 transition shadow-sm"
            >
              <Send className="w-4 h-4" />
              {isSending ? "Sending…" : "Send report"}
            </button>
            <button
              type="button"
              disabled={isSending}
              onClick={() => submit("(quick report — no extra details)", false)}
              className="w-full py-2 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
            >
              Send without details (page info only)
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={isSending}
        title="Report a snag or suggest an improvement"
        aria-label="Report a snag or suggest an improvement"
        aria-expanded={open}
        className="inline-flex items-center gap-1 px-1.5 py-1 text-[10px] font-medium text-slate-400 transition hover:text-slate-600 disabled:opacity-60 dark:text-slate-500 dark:hover:text-slate-300"
      >
        {isSending ? (
          <span className="h-2.5 w-2.5 animate-spin rounded-full border-2 border-slate-400/40 border-t-slate-500 dark:border-t-slate-300" />
        ) : (
          <span aria-hidden="true">{open ? "✕" : "🐞"}</span>
        )}
        <span>{open ? "Close" : "snags"}</span>
      </button>
    </div>
  );
}
