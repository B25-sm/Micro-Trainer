/**
 * Stable student identity from Initial + Batch.
 */

export function normalizeIdentityPart(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_-]/g, "");
}

export function buildStudentId(initial, batch) {
  const ini = normalizeIdentityPart(initial);
  const bat = normalizeIdentityPart(batch);
  if (!ini || !bat) return "";
  return `${ini}_${bat}`;
}

export function buildDisplayName(name, initial, batch) {
  const full = String(name || "").trim();
  const ini = String(initial || "").trim();
  const bat = String(batch || "").trim();
  if (full && ini && bat) return `${full} (${ini} · ${bat})`;
  if (full) return full;
  if (ini && bat) return `${ini} · ${bat}`;
  return "";
}

export function parseDisplayFromStudentId(studentId) {
  if (!studentId) return studentId;
  const parts = studentId.split("_");
  if (parts.length < 2) return studentId;
  const batch = parts.pop();
  const initial = parts.join("_");
  return `${initial.toUpperCase()} · ${batch.replace(/_/g, " ")}`;
}
