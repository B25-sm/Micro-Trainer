/**
 * Resolve Piston API base URL for self-hosted vs emkc.org proxy.
 *
 * Self-hosted: http://127.0.0.1:2000/api/v2  →  /execute, /runtimes, /packages
 * emkc proxy:  https://emkc.org/api/v2/piston  →  /execute, /runtimes (no /packages install)
 */
function resolvePistonApiBase(rawUrl) {
  const raw = (rawUrl || "http://127.0.0.1:2000/api/v2").replace(/\/$/, "");

  if (/emkc\.org/i.test(raw) && /\/piston$/i.test(raw)) {
    return raw;
  }
  if (raw.endsWith("/api/v2/piston")) {
    return raw.replace(/\/piston$/, "");
  }
  if (raw.endsWith("/api/v2")) {
    return raw;
  }
  if (/^https?:\/\/[^/]+$/.test(raw)) {
    return `${raw}/api/v2`;
  }
  return raw;
}

module.exports = { resolvePistonApiBase };
