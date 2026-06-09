import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { learningPathAPI } from "../api/learningPath";
import { getStudentId } from "../utils/studentAuth";
import { isTrainerSession } from "../utils/trainerAuth";
import { monogram } from "../lib/ui";

function normalizeTechnologies(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.technologies)) return payload.technologies;
  return [];
}

const TechnologySelection = ({ studentId: studentIdProp, onTechnologySelect }) => {
  const [technologies, setTechnologies] = useState([]);
  const [studentProgress, setStudentProgress] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trainerPreview, setTrainerPreview] = useState(false);

  const resolvedStudentId = studentIdProp || getStudentId() || "";

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setTrainerPreview(false);

    try {
      const techResponse = await learningPathAPI.getTechnologies();
      const list = normalizeTechnologies(techResponse.data);

      if (list.length === 0) {
        setTechnologies([]);
        setError(
          "No guided courses are available on the server yet. Your trainer needs to deploy curriculum data (data/curriculums) with the backend."
        );
        return;
      }

      setTechnologies(list);

      if (resolvedStudentId) {
        try {
          const progressResponse = await learningPathAPI.getAllProgress(resolvedStudentId);
          setStudentProgress(progressResponse.data || {});
        } catch (progressErr) {
          console.warn("Could not load progress (showing courses without progress):", progressErr);
          setStudentProgress({});
        }
      } else if (isTrainerSession()) {
        setStudentProgress({});
        setTrainerPreview(true);
      } else {
        setStudentProgress({});
        setError(
          "Complete your student profile to save progress. You can still browse courses after signing in as a student."
        );
      }
    } catch (err) {
      console.error("Error fetching technologies:", err);
      const msg =
        err?.response?.data?.error ||
        err?.error ||
        err?.message ||
        "Failed to load technologies. Please try again.";
      setError(msg);
      setTechnologies([]);
    } finally {
      setIsLoading(false);
    }
  }, [resolvedStudentId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getTechnologyMonogram = (techId) => {
    const map = {
      javascript: "JS",
      python: "PY",
      java: "JA",
      react: "RE",
      nodejs: "ND",
      django: "DJ",
      springboot: "SB",
      typescript: "TS",
      mongodb: "MG",
      html: "HT",
      css: "CS",
      datascience: "DS",
    };
    return map[techId] || techId.slice(0, 2).toUpperCase();
  };

  const getProgressInfo = (techId, totalConcepts = 5) => {
    const progress = studentProgress[techId];
    if (!progress) {
      return { completed: 0, percentage: 0, status: "not-started", total: totalConcepts };
    }

    const total = progress.totalConcepts || totalConcepts;
    const completed = progress.completedConcepts?.length || 0;
    const percentage =
      progress.overallProgress != null
        ? progress.overallProgress
        : total > 0
          ? Math.round((completed / total) * 100)
          : 0;

    let status = "not-started";
    if (percentage >= 100) status = "completed";
    else if (completed > 0 || (progress.currentConceptOrder || 1) > 1) status = "in-progress";

    return { completed, percentage, status, total };
  };

  if (isLoading) {
    return (
      <div className="w-full py-20 text-center">
        <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading technologies…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full py-20 text-center max-w-lg mx-auto">
        <div className="text-red-500 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <p className="text-gray-800 dark:text-gray-100 font-medium mb-2">
          Oops! Something went wrong
        </p>
        <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm leading-relaxed">{error}</p>
        <button
          type="button"
          onClick={fetchData}
          className="px-4 py-2 bg-[#1a73e8] dark:bg-[#8ab4f8] text-white dark:text-gray-900 rounded-lg hover:opacity-90 transition text-sm font-medium"
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
      <h2 className="text-2xl font-medium text-gray-900 dark:text-gray-100 text-center mb-2">
        Choose your learning path
      </h2>
      <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
        Select a technology to start your structured learning journey
      </p>

      {trainerPreview && (
        <div className="mb-8 max-w-2xl mx-auto rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 px-4 py-3 text-sm text-blue-800 dark:text-blue-200 text-center">
          Trainer preview — progress is not saved until you use a student account.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {technologies.map((tech) => {
          const progressInfo = getProgressInfo(tech.id, tech.totalConcepts);

          return (
            <motion.button
              key={tech.id}
              type="button"
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onTechnologySelect(tech.id)}
              className={`p-6 rounded-2xl border-2 transition-all text-left relative overflow-hidden ${
                progressInfo.status === "completed"
                  ? "border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-950/30 hover:border-green-400"
                  : progressInfo.status === "in-progress"
                    ? "border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/30 hover:border-blue-400"
                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-[#292a2d] hover:border-blue-300 dark:hover:border-blue-600"
              }`}
            >
              {progressInfo.status === "completed" && (
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-medium rounded-md border border-gray-200 dark:border-gray-600">
                    Completed
                  </span>
                </div>
              )}

              <div className="flex items-start gap-4 mb-4">
                <span className={monogram}>{getTechnologyMonogram(tech.id)}</span>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-1">
                    {tech.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {tech.totalConcepts} concepts to master
                  </p>
                </div>
              </div>

              <div className="mb-3">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-700 dark:text-gray-200 font-medium">
                    {progressInfo.percentage}% complete
                  </span>
                  <span className="text-gray-600 dark:text-gray-300">
                    {progressInfo.completed}/{progressInfo.total} concepts
                  </span>
                </div>
                <div
                  className="w-full h-2.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden"
                  role="progressbar"
                  aria-valuenow={progressInfo.percentage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${tech.name} learning progress`}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(progressInfo.percentage, 0)}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className={`h-full rounded-full ${
                      progressInfo.status === "completed"
                        ? "bg-green-500"
                        : progressInfo.percentage > 0
                          ? "bg-blue-500"
                          : "bg-gray-400 dark:bg-gray-500"
                    }`}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4">
                {progressInfo.status === "not-started" && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Start course
                  </span>
                )}
                {progressInfo.status === "in-progress" && (
                  <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                    Continue learning
                  </span>
                )}
                {progressInfo.status === "completed" && (
                  <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                    Review concepts
                  </span>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};

export default TechnologySelection;
