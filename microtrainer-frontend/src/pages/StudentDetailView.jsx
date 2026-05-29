import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Award, AlertCircle, CheckCircle } from "lucide-react";
import { getTrainerHeaders } from "../utils/trainerAuth";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const StudentDetailView = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [memory, setMemory] = useState(null);
  const [profile, setProfile] = useState(null);
  const [learningProgress, setLearningProgress] = useState(null);

  useEffect(() => {
    fetchStudentData();
  }, [studentId]);

  const fetchStudentData = async () => {
    try {
      setLoading(true);

      // Fetch all student data in parallel
      const [analyticsRes, memoryRes, profileRes, learningRes] = await Promise.all([
        axios.get(`${BASE_URL}/student/${studentId}/analytics`, {
          headers: getTrainerHeaders(),
        }),
        axios.get(`${BASE_URL}/student/${studentId}/memory`, {
          headers: getTrainerHeaders(),
        }),
        axios.get(`${BASE_URL}/profile/${studentId}`),
        axios
          .get(`${BASE_URL}/trainer/learning-progress/${studentId}`, {
            headers: getTrainerHeaders(),
          })
          .catch(() => ({ data: null })),
      ]);

      setAnalytics(analyticsRes.data);
      setMemory(memoryRes.data);
      setProfile(profileRes.data);
      setLearningProgress(learningRes.data);

    } catch (err) {
      console.error("Error fetching student data:", err);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend) => {
    if (trend === "improving") return <TrendingUp className="w-5 h-5 text-green-500" />;
    if (trend === "declining") return <TrendingDown className="w-5 h-5 text-red-500" />;
    return <Minus className="w-5 h-5 text-gray-400" />;
  };

  const getLevelColor = (level) => {
    if (level === "advanced")
      return "bg-gray-100 dark:bg-gray-700/60 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600";
    if (level === "intermediate")
      return "bg-gray-100 dark:bg-gray-700/60 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600";
    return "bg-gray-50 dark:bg-gray-800/80 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700";
  };

  const getScoreColor = (score) => {
    const numScore = parseFloat(score);
    if (numScore >= 80) return "text-green-600";
    if (numScore >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 bg-white dark:bg-[#202124] flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400 text-sm">Loading student data…</div>
      </div>
    );
  }

  const hasLearning =
    learningProgress?.technologies?.length > 0;
  const hasInterviewData = analytics || memory;

  if (!hasInterviewData && !hasLearning) {
    return (
      <div className="min-h-screen p-6 bg-white dark:bg-[#202124]">
        <button
          onClick={() => navigate("/trainer")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#292a2d] p-8 text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">No data available</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            This student has no interview or guided course progress recorded yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      {/* BACK BUTTON */}
      <button
        onClick={() => navigate("/trainer")}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Dashboard
      </button>

      {/* HEADER */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#292a2d] p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {learningProgress?.name || learningProgress?.displayName || studentId}
            </h1>
            {(learningProgress?.initial || learningProgress?.batch) && (
              <p className="text-sm text-gray-500 mb-1">
                {learningProgress.initial && (
                  <span className="font-medium">{learningProgress.initial}</span>
                )}
                {learningProgress.initial && learningProgress.batch && " · "}
                {learningProgress.batch}
              </p>
            )}
            <p className="text-xs text-gray-400 mb-2">ID: {studentId}</p>
            <div className="flex items-center gap-3">
              {/* LEVEL BADGE */}
              {memory?.level && (
                <span className={`px-3 py-1 rounded-xl text-sm font-medium border ${getLevelColor(memory.level)}`}>
                  {memory.level.charAt(0).toUpperCase() + memory.level.slice(1)}
                </span>
              )}
              
              {/* TREND */}
              {memory?.trend && (
                <div className="flex items-center gap-1">
                  {getTrendIcon(memory.trend)}
                  <span className="text-sm text-gray-600 capitalize">{memory.trend}</span>
                </div>
              )}

              {/* CONSISTENCY */}
              {memory?.consistency && (
                <span className="text-sm text-gray-600">
                  Consistency: <span className="font-medium">{memory.consistency}</span>
                </span>
              )}
            </div>
          </div>

          {/* OVERALL SCORE */}
          {analytics?.averageScore && (
            <div className="text-right">
              <div className="text-sm text-gray-500 mb-1">Overall Score</div>
              <div className={`text-4xl font-bold ${getScoreColor(analytics.averageScore)}`}>
                {analytics.averageScore}
              </div>
              <div className="text-sm text-gray-500">out of 10</div>
            </div>
          )}
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* TOTAL QUESTIONS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#292a2d] p-6"
        >
          <div className="text-sm text-gray-500 mb-2">Questions Answered</div>
          <div className="text-3xl font-bold text-gray-800">
            {analytics?.totalQuestions || memory?.totalAttempts || 0}
          </div>
        </motion.div>

        {/* COMMUNICATION SCORE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#292a2d] p-6"
        >
          <div className="text-sm text-gray-500 mb-2">Communication</div>
          <div className="text-3xl font-bold text-blue-600">
            {analytics?.communicationScore || "N/A"}
          </div>
          <div className="text-xs text-gray-400">out of 3.0</div>
        </motion.div>

        {/* TECHNICAL SCORE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#292a2d] p-6"
        >
          <div className="text-sm text-gray-500 mb-2">Technical</div>
          <div className="text-3xl font-bold text-purple-600">
            {analytics?.technicalScore || "N/A"}
          </div>
          <div className="text-xs text-gray-400">out of 3.0</div>
        </motion.div>

        {/* TECHNOLOGY LEVEL */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#292a2d] p-6"
        >
          <div className="text-sm text-gray-500 mb-2">Technology Level</div>
          <div className="text-3xl font-bold text-indigo-600">
            {profile?.technologyLevel || "N/A"}
          </div>
          <div className="text-xs text-gray-400">
            {profile?.technologyLevelInfo?.range || ""}
          </div>
        </motion.div>
      </div>

      {/* SUBJECT SCORES */}
      {profile?.technologyInterviews && profile.technologyInterviews.length > 0 && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#292a2d] p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Subject Performance</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {profile.technologyInterviews.map((tech, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="border border-gray-200 rounded-xl p-4"
              >
                <div className="text-sm text-gray-500 mb-1 capitalize">{tech.subject}</div>
                <div className={`text-2xl font-bold ${getScoreColor(tech.averageScore)}`}>
                  {tech.averageScore}
                </div>
                <div className="text-xs text-gray-400">{tech.count} interviews</div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* STRENGTHS & WEAKNESSES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* STRONG CONCEPTS */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#292a2d] p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <h2 className="text-xl font-bold text-gray-800">Strong Concepts</h2>
          </div>
          {memory?.strongConcepts && memory.strongConcepts.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {memory.strongConcepts.map((concept, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-green-50 text-green-700 rounded-xl text-sm border border-green-200"
                >
                  {concept}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No strong concepts identified yet</p>
          )}
        </motion.div>

        {/* WEAK AREAS */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#292a2d] p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl font-bold text-gray-800">Areas to Improve</h2>
          </div>
          {(analytics?.weakAreas && analytics.weakAreas.length > 0) || 
           (memory?.weakTopics && memory.weakTopics.length > 0) ? (
            <div className="flex flex-wrap gap-2">
              {(analytics?.weakAreas || memory?.weakTopics || []).map((area, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-amber-50 text-amber-700 rounded-xl text-sm border border-amber-200"
                >
                  {area}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No weak areas identified</p>
          )}
        </motion.div>
      </div>

      {/* GUIDED COURSE PROGRESS (trainer API — local + Google Sheets) */}
      {hasLearning && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#292a2d] p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-1">Guided Course Progress</h2>
          <p className="text-sm text-gray-500 mb-4">
            {learningProgress.summary.technologiesStudied} technologies ·{" "}
            {learningProgress.summary.totalConceptsCompleted} concepts completed · max{" "}
            {learningProgress.summary.maxOverallProgress}%
          </p>
          <div className="space-y-4">
            {learningProgress.technologies.map((path, index) => (
              <div key={index} className="border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-800 capitalize">
                    {path.technology}
                  </span>
                  <span className="text-sm text-gray-500">
                    Lesson {path.currentConceptOrder} · {path.completedCount}/
                    {path.totalConcepts} done
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all"
                    style={{ width: `${path.overallProgress}%` }}
                  />
                </div>
                <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-600">
                  <span>
                    Progress: <span className="font-medium">{path.overallProgress}%</span>
                  </span>
                  {path.averageQuizScore != null && (
                    <span>
                      Avg quiz:{" "}
                      <span className="font-medium">{path.averageQuizScore}%</span>
                    </span>
                  )}
                  <span className="text-xs text-gray-400">source: {path.source}</span>
                </div>
                {path.completedConcepts?.length > 0 && (
                  <p className="mt-2 text-xs text-gray-500 truncate">
                    Completed: {path.completedConcepts.join(", ")}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PROBLEM SOLVING */}
      {profile?.problemSolvingResults && profile.problemSolvingResults.length > 0 && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#292a2d] p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Problem Solving</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded-xl p-4">
              <div className="text-sm text-gray-500 mb-1">Total Solved</div>
              <div className="text-2xl font-bold text-gray-800">
                {profile.problemSolvingResults.length}
              </div>
            </div>
            <div className="border border-gray-200 rounded-xl p-4">
              <div className="text-sm text-gray-500 mb-1">Success Rate</div>
              <div className="text-2xl font-bold text-green-600">
                {profile.problemSolvingSuccessRate || 0}%
              </div>
            </div>
            <div className="border border-gray-200 rounded-xl p-4">
              <div className="text-sm text-gray-500 mb-1">PS Level</div>
              <div className="text-2xl font-bold text-purple-600">
                {profile.problemSolvingLevel || "N/A"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RECOMMENDATIONS */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#292a2d] p-6">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-800">Recommendations</h2>
        </div>
        <div className="space-y-2">
          {memory?.trend === "declining" && (
            <p className="text-gray-700">
              ⚠️ Performance is declining. Schedule a 1-on-1 session to identify challenges.
            </p>
          )}
          {analytics?.weakAreas && analytics.weakAreas.length > 0 && (
            <p className="text-gray-700">
              Focus on: {analytics.weakAreas.join(", ")}
            </p>
          )}
          {memory?.consistency === "low" && (
            <p className="text-gray-700">
              📅 Encourage more regular practice to improve consistency.
            </p>
          )}
          {parseFloat(analytics?.averageScore || 0) >= 80 && (
            <p className="text-gray-700">
              🌟 Excellent performance! Consider advanced topics or mentoring others.
            </p>
          )}
          {(!analytics?.weakAreas || analytics.weakAreas.length === 0) && 
           memory?.trend === "improving" && (
            <p className="text-gray-700">
              Great progress. Keep up the consistent practice.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDetailView;
