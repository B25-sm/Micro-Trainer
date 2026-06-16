const MAX_SESSIONS = 40;

export function getFirstUserQuestion(messages = []) {
  const user = messages.find((m) => m.role === "user" && m.content?.trim());
  if (!user) return "New conversation";
  const text = user.content.trim();
  return text.length > 72 ? `${text.slice(0, 72)}…` : text;
}

export function loadChatSessions(storageKey) {
  try {
    const raw = localStorage.getItem(storageKey);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveChatSessions(storageKey, sessions) {
  localStorage.setItem(storageKey, JSON.stringify(sessions.slice(0, MAX_SESSIONS)));
}

export function upsertChatSession(storageKey, session) {
  const sessions = loadChatSessions(storageKey).filter((s) => s.id !== session.id);
  sessions.unshift(session);
  saveChatSessions(storageKey, sessions);
  return sessions;
}

export function deleteChatSession(storageKey, sessionId) {
  const sessions = loadChatSessions(storageKey).filter((s) => s.id !== sessionId);
  saveChatSessions(storageKey, sessions);
  return sessions;
}

export function normalizePromptText(text) {
  return String(text || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

export function collectSavedPrompts(sessions = []) {
  const saved = new Set();
  for (const session of sessions) {
    const firstUser = session.messages?.find(
      (m) => m.role === "user" && m.content?.trim()
    )?.content;
    if (firstUser) saved.add(normalizePromptText(firstUser));
    if (session.title && session.title !== "New conversation") {
      saved.add(normalizePromptText(session.title));
    }
  }
  return saved;
}

export function filterStarterPrompts(promptPool, sessions = [], limit = 6) {
  const saved = collectSavedPrompts(sessions);
  return promptPool
    .filter((prompt) => !saved.has(normalizePromptText(prompt)))
    .slice(0, limit);
}

export function listUserQuestions(messages = []) {
  return messages
    .map((m, index) => ({ ...m, index }))
    .filter((m) => m.role === "user" && m.content?.trim());
}

export function formatHistoryTime(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const now = new Date();
    const sameDay = d.toDateString() === now.toDateString();
    if (sameDay) {
      return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    }
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}
