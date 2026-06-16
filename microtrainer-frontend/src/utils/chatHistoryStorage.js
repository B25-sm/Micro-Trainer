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
