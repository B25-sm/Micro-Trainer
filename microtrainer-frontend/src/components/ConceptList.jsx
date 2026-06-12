import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { learningPathAPI } from "../api/learningPath";

const ConceptList = ({
  technology,
  studentId,
  studyMode = "guided",
  onStudyModeChange,
  onConceptSelect,
  onBack,
}) => {
  const freeStudy = studyMode === "browse";
  const [curriculum, setCurriculum] = useState(null);
  const [progress, setProgress] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const defaultProgress = {
    currentConceptOrder: 1,
    completedConcepts: [],
    conceptScores: {},
    overallProgress: 0,
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const curriculumResponse = await learningPathAPI.getCurriculum(technology);
        setCurriculum(curriculumResponse.data);

        if (studentId) {
          try {
            const progressResponse = await learningPathAPI.getProgress(
              studentId,
              technology
            );
            setProgress(progressResponse.data || defaultProgress);
          } catch (progressErr) {
            console.warn("Progress unavailable, using defaults:", progressErr);
            setProgress(defaultProgress);
          }
        } else {
          setProgress(defaultProgress);
        }
      } catch (err) {
        console.error("Error fetching curriculum:", err);
        setError(
          err.response?.data?.error ||
            "Failed to load curriculum. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [technology, studentId]);

  const getConceptStatus = (concept) => {
    if (!progress) return freeStudy ? "available" : "locked";

    const isCompleted = progress.completedConcepts?.includes(concept.id);
    if (freeStudy) {
      if (isCompleted) return "completed";
      return "available";
    }

    const isCurrent = concept.order === progress.currentConceptOrder;
    const isLocked = concept.order > progress.currentConceptOrder;

    if (isCompleted) return "completed";
    if (isCurrent) return "current";
    if (isLocked) return "locked";
    return "available";
  };

  const getConceptScore = (conceptId) => {
    return progress?.conceptScores?.[conceptId] || null;
  };

  const handleConceptClick = (concept) => {
    const status = getConceptStatus(concept);
    if (status === "locked") return;
    onConceptSelect(concept.id, concept.order, status === "completed");
  };

  if (isLoading) {
    return (
      <div className="w-full py-20 text-center">
        <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading curriculum...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full py-20 text-center">
        <p className="text-gray-800 dark:text-gray-100 font-medium mb-2">Oops! Something went wrong</p>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          Back to Technologies
        </button>
      </div>
    );
  }

  const groupedConcepts = (() => {
    const concepts = curriculum?.concepts || [];
    if (!concepts.some((c) => c.sectionTitle)) {
      return [{ sectionTitle: null, sectionId: null, concepts }];
    }
    const groups = [];
    const seen = new Set();
    concepts.forEach((concept) => {
      const key = concept.sectionId || concept.sectionTitle || "default";
      if (!seen.has(key)) {
        seen.add(key);
        groups.push({
          sectionTitle: concept.sectionTitle,
          sectionId: concept.sectionId,
          concepts: concepts.filter(
            (c) => (c.sectionId || c.sectionTitle) === key
          ),
        });
      }
    });
    return groups;
  })();

  const renderConceptCard = (concept) => {
    const status = getConceptStatus(concept);
    const score = getConceptScore(concept.id);
    const displayTitle = concept.title.replace(/^Module \d+: /, "");

    return (
      <motion.div
        key={concept.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: concept.order * 0.05 }}
        className={`relative rounded-xl border-2 p-5 transition-all ${
          status === "completed"
            ? "border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-950/30 hover:border-green-400 cursor-pointer"
            : status === "current"
            ? "border-blue-400 dark:border-blue-600 bg-blue-50 dark:bg-blue-950/30 hover:border-blue-500 cursor-pointer shadow-md"
            : status === "locked"
            ? "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40 opacity-60 cursor-not-allowed"
            : "border-gray-300 dark:border-gray-600 bg-white dark:bg-[#292a2d] hover:border-blue-300 dark:hover:border-blue-500 cursor-pointer"
        }`}
        onClick={() => handleConceptClick(concept)}
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xl">
            {status === "completed" && "\u2705"}
            {status === "current" && "\uD83D\uDD35"}
            {status === "locked" && "\uD83D\uDD12"}
          </div>

          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  {concept.order}. {displayTitle}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{concept.description}</p>
                {concept.project && (
                  <p className="text-xs text-purple-700 mt-1 font-medium">
                    {"\uD83D\uDCC1"} Project: {concept.project}
                  </p>
                )}
              </div>
              {score !== null && (
                <div className="ml-4 flex-shrink-0">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      score >= 80
                        ? "bg-green-100 text-green-700"
                        : score >= 60
                        ? "bg-blue-100 text-blue-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {score}%
                  </span>
                </div>
              )}
            </div>

            {concept.objectives?.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-medium text-gray-700 mb-1">
                  Learning objectives:
                </p>
                <ul className="text-xs text-gray-600 space-y-0.5">
                  {concept.objectives.slice(0, 2).map((objective, idx) => (
                    <li key={idx}>• {objective}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-4">
              {status === "completed" && (
                <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                  {"\u2713"} Completed • Click to review
                </span>
              )}
              {status === "current" && (
                <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                  {"\u2192"} Start learning this module
                </span>
              )}
              {status === "available" && (
                <span className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">
                  {"\u2192"} Study this topic
                </span>
              )}
              {status === "locked" && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {"\uD83D\uDD12"} Complete previous modules first
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-3xl mx-auto"
    >
      <div className="mb-8">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 mb-4 transition"
        >
          {"\u2190"} Back to Technologies
        </button>

        <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
          <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-100">
            {curriculum?.technology} Course
          </h2>
          {onStudyModeChange && (
            <button
              type="button"
              onClick={() => onStudyModeChange(freeStudy ? "guided" : "browse")}
              className="text-sm font-medium text-[#1a73e8] dark:text-[#8ab4f8] hover:underline shrink-0"
            >
              {freeStudy ? "Switch to guided path" : "Browse all topics"}
            </button>
          )}
        </div>

        {freeStudy && (
          <p className="text-sm text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-lg px-3 py-2 mb-4">
            Free study mode — open any topic. Quiz progress still saves when you pass.
          </p>
        )}

        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
          <span>
            Progress:{" "}
            <span className="font-medium text-gray-800 dark:text-gray-200">
              {progress?.overallProgress || 0}%
            </span>
          </span>
          <span>•</span>
          <span>
            {progress?.completedConcepts?.length || 0}/
            {curriculum?.totalConcepts || 0} modules completed
          </span>
        </div>

        <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress?.overallProgress || 0}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="h-full bg-blue-500 rounded-full"
          />
        </div>
      </div>

      <div className="space-y-8">
        {groupedConcepts.map((group) => (
          <div key={group.sectionId || group.sectionTitle || "all"}>
            {group.sectionTitle && (
              <div className="mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                  Section {group.sectionId}
                </p>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  {group.sectionTitle}
                </h3>
              </div>
            )}
            <div className="space-y-4">
              {group.concepts.map((concept) => renderConceptCard(concept))}
            </div>
          </div>
        ))}
      </div>

      {!curriculum?.concepts?.length && (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">No modules available for this path yet.</p>
        </div>
      )}
    </motion.div>
  );
};

export default ConceptList;
