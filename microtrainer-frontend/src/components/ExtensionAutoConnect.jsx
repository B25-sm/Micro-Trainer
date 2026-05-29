import { useEffect, useRef } from "react";

export default function ExtensionAutoConnect() {
  const announcedRef = useRef(false);

  useEffect(() => {
    if (announcedRef.current) return;
    announcedRef.current = true;

    const message = {
      type: "MICROTRAINER_CONNECT",
      frontendUrl: window.location.origin,
    };

    if (window.parent && window.parent !== window) {
      window.parent.postMessage(message, "*");
      return;
    }

    window.postMessage(message, window.location.origin);
  }, []);

  return null;
}
