import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle } from "lucide-react";
import { card } from "../../lib/ui";

const DIMENSION_ORDER = [
  "clarity",
  "structure",
  "conciseness",
  "confidence",
  "professionalism",
];

function scoreColor(score) {
  if (score >= 8) return "bg-emerald-500";
  if (score >= 6) return "bg-[#7c3aed] dark:bg-[#a78bfa]";
  return "bg-amber-500";
}

function verdictStyle(verdict = "") {
  const v = verdict.toLowerCase();
  if (v.includes("strong")) {
    return "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
  }
  if (v.includes("solid") || v.includes("polish")) {
    return "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800";
  }
  return "bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800";
}

export default function ReviewResultCard({ result }) {
  return (
    <AnimatePresence>
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={`${card} p-5 sm:p-6 space-y-5`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                Your review
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-0.5">
                {result.overallScore}
                <span className="text-base font-normal text-gray-500"> / 10</span>
              </p>
            </div>
            <span
              className={`text-sm font-medium px-3 py-1.5 rounded-full border ${verdictStyle(
                result.overallVerdict
              )}`}
            >
              {result.overallVerdict}
            </span>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {DIMENSION_ORDER.map((key) => {
              const dim = result.dimensions?.[key];
              if (!dim) return null;
              const score = Number(dim.score) || 0;
              return (
                <div
                  key={key}
                  className="rounded-lg bg-gray-50 dark:bg-[#202124]/80 px-3 py-2.5"
                >
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {dim.label || key}
                    </span>
                    <span className="text-gray-500">{score}/10</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${scoreColor(score)}`}
                      style={{ width: `${score * 10}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                    {dim.feedback}
                  </p>
                </div>
              );
            })}
          </div>

          {result.fillerWords?.length > 0 && (
            <div className="text-sm">
              <span className="font-medium text-gray-700 dark:text-gray-300">
                Filler words spotted:{" "}
              </span>
              <span className="text-gray-500 dark:text-gray-400">
                {result.fillerWords.join(", ")}
              </span>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            {result.strengths?.length > 0 && (
              <div>
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400 mb-2">
                  What worked
                </p>
                <ul className="space-y-1.5">
                  {result.strengths.map((s, i) => (
                    <li
                      key={i}
                      className="text-sm text-gray-600 dark:text-gray-400 flex gap-2"
                    >
                      <span className="text-emerald-500">✓</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {result.improvements?.length > 0 && (
              <div>
                <p className="text-sm font-medium text-amber-700 dark:text-amber-400 mb-2">
                  Improve next time
                </p>
                <ul className="space-y-1.5">
                  {result.improvements.map((s, i) => (
                    <li
                      key={i}
                      className="text-sm text-gray-600 dark:text-gray-400 flex gap-2"
                    >
                      <span className="text-amber-500">→</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {result.structureBreakdown?.length > 0 && (
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-0.5">
                How to structure this answer
              </p>
              {result.structureFramework && (
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-3">
                  Framework: {result.structureFramework}
                </p>
              )}
              <ol className="space-y-3">
                {result.structureBreakdown.map((step, i) => (
                  <li key={i} className="flex gap-2.5">
                    {step.covered ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-500" />
                    ) : (
                      <Circle className="h-4 w-4 shrink-0 mt-0.5 text-gray-300 dark:text-gray-600" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {i + 1}. {step.step}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {step.guidance}
                      </p>
                      {step.note && (
                        <p
                          className={`text-xs mt-1 ${
                            step.covered
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-amber-600 dark:text-amber-400"
                          }`}
                        >
                          {step.covered ? "✓ " : "→ "}
                          {step.note}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {result.rewrittenSample && (
            <div className="rounded-xl border border-blue-100 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-blue-600 dark:text-blue-400 mb-2">
                Tighter version you could say
              </p>
              <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                {result.rewrittenSample}
              </p>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
