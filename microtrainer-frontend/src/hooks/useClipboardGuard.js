import { useEffect } from "react";

/** Block clipboard actions while an interview or quiz attempt is active. */
export default function useClipboardGuard(active) {
  useEffect(() => {
    if (!active) return undefined;

    const blockClipboard = (event) => event.preventDefault();

    document.addEventListener("copy", blockClipboard);
    document.addEventListener("paste", blockClipboard);
    document.addEventListener("cut", blockClipboard);

    return () => {
      document.removeEventListener("copy", blockClipboard);
      document.removeEventListener("paste", blockClipboard);
      document.removeEventListener("cut", blockClipboard);
    };
  }, [active]);
}
