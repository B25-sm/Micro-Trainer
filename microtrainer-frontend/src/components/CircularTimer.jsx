import { motion } from "framer-motion";

function formatTimeDisplay(seconds, totalSeconds) {
  const s = Math.max(0, Math.floor(seconds));
  if (totalSeconds >= 60 || s >= 60) {
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${String(r).padStart(2, "0")}`;
  }
  return String(s);
}

/**
 * Per-question countdown ring.
 * @param {number} timeLeft — seconds remaining
 * @param {number} total — seconds allocated for this question (easy 60 / medium 120 / hard 300)
 */
const CircularTimer = ({ timeLeft = 30, total = 30 }) => {
  const radius = 22;
  const circumference = 2 * Math.PI * radius;

  const safeTotal = Math.max(1, total);
  const clampedLeft = Math.min(Math.max(0, timeLeft), safeTotal);
  const progress = clampedLeft / safeTotal;
  const strokeDashoffset = circumference * (1 - progress);

  const warnBand =
    safeTotal >= 180
      ? Math.min(45, Math.floor(safeTotal * 0.15))
      : safeTotal >= 120
        ? 15
        : 10;
  const isDanger = clampedLeft > 0 && clampedLeft <= warnBand;

  const label = formatTimeDisplay(clampedLeft, safeTotal);

  return (
    <div className="relative w-12 h-12">
      <svg width="48" height="48" className="rotate-[-90deg]">
        <circle
          cx="24"
          cy="24"
          r={radius}
          stroke="rgba(0,0,0,0.08)"
          strokeWidth="4"
          fill="transparent"
        />

        <motion.circle
          cx="24"
          cy="24"
          r={radius}
          stroke={isDanger ? "#ef4444" : "#a855f7"}
          strokeWidth="4"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        />
      </svg>

      <div className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold tabular-nums leading-none text-gray-800">
        {label}
      </div>
    </div>
  );
};

export default CircularTimer;
