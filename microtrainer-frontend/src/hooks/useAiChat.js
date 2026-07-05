import { useCallback, useEffect, useRef, useState } from "react";
import {
  listAiChats,
  createAiChat,
  getAiChat,
  renameAiChat,
  deleteAiChat,
} from "../api";
import { streamAiChat } from "../utils/aiChatStream";
import { loadAiChatSettings } from "../utils/aiChatSettingsStorage";

function genLocalId() {
  return `local-${crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`}`;
}

function placeholderAssistantMessage() {
  return {
    id: genLocalId(),
    role: "assistant",
    content: "",
    createdAt: new Date().toISOString(),
    streaming: true,
  };
}

/**
 * Core state machine for the AI Chat page: conversation list, active
 * conversation's messages, and every action (send/edit/regenerate/continue/
 * stop) with optimistic local updates reconciled against the server once
 * each SSE stream completes.
 */
export function useAiChat() {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);

  const streamHandleRef = useRef(null);
  const streamingTargetIdRef = useRef(null);
  const lastRequestRef = useRef(null); // { conversationId, action, content, messageId } for Retry

  const refreshConversations = useCallback(async (query = "") => {
    setIsLoadingConversations(true);
    try {
      const res = await listAiChats(query);
      setConversations(res.data.conversations);
    } catch {
      setConversations([]);
    } finally {
      setIsLoadingConversations(false);
    }
  }, []);

  useEffect(() => {
    refreshConversations();
  }, [refreshConversations]);

  const selectConversation = useCallback(async (id) => {
    setActiveId(id);
    setError(null);
    setIsLoadingMessages(true);
    try {
      const res = await getAiChat(id);
      setMessages(res.data.conversation.messages.filter((m) => !m.hidden));
    } catch {
      setMessages([]);
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  const newChat = useCallback(() => {
    setActiveId(null);
    setMessages([]);
    setError(null);
  }, []);

  const renameChat = useCallback(
    async (id, title) => {
      const res = await renameAiChat(id, title);
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, title: res.data.conversation.title } : c))
      );
    },
    []
  );

  const deleteChat = useCallback(
    async (id) => {
      await deleteAiChat(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (id === activeId) {
        setActiveId(null);
        setMessages([]);
      }
    },
    [activeId]
  );

  const runStream = useCallback(
    (conversationId, action, extra = {}) => {
      const settings = loadAiChatSettings();
      lastRequestRef.current = { conversationId, action, ...extra };
      setIsStreaming(true);
      setError(null);

      streamHandleRef.current = streamAiChat(
        conversationId,
        {
          action,
          model: settings.model,
          temperature: settings.temperature,
          systemPrompt: settings.systemPrompt || undefined,
          ...extra,
        },
        {
          onDelta: (text) => {
            const targetId = streamingTargetIdRef.current;
            setMessages((prev) =>
              prev.map((m) => (m.id === targetId ? { ...m, content: m.content + text } : m))
            );
          },
          onDone: ({ message, titleUpdated }) => {
            const targetId = streamingTargetIdRef.current;
            setMessages((prev) =>
              prev.map((m) => (m.id === targetId ? { ...message, streaming: false } : m))
            );
            setIsStreaming(false);
            streamHandleRef.current = null;
            if (titleUpdated) {
              setConversations((prev) =>
                prev.map((c) => (c.id === conversationId ? { ...c, title: titleUpdated } : c))
              );
            } else {
              refreshConversations();
            }
          },
          onError: (message) => {
            const targetId = streamingTargetIdRef.current;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === targetId ? { ...m, streaming: false, errored: true } : m
              )
            );
            setError(message);
            setIsStreaming(false);
            streamHandleRef.current = null;
          },
        }
      );
    },
    [refreshConversations]
  );

  const sendMessage = useCallback(
    async (content) => {
      if (!content.trim() || isStreaming) return;

      let conversationId = activeId;
      if (!conversationId) {
        const res = await createAiChat();
        conversationId = res.data.conversation.id;
        setActiveId(conversationId);
        refreshConversations();
      }

      const userMessage = {
        id: genLocalId(),
        role: "user",
        content: content.trim(),
        createdAt: new Date().toISOString(),
      };
      const assistantPlaceholder = placeholderAssistantMessage();
      streamingTargetIdRef.current = assistantPlaceholder.id;

      setMessages((prev) => [...prev, userMessage, assistantPlaceholder]);
      runStream(conversationId, "send", { content: content.trim() });
    },
    [activeId, isStreaming, runStream, refreshConversations]
  );

  const editMessage = useCallback(
    (messageId, content) => {
      if (!content.trim() || isStreaming || !activeId) return;

      setMessages((prev) => {
        const idx = prev.findIndex((m) => m.id === messageId);
        if (idx === -1) return prev;
        const edited = { ...prev[idx], content: content.trim() };
        const assistantPlaceholder = placeholderAssistantMessage();
        streamingTargetIdRef.current = assistantPlaceholder.id;
        return [...prev.slice(0, idx), edited, assistantPlaceholder];
      });

      runStream(activeId, "edit", { messageId, content: content.trim() });
    },
    [activeId, isStreaming, runStream]
  );

  const regenerate = useCallback(() => {
    if (isStreaming || !activeId) return;

    setMessages((prev) => {
      const withoutLastAssistant =
        prev.length && prev[prev.length - 1].role === "assistant" ? prev.slice(0, -1) : prev;
      const assistantPlaceholder = placeholderAssistantMessage();
      streamingTargetIdRef.current = assistantPlaceholder.id;
      return [...withoutLastAssistant, assistantPlaceholder];
    });

    runStream(activeId, "regenerate");
  }, [activeId, isStreaming, runStream]);

  const continueGeneration = useCallback(() => {
    if (isStreaming || !activeId || !messages.length) return;
    const last = messages[messages.length - 1];
    if (last.role !== "assistant") return;

    streamingTargetIdRef.current = last.id;
    setMessages((prev) =>
      prev.map((m) => (m.id === last.id ? { ...m, streaming: true } : m))
    );
    runStream(activeId, "continue");
  }, [activeId, isStreaming, messages, runStream]);

  const stop = useCallback(() => {
    streamHandleRef.current?.abort();
    streamHandleRef.current = null;
    setIsStreaming(false);
    const targetId = streamingTargetIdRef.current;
    setMessages((prev) =>
      prev.map((m) => (m.id === targetId ? { ...m, streaming: false } : m))
    );
  }, []);

  const retry = useCallback(() => {
    const last = lastRequestRef.current;
    if (!last) return;
    setMessages((prev) => {
      const withoutErrored = prev.filter((m) => !m.errored);
      const assistantPlaceholder = placeholderAssistantMessage();
      streamingTargetIdRef.current = assistantPlaceholder.id;
      return [...withoutErrored, assistantPlaceholder];
    });
    const { conversationId, action, ...extra } = last;
    runStream(conversationId, action, extra);
  }, [runStream]);

  return {
    conversations,
    activeId,
    messages,
    isLoadingConversations,
    isLoadingMessages,
    isStreaming,
    error,
    refreshConversations,
    selectConversation,
    newChat,
    renameChat,
    deleteChat,
    sendMessage,
    editMessage,
    regenerate,
    continueGeneration,
    stop,
    retry,
  };
}
