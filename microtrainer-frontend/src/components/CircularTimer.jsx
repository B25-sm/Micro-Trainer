import { motion } from "framer-motion";

const CircularTimer = ({ timeLeft, total = 30 }) => {
  const radius = 22;
  const circumference = 2 * Math.PI * radius;

  const progress = timeLeft / total;
  const strokeDashoffset = circumference * (1 - progress);

  const isDanger = timeLeft <= 10;

  return (
    <div className="relative w-12 h-12">

      <svg width="48" height="48" className="rotate-[-90deg]">

        {/* Background circle */}
        <circle
          cx="24"
          cy="24"
          r={radius}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="4"
          fill="transparent"
        />

        {/* Progress circle */}
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
          transition={{ duration: 0.5 }}
        />
      </svg>

      {/* Time text */}
      <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold">
        {timeLeft}
      </div>
    </div>
  );
};

export default CircularTimer;