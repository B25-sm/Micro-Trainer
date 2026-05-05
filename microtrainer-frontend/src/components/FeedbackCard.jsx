import { motion } from "framer-motion";

const FeedbackCard = ({ data }) => {
  if (!data) return null;

  const {
    score,
    communication,
    technical,
    mistakes,
    improvement,
  } = data;

  const getScoreColor = () => {
    if (score >= 8) return "bg-green-500";
    if (score >= 5) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-code-bg border border-border rounded-2xl p-4 space-y-3 shadow-base max-w-xl"
    >
      {/* Score Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-text-h">Evaluation</h3>
        <div
          className={`px-3 py-1 rounded-full text-white text-sm ${getScoreColor()}`}
        >
          {score}/10
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-gray-400">Communication</span>
          <p className="font-medium">{communication}</p>
        </div>
        <div>
          <span className="text-gray-400">Technical</span>
          <p className="font-medium">{technical}</p>
        </div>
      </div>

      {/* Mistakes */}
      <div>
        <p className="text-sm text-red-400 font-medium">Mistakes</p>
        <p className="text-sm">{mistakes}</p>
      </div>

      {/* Improvement */}
      <div>
        <p className="text-sm text-green-400 font-medium">Improvement</p>
        <p className="text-sm">{improvement}</p>
      </div>
    </motion.div>
  );
};

export default FeedbackCard;