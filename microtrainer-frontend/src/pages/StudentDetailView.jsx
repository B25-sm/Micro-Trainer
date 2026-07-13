import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Award, AlertCircle, CheckCircle } from "lucide-react";
import { getTrainerHeaders } from "../utils/trainerAuth";
import InterviewHistoryPanel from "../components/InterviewHistoryPanel";
import TrainerPersonalSchedulePanel from "../components/personalSchedule/TrainerPersonalSchedulePanel";
import { personalScheduleAPI } from "../api/personalSchedule";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const StudentDetailView = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [memory, setMemory] = useState(null);
  const [profile, setProfile] = useState(null);
  const [learningProgress, setLearningProgress] = useState(null);
  const [personalSchedule, setPersonalSchedule] = useState(null);
  const [scheduleToday, setScheduleToday] = useState(null);
  const [techReadiness, setTechReadiness] = useState(null);
  const [expandedTech, setExpandedTech] = useState(null);
  const [scorecard, setScorecard] = useState(null);
  const [syncingScorecard, setSyncingScorecard] = useState(false);
  const [scorecardMsg, setScorecardMsg] = useState("");
  const [conceptMastery, setConceptMastery] = useState(null);
  const [expandedMasteryTech, setExpandedMasteryTech] = useState(null);
  const [overallFeedback, setOverallFeedback] = useState(null);
  const [refiningNarrative, setRefiningNarrative] = useState(false);

  useEffect(() => {
    fetchStudentData();
  }, [studentId]);

  const fetchStudentData = async () => {
    try {
      setLoading(true);

      // Fetch all student data in parallel
      const [analyticsRes, memoryRes, profileRes, learningRes, readinessRes, scheduleRes, todayRes, scorecardRes, masteryRes, feedbackRes] =
        await Promise.all([
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
          axios
            .get(`${BASE_URL}/trainer/technology-readiness/${studentId}`, {
              headers: getTrainerHeaders(),
            })
            .catch(() => ({ data: null })),
          personalScheduleAPI.getScheduleForTrainer(studentId).catch(() => ({
            data: { schedule: null },
          })),
          personalScheduleAPI.getTodayForTrainer(studentId).catch(() => ({
            data: { hasPlan: false },
          })),
          axios
            .get(`${BASE_URL}/student/${studentId}/placement-scorecard`, {
              headers: getTrainerHeaders(),
            })
            .catch(() => ({ data: null })),
          axios
            .get(`${BASE_URL}/student/${studentId}/concept-mastery`, {
              headers: getTrainerHeaders(),
            })
            .catch(() => ({ data: null })),
          axios
            .get(`${BASE_URL}/student/${studentId}/overall-feedback`, {
              headers: getTrainerHeaders(),
            })
            .catch(() => ({ data: null })),
        ]);

      setAnalytics(analyticsRes.data);
      setMemory(memoryRes.data);
      setProfile(profileRes.data);
      setLearningProgress(learningRes.data);
      setTechReadiness(readinessRes.data);
      setPersonalSchedule(scheduleRes.data?.schedule ?? null);
      setScheduleToday(todayRes.data ?? null);
      setScorecard(scorecardRes.data ?? null);
      setConceptMastery(masteryRes.data ?? null);
      setOverallFeedback(feedbackRes.data ?? null);

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
    if (numScore >= 7) return "text-green-600";
    if (numScore >= 5) return "text-yellow-600";
    return "text-red-600";
  };

  const getReadinessBandClass = (band) => {
    if (band === "Good") return "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
    if (band === "Average") return "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800";
    if (band === "Weak") return "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800";
    return "bg-gray-50 dark:bg-gray-800/60 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700";
  };

  const getScorecardLevelClass = (level) => {
    if (level === "Above average")
      return "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
    if (level === "Average")
      return "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800";
    if (level === "Below average")
      return "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800";
    return "bg-gray-50 dark:bg-gray-800/60 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700";
  };

  const handleSyncScorecard = async () => {
    try {
      setSyncingScorecard(true);
      setScorecardMsg("");
      const res = await axios.post(
        `${BASE_URL}/trainer/placement-summary/sync/${studentId}`,
        {},
        { headers: getTrainerHeaders() }
      );
      setScorecardMsg(res.data?.message || "Synced to placement sheet.");
      setTimeout(() => setScorecardMsg(""), 5000);
    } catch (err) {
      console.error("Scorecard sync error:", err);
      setScorecardMsg("Sync failed. Check Google Sheets credentials on the server.");
      setTimeout(() => setScorecardMsg(""), 5000);
    } finally {
      setSyncingScorecard(false);
    }
  };

  const handleRefineNarrative = async () => {
    try {
      setRefiningNarrative(true);
      const res = await axios.get(
        `${BASE_URL}/student/${studentId}/overall-feedback?ai=1`,
        { headers: getTrainerHeaders() }
      );
      setOverallFeedback(res.data ?? overallFeedback);
    } catch (err) {
      console.error("Refine narrative error:", err);
    } finally {
      setRefiningNarrative(false);
    }
  };

  const formatActivityLabel = (type) => {
    const labels = {
      guided_quiz: "Guided lesson",
      ask_topic: "Ask Anything",
      ask_quick_check: "Quick Check",
      interview: "Interview",
      coding_problem: "Coding problem",
      mini_assessment: "Daily quiz",
      chat_question: "Home chat",
    };
    return labels[type] || type;
  };

  const assessedTechnologies =
    techReadiness?.technologies?.filter((t) => t.band !== "Not assessed") || [];

  if (loading) {
    return (
      <div className="min-h-screen p-6 bg-white dark:bg-[#202124] flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400 text-sm">Loading student data…</div>
      </div>
    );
  }

  const hasLearning = learningProgress?.technologies?.length > 0;
  const hasInterviewData = analytics || memory;
  const hasPersonalSchedule = Boolean(personalSchedule?.category);
  const hasTechReadiness = assessedTechnologies.length > 0;

  if (!hasInterviewData && !hasLearning && !hasPersonalSchedule && !hasTechReadiness) {
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
            This student has no interview, guided course, or personal schedule data yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-white">
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

      {/* OVERALL FEEDBACK — the capstone synthesis */}
      {overallFeedback && (
        <div className="rounded-xl border border-gray-900/10 dark:border-gray-100/10 bg-gradient-to-br from-gray-50 to-white dark:from-[#2a2b2e] dark:to-[#232427] p-6 mb-6 shadow-sm">
          <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
            <div className="flex items-center gap-3">
              <Award className="w-6 h-6 text-indigo-500" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Overall feedback
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Synthesized from every signal across the app
                  {overallFeedback.narrativeSource === "ai" ? " · AI-written" : ""}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {overallFeedback.readinessScore != null && (
                <div className="text-right">
                  <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 leading-none">
                    {overallFeedback.readinessScore}
                    <span className="text-base font-normal text-gray-400">/100</span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {overallFeedback.level}
                  </div>
                </div>
              )}
              <button
                onClick={handleRefineNarrative}
                disabled={refiningNarrative || !overallFeedback.hasData}
                className="px-3 py-2 rounded-lg text-xs font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition disabled:opacity-50"
                title="Rewrite the summary with AI"
              >
                {refiningNarrative ? "Writing…" : "✨ AI rewrite"}
              </button>
            </div>
          </div>

          <p className="text-[15px] leading-relaxed text-gray-800 dark:text-gray-200">
            {overallFeedback.narrative}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {overallFeedback.strengths?.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
                  Strengths
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {overallFeedback.strengths.map((s, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-0.5 rounded-md text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {overallFeedback.focusAreas?.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
                  Focus areas
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {overallFeedback.focusAreas.map((s, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-0.5 rounded-md text-xs bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {overallFeedback.recommendations?.length > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
                Recommended next steps
              </p>
              <ul className="list-disc list-inside space-y-0.5 text-sm text-gray-700 dark:text-gray-300">
                {overallFeedback.recommendations.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}

          {overallFeedback.engagement && (
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
              {overallFeedback.engagement.activeDaysLast14 != null && (
                <span>Active {overallFeedback.engagement.activeDaysLast14}/14 days</span>
              )}
              {overallFeedback.engagement.momentum && (
                <span>Momentum: {overallFeedback.engagement.momentum}</span>
              )}
              {overallFeedback.engagement.churnRisk && (
                <span>Churn risk: {overallFeedback.engagement.churnRisk}</span>
              )}
              {overallFeedback.interviews?.count > 0 && (
                <span>{overallFeedback.interviews.count} interviews</span>
              )}
              {overallFeedback.recentSearches?.length > 0 && (
                <span>Seeking: {overallFeedback.recentSearches.slice(0, 2).join(", ")}</span>
              )}
            </div>
          )}
        </div>
      )}

      {/* PLACEMENT SCORECARD */}
      {scorecard?.skills?.length > 0 && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#292a2d] p-6 mb-6">
          <div className="flex items-start justify-between gap-4 mb-1 flex-wrap">
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                Placement scorecard
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Per-skill level across all MicroTrainer activity. Forward this to the
                placement team.
              </p>
            </div>
            <div className="text-right">
              <button
                onClick={handleSyncScorecard}
                disabled={syncingScorecard}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-60"
              >
                {syncingScorecard ? "Syncing…" : "Sync to placement sheet"}
              </button>
              {scorecardMsg && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-[220px]">
                  {scorecardMsg}
                </p>
              )}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {scorecard.skills.map((s) => (
              <div
                key={s.key}
                className="px-3 py-2 rounded-lg border border-gray-100 dark:border-gray-700/70"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{s.label}</span>
                  <span
                    className={`inline-flex px-2.5 py-0.5 rounded-md text-xs font-medium border ${getScorecardLevelClass(s.level)}`}
                  >
                    {s.level}
                  </span>
                </div>
                {s.weakConcepts?.length > 0 && (
                  <p className="mt-1 text-xs text-red-600/80 dark:text-red-400/80">
                    Weak: {s.weakConcepts.join(", ")}
                  </p>
                )}
              </div>
            ))}
          </div>

          {scorecard.overall?.message && (
            <div className="mt-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#202124]/60 px-4 py-3">
              <p>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Overall:
                </span>{" "}
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {scorecard.overall.message}
                </span>
              </p>
              {scorecard.topWeakConcepts?.length > 0 && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  <span className="font-medium">Focus areas:</span>{" "}
                  {scorecard.topWeakConcepts
                    .map((c) => `${c.technology} — ${c.label}`)
                    .join(" · ")}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* UNDERSTANDING BY CONCEPT */}
      {conceptMastery?.hasData && conceptMastery.technologies?.length > 0 && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#292a2d] p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-1">
            Understanding by concept
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Judged from every graded answer across the app — concept by concept, not
            just totals. Click a technology to see each concept.
          </p>
          <div className="space-y-3">
            {conceptMastery.technologies.map((tech) => {
              const open = expandedMasteryTech === tech.technology;
              return (
                <div
                  key={tech.technology}
                  className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedMasteryTech(open ? null : tech.technology)
                    }
                    className="w-full flex items-center justify-between gap-4 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/40 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-medium text-gray-800 dark:text-gray-200 capitalize">
                        {tech.technology}
                      </span>
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-md text-xs font-medium border ${getReadinessBandClass(tech.band)}`}
                      >
                        {tech.band}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 tabular-nums">
                        {tech.mastery}/100
                      </span>
                      {tech.trend !== "steady" && (
                        <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          {getTrendIcon(tech.trend === "improving" ? "improving" : "declining")}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 shrink-0">
                      {tech.conceptCount} concept{tech.conceptCount === 1 ? "" : "s"} ·{" "}
                      {tech.attempts} answer{tech.attempts === 1 ? "" : "s"}
                    </span>
                  </button>

                  {open && (
                    <div className="px-4 pb-4 pt-1 border-t border-gray-100 dark:border-gray-700/80 bg-gray-50/50 dark:bg-gray-900/20 space-y-2">
                      {tech.concepts.map((c) => (
                        <div key={c.slug} className="pt-2">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {c.label}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 tabular-nums">
                              {c.mastery}/100 · {c.attempts} ans · {c.confidence} conf
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full ${
                                c.mastery >= 75
                                  ? "bg-emerald-500"
                                  : c.mastery >= 50
                                    ? "bg-amber-500"
                                    : "bg-red-500"
                              }`}
                              style={{ width: `${Math.max(4, c.mastery)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

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
      {profile?.technologyScores &&
        Object.keys(profile.technologyScores).length > 0 && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#292a2d] p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Subject Performance</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(profile.technologyScores).map(([subject, tech], index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="border border-gray-200 rounded-xl p-4"
              >
                <div className="text-sm text-gray-500 mb-1 capitalize">{subject}</div>
                <div className={`text-2xl font-bold ${getScoreColor(tech.average)}`}>
                  {tech.average}
                </div>
                <div className="text-xs text-gray-400">{tech.count} completed interviews</div>
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

      <TrainerPersonalSchedulePanel
        schedule={personalSchedule}
        todayInfo={scheduleToday}
      />

      {hasTechReadiness && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#292a2d] p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-1">
            Technology readiness
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Combined from all learning on MicroTrainer — interviews, guided course, Ask Anything,
            problems, and quizzes. Click a technology to see recent activity.
          </p>
          <div className="space-y-3">
            {assessedTechnologies.map((tech) => (
              <div
                key={tech.technology}
                className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() =>
                    setExpandedTech(
                      expandedTech === tech.technology ? null : tech.technology
                    )
                  }
                  className="w-full flex items-center justify-between gap-4 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/40 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-medium text-gray-800 dark:text-gray-200 capitalize">
                      {tech.technology}
                    </span>
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-md text-xs font-medium border ${getReadinessBandClass(tech.band)}`}
                    >
                      {tech.band}
                    </span>
                    {tech.score != null && (
                      <span className="text-sm text-gray-500 dark:text-gray-400 tabular-nums">
                        {tech.score}/100
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 shrink-0">
                    {tech.eventCount} activities · {tech.confidence} confidence
                  </span>
                </button>

                {expandedTech === tech.technology && (
                  <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700/80 bg-gray-50/50 dark:bg-gray-900/20">
                    {tech.topicsStudied?.length > 0 && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 mb-2">
                        Topics: {tech.topicsStudied.join(", ")}
                      </p>
                    )}
                    <div className="space-y-2 max-h-64 overflow-y-auto mt-2">
                      {(techReadiness.timeline || [])
                        .filter((e) => e.technology === tech.technology)
                        .slice(0, 15)
                        .map((event) => (
                          <div
                            key={event.id}
                            className="flex flex-wrap items-center justify-between gap-2 text-sm py-1.5 border-b border-gray-100 dark:border-gray-700/60 last:border-0"
                          >
                            <div className="min-w-0">
                              <span className="text-gray-700 dark:text-gray-300">
                                {formatActivityLabel(event.activityType)}
                              </span>
                              {event.topic && (
                                <span className="text-gray-500 dark:text-gray-400 ml-2 truncate">
                                  — {event.topic}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-400 shrink-0">
                              {event.score != null && (
                                <span className="tabular-nums">{Math.round(event.score)}%</span>
                              )}
                              <span>
                                {new Date(event.timestamp).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

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

      <div className="mb-6">
        <InterviewHistoryPanel
          studentId={studentId}
          title="Interview history"
        />
      </div>

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
