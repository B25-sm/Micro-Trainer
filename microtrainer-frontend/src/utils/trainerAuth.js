/**
 * Trainer session — OAuth JWT only (email allowlist on server).
 */

import { getTrainerApiHeaders, getAuthToken, isOAuthLoggedIn } from "./authSession";

const TRAINER_EMAILS = [
  "saimahendra222@gmail.com",
  "mahendra10kcoders@gmail.com",
];

export function isTrainerSession() {
  if (localStorage.getItem("userRole") !== "trainer") return false;
  if (!isOAuthLoggedIn() || !getAuthToken()) return false;
  const email = (localStorage.getItem("userEmail") || "").toLowerCase();
  return TRAINER_EMAILS.includes(email);
}

export function getTrainerHeaders() {
  return getTrainerApiHeaders();
}

export function clearTrainerSession() {
  /* handled by clearAuthSession */
}
