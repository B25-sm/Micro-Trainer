import { useCallback, useEffect, useRef, useState } from "react";
import {
  deleteChatSession,
  getFirstUserQuestion,
  loadChatSessions,
  upsertChatSession,
} from "../utils/chatHistoryStorage";

/**
 * Persists chat threads to localStorage and exposes sidebar session list.
 */
export function useChatHistoryPersistence(storageKey) {
  const [sessions, setSessions] = useState(() => loadChatSessions(storageKey));
  const [activeSessionId, setActiveSessionId] = useState(null);
  const activeSessionIdRef = useRef(null);

  useEffect(() => {
    activeSessionIdRef.current = activeSessionId;
  }, [activeSessionId]);

  const refreshSessions = useCallback(() => {
    setSessions(loadChatSessions(storageKey));
  }, [storageKey]);

  const persistConversation = useCallback(
    ({ messages, sessionId, meta = {} }) => {
      if (!messages?.length) return;

      let id = activeSessionIdRef.current;
      if (!id) {
        id = `chat_${Date.now()}`;
        setActiveSessionId(id);
        activeSessionIdRef.current = id;
      }

      const record = {
        id,
        title: getFirstUserQuestion(messages),
        messages,
        sessionId: sessionId ?? null,
        meta,
        updatedAt: new Date().toISOString(),
      };

      const next = upsertChatSession(storageKey, record);
      setSessions(next);
    },
    [storageKey]
  );

  const beginNewSession = useCallback(() => {
    setActiveSessionId(null);
    activeSessionIdRef.current = null;
  }, []);

  const selectSession = useCallback((sessionId) => {
    const found = loadChatSessions(storageKey).find((s) => s.id === sessionId);
    if (!found) return null;
    setActiveSessionId(sessionId);
    activeSessionIdRef.current = sessionId;
    return found;
  }, [storageKey]);

  const removeSession = useCallback(
    (sessionId) => {
      const next = deleteChatSession(storageKey, sessionId);
      setSessions(next);
      if (activeSessionIdRef.current === sessionId) {
        beginNewSession();
      }
      return next;
    },
    [storageKey, beginNewSession]
  );

  return {
    sessions,
    activeSessionId,
    persistConversation,
    beginNewSession,
    selectSession,
    removeSession,
    refreshSessions,
  };
}
