import { useEffect, useRef, useState } from "react";
import { getOpportunities } from "../api";
import { textMuted } from "../lib/ui";

const TYPE_LABEL = {
  issue: "open issue",
  job: "job",
  internship: "internship",
  bounty: "bounty",
  hackathon: "hackathon",
};

/**
 * Ambient, collapsed one-line chip: "💼 3 live openings for useEffect".
 * Renders nothing until real opportunities are found, so it never adds
 * visual noise to the learning surface.
 */
const OpportunityChip = ({ tech, concept }) => {
  const [opportunities, setOpportunities] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const requestId = useRef(0);

  useEffect(() => {
    setExpanded(false);

    if (!tech) {
      setOpportunities([]);
      return;
    }

    const currentRequest = ++requestId.current;
    getOpportunities(tech, concept)
      .then((res) => {
        if (requestId.current !== currentRequest) return; // stale response
        setOpportunities(res.data?.opportunities || []);
      })
      .catch(() => {
        if (requestId.current === currentRequest) setOpportunities([]);
      });
  }, [tech, concept]);

  if (opportunities.length === 0) return null;

  const label =
    opportunities.length === 1
      ? `💼 1 live ${TYPE_LABEL[opportunities[0].type] || "opportunity"} for ${
          concept || tech
        }`
      : `💼 ${opportunities.length} live opportunities for ${concept || tech}`;

  return (
    <div className="w-full flex justify-center my-2">
      <div className="relative">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className={`${textMuted} hover:text-gray-700 dark:hover:text-gray-300 underline-offset-2 hover:underline transition`}
        >
          {label}
        </button>

        {expanded && (
          <div className="absolute z-20 mt-2 w-80 max-w-[90vw] left-1/2 -translate-x-1/2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#292a2d] shadow-lg p-2 space-y-1">
            {opportunities.map((op, i) => (
              <a
                key={i}
                href={op.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/40 transition"
              >
                <div className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
                  {op.title}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {op.org}
                  {op.reward ? ` · ${op.reward}` : ""} ·{" "}
                  {TYPE_LABEL[op.type] || op.type}
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OpportunityChip;
