export const DARK_KEY = "microtrainer_dark_mode";
export const READ_KEY = "microtrainer_read_mode";

export function readBool(key, fallback = false) {
  try {
    const v = localStorage.getItem(key);
    if (v === "true") return true;
    if (v === "false") return false;
  } catch {
    /* ignore */
  }
  return fallback;
}

export function applyDocumentClasses(dark, read) {
  const root = document.documentElement;
  root.classList.toggle("dark", dark);
  root.classList.toggle("read-mode", read);
}

export function initDisplayModeFromStorage() {
  applyDocumentClasses(readBool(DARK_KEY), readBool(READ_KEY));
}
