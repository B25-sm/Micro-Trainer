import { API_BASE } from "../api";
import { getAuthToken, getSessionStudentId } from "./authSession";

/**
 * Streams a chat turn from the backend's SSE endpoint using native fetch
 * (axios has no clean cross-browser streaming story). Returns an object
 * with an `abort()` method so callers can implement "Stop generation".
 *
 * @param {string} conversationId
 * @param {object} body - { action, content?, messageId?, model?, temperature?, systemPrompt? }
 * @param {object} handlers - { onDelta(text), onDone({message, titleUpdated}), onError(message) }
 */
export function streamAiChat(conversationId, body, { onDelta, onDone, onError }) {
  const controller = new AbortController();

  (async () => {
    try {
      const headers = { "Content-Type": "application/json" };
      const token = getAuthToken();
      if (token) headers.Authorization = `Bearer ${token}`;
      const studentId = getSessionStudentId();
      if (studentId) headers["x-student-id"] = studentId;

      const response = await fetch(
        `${API_BASE}/ai-chat/conversations/${conversationId}/stream`,
        {
          method: "POST",
          headers,
          body: JSON.stringify(body),
          signal: controller.signal,
        }
      );

      if (!response.ok || !response.body) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `Request failed (${response.status})`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const frames = buffer.split("\n\n");
        buffer = frames.pop();

        for (const frame of frames) {
          const line = frame.trim();
          if (!line.startsWith("data:")) continue;
          const dataStr = line.slice(5).trim();
          if (!dataStr) continue;

          let payload;
          try {
            payload = JSON.parse(dataStr);
          } catch {
            continue;
          }

          if (payload.type === "delta") {
            onDelta?.(payload.text);
          } else if (payload.type === "done") {
            onDone?.(payload);
          } else if (payload.type === "error") {
            onError?.(payload.message);
          }
        }
      }
    } catch (err) {
      if (err.name === "AbortError") return; // user-initiated stop, not an error
      onError?.(err.message || "Something went wrong while streaming the response.");
    }
  })();

  return { abort: () => controller.abort() };
}
