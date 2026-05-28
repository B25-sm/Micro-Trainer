/**
 * Headers so students can only access their own progress on the API.
 */

import { getStudentApiHeaders } from "./authSession";

export function getStudentId() {
  return localStorage.getItem("studentId") || "";
}

export function getStudentHeaders(forStudentId) {
  return getStudentApiHeaders(forStudentId);
}

export function getStudentDisplayLabel() {
  const stored = localStorage.getItem("userName");
  if (stored) return stored;
  const full = localStorage.getItem("studentFullName");
  const ini = localStorage.getItem("studentInitial");
  const bat = localStorage.getItem("studentBatch");
  if (full && ini && bat) return `${full} (${ini} · ${bat})`;
  if (full) return full;
  if (ini && bat) return `${ini} · ${bat}`;
  return getStudentId() || "Student";
}
