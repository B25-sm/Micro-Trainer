import { useEffect, useState } from "react";
import axios from "axios";
import { getTrainerHeaders } from "../utils/trainerAuth";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function FeedbackScreenshotThumb({ reportId, screenshot }) {
  const [src, setSrc] = useState("");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!reportId || !screenshot?.id) return undefined;

    let objectUrl = "";
    let cancelled = false;

    axios
      .get(
        `${BASE_URL}/trainer/feedback/screenshot/${reportId}/${screenshot.id}`,
        {
          headers: getTrainerHeaders(),
          responseType: "blob",
        }
      )
      .then((res) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(res.data);
        setSrc(objectUrl);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [reportId, screenshot?.id]);

  if (failed) {
    return (
      <span className="text-xs text-gray-400 dark:text-gray-500">
        Image unavailable
      </span>
    );
  }

  if (!src) {
    return (
      <div className="w-16 h-16 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
    );
  }

  return (
    <a
      href={src}
      target="_blank"
      rel="noopener noreferrer"
      className="block shrink-0"
      title="Open screenshot"
    >
      <img
        src={src}
        alt="Bug report screenshot"
        className="w-16 h-16 object-cover rounded-lg border border-gray-200 dark:border-gray-600 hover:opacity-90 transition"
      />
    </a>
  );
}
