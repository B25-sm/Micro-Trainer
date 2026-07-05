import { useCallback, useState } from "react";

/**
 * Local attachment list state shared by the chat composers. Holds the
 * normalized attachment objects plus a transient error message for the
 * most recent rejected/oversized file.
 */
export function useAttachments() {
  const [attachments, setAttachments] = useState([]);
  const [error, setError] = useState("");

  const addAttachments = useCallback((items) => {
    setError("");
    setAttachments((prev) => [...prev, ...items]);
  }, []);

  const removeAttachment = useCallback((id) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const clearAttachments = useCallback(() => setAttachments([]), []);

  return {
    attachments,
    error,
    setError,
    addAttachments,
    removeAttachment,
    clearAttachments,
  };
}
