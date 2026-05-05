import { motion } from "framer-motion";

const Loader = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex justify-start"
    >
      <div className="bg-code-bg border border-border rounded-2xl px-4 py-3 shadow-base max-w-xs">
        
        {/* Typing Dots */}
        <div className="flex gap-1 mb-2">
          <Dot delay={0} />
          <Dot delay={0.2} />
          <Dot delay={0.4} />
        </div>

        {/* Skeleton Lines */}
        <div className="space-y-2">
          <div className="h-2 bg-border rounded w-24 animate-pulse"></div>
          <div className="h-2 bg-border rounded w-32 animate-pulse"></div>
        </div>

      </div>
    </motion.div>
  );
};

export default Loader;

/* ================= DOT COMPONENT ================= */

const Dot = ({ delay }) => (
  <motion.div
    animate={{
      y: [0, -4, 0],
      opacity: [0.4, 1, 0.4],
    }}
    transition={{
      duration: 0.8,
      repeat: Infinity,
      delay,
    }}
    className="w-2 h-2 bg-text rounded-full"
  />
);