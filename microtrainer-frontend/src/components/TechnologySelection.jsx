import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { learningPathAPI } from "../api/learningPath";

const TechnologySelection = ({ studentId, onTechnologySelect }) => {
  const [technologies, setTechnologies] = useState([]);
  const [studentProgress, setStudentProgress] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch technologies and progress in parallel
        const [techResponse, progressResponse] = await Promise.all([
          learningPathAPI.getTechnologies(),
          learningPathAPI.getAllProgress(studentId)
        ]);

        setTechnologies(techResponse.data);
        setStudentProgress(progressResponse.data || {});
      } catch (err) {
        console.error("Error fetching technologies:", err);
        setError(err.response?.data?.error || "Failed to load technologies. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [studentId]);

  const getTechnologyIcon = (techId) => {
    const icons = {
      javascript: "🟨",
      python: "🐍",
      java: "☕",
      react: "⚛️",
      nodejs: "🟢",
      django: "🎸",
      springboot: "🍃",
      typescript: "🔷",
      mongodb: "🗄️",
      html: "📄",
      css: "🎨",
      datascience: "📊",
    };
    return icons[techId] || "📚";
  };

  const getProgressInfo = (techId) => {
    const progress = studentProgress[techId];
    if (!progress) {
      return { completed: 0, percentage: 0, status: "not-started" };
    }

    const completed = progress.completedConcepts?.length || 0;
    const percentage = progress.overallProgress || 0;
    
    let status = "not-started";
    if (percentage === 100) status = "completed";
    else if (percentage > 0) status = "in-progress";

    return { completed, percentage, status };
  };

  if (isLoading) {
    return (
      <div className="w-full py-20 text-center">
        <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600">Loading technologies...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full py-20 text-center">
        <div className="text-red-500 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <p className="text-gray-800 font-medium mb-2">Oops! Something went wrong</p>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <h2 className="text-4xl font-normal text-blue-500 text-center mb-3">
        Choose Your Learning Path
      </h2>
      <p className="text-gray-600 text-center mb-12">
        Select a technology to start your structured learning journey
      </p>

      {/* Technology Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {technologies.map((tech) => {
          const progressInfo = getProgressInfo(tech.id);
          
          return (
            <motion.button
              key={tech.id}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onTechnologySelect(tech.id)}
              className={`p-6 rounded-2xl border-2 transition-all text-left relative overflow-hidden ${
                progressInfo.status === "completed"
                  ? "border-green-300 bg-green-50 hover:border-green-400"
                  : progressInfo.status === "in-progress"
                  ? "border-blue-300 bg-blue-50 hover:border-blue-400"
                  : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50"
              }`}
            >
              {/* Completion Badge */}
              {progressInfo.status === "completed" && (
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
                    ✓ Completed
                  </span>
                </div>
              )}

              {/* Technology Header */}
              <div className="flex items-start gap-4 mb-4">
                <span className="text-5xl">{getTechnologyIcon(tech.id)}</span>
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold text-gray-800 mb-1">
                    {tech.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {tech.totalConcepts} concepts to master
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              {progressInfo.percentage > 0 && (
                <div className="mb-3">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-700 font-medium">
                      Progress: {progressInfo.percentage}%
                    </span>
                    <span className="text-gray-600">
                      {progressInfo.completed}/{tech.totalConcepts} concepts
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressInfo.percentage}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className={`h-full rounded-full ${
                        progressInfo.status === "completed"
                          ? "bg-green-500"
                          : "bg-blue-500"
                      }`}
                    />
                  </div>
                </div>
              )}

              {/* Status Badge */}
              <div className="flex items-center gap-2 mt-4">
                {progressInfo.status === "not-started" && (
                  <span className="text-sm text-gray-600">
                    🚀 Start your journey
                  </span>
                )}
                {progressInfo.status === "in-progress" && (
                  <span className="text-sm text-blue-600 font-medium">
                    📖 Continue learning
                  </span>
                )}
                {progressInfo.status === "completed" && (
                  <span className="text-sm text-green-600 font-medium">
                    🎓 Review concepts
                  </span>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Empty State */}
      {technologies.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">No technologies available yet.</p>
        </div>
      )}
    </motion.div>
  );
};

export default TechnologySelection;
