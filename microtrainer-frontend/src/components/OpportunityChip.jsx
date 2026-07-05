import { useEffect, useRef, useState } from "react";
import { BriefcaseBusiness, ExternalLink, X } from "lucide-react";
import { getOpportunities } from "../api";

const TYPE_LABEL = {
  issue: "open issue",
  job: "job",
  internship: "internship",
  bounty: "bounty",
  hackathon: "hackathon",
};

const TYPE_STYLE = {
  issue: "bg-blue-50 text-blue-700 dark:bg-blue-400/10 dark:text-blue-300",
  job: "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300",
  internship: "bg-cyan-50 text-cyan-700 dark:bg-cyan-400/10 dark:text-cyan-300",
  bounty: "bg-amber-50 text-amber-800 dark:bg-amber-400/10 dark:text-amber-300",
  hackathon: "bg-violet-50 text-violet-700 dark:bg-violet-400/10 dark:text-violet-300",
};

function formatAge(days) {
  if (days <= 0) return "today";
  if (days === 1) return "1d ago";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.round(days / 7)}w ago`;
  return `${Math.round(days / 30)}mo ago`;
}

const OpportunityChip = ({ tech, concept }) => {
  const [opportunities, setOpportunities] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const requestId = useRef(0);
  const rootRef = useRef(null);

  useEffect(() => {
    setExpanded(false);
    if (!tech) {
      setOpportunities([]);
      return;
    }

    const currentRequest = ++requestId.current;
    getOpportunities(tech, concept)
      .then((res) => {
        if (requestId.current === currentRequest) {
          setOpportunities(res.data?.opportunities || []);
        }
      })
      .catch(() => {
        if (requestId.current === currentRequest) setOpportunities([]);
      });
  }, [tech, concept]);

  useEffect(() => {
    if (!expanded) return undefined;

    const closeOnOutside = (event) => {
      if (!rootRef.current?.contains(event.target)) setExpanded(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setExpanded(false);
    };

    document.addEventListener("pointerdown", closeOnOutside);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutside);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [expanded]);

  if (opportunities.length === 0) return null;

  const subject = concept || tech;
  const label = opportunities.length === 1
    ? `1 relevant ${TYPE_LABEL[opportunities[0].type] || "opportunity"} for ${subject}`
    : `${opportunities.length} relevant opportunities for ${subject}`;

  return (
    <div className="my-2 flex w-full justify-center">
      <div className="relative" ref={rootRef}>
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          aria-haspopup="dialog"
          className="inline-flex items-center gap-2 rounded-full border border-black/[0.08] bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 dark:border-white/10 dark:bg-white/[0.06] dark:text-gray-200 dark:hover:bg-white/[0.1]"
        >
          <BriefcaseBusiness className="h-3.5 w-3.5" strokeWidth={1.8} />
          {label}
        </button>

        {expanded && (
          <div
            role="dialog"
            aria-label="Relevant opportunities"
            className="absolute bottom-full left-1/2 z-40 mb-3 w-[min(26rem,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_18px_60px_-18px_rgba(0,0,0,0.28)] dark:border-white/10 dark:bg-[#171717] dark:shadow-[0_24px_70px_-20px_rgba(0,0,0,0.8)]"
          >
            <div className="flex items-start justify-between gap-4 border-b border-black/[0.07] px-4 py-3 dark:border-white/[0.08]">
              <div>
                <h3 className="text-sm font-semibold text-gray-950 dark:text-white">Relevant opportunities</h3>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">Matched to {subject}</p>
              </div>
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/[0.08] dark:hover:text-white"
                aria-label="Close opportunities"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto p-2">
              {opportunities.map((op, index) => (
                <a
                  key={`${op.url}-${index}`}
                  href={op.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setExpanded(false)}
                  className="group flex items-start gap-3 rounded-xl px-3 py-3 transition hover:bg-gray-100/80 dark:hover:bg-white/[0.06]"
                >
                  <span className={`mt-0.5 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${TYPE_STYLE[op.type] || TYPE_STYLE.issue}`}>
                    {TYPE_LABEL[op.type] || op.type}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-2 text-sm font-medium leading-snug text-gray-900 dark:text-gray-100">{op.title}</span>
                    <span className="mt-1 block truncate text-xs text-gray-500 dark:text-gray-400">
                      {op.org}
                      {op.reward ? ` · ${op.reward}` : ""}
                      {typeof op.postedDaysAgo === "number" ? ` · ${formatAge(op.postedDaysAgo)}` : ""}
                    </span>
                  </span>
                  <ExternalLink className="mt-1 h-3.5 w-3.5 shrink-0 text-gray-400 transition group-hover:text-gray-700 dark:group-hover:text-gray-200" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OpportunityChip;
