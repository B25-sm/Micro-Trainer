import { useEffect } from "react";

export default function ExtensionAutoConnect() {
  useEffect(() => {
    const message = {
      type: "MICROTRAINER_CONNECT",
      frontendUrl: window.location.origin,
    };

    window.postMessage(message, window.location.origin);
    window.parent?.postMessage(message, "*");
  }, []);

  return null;
}
