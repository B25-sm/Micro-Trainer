import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

import { getTrainerHeaders } from "../utils/trainerAuth";

const TrainerDashboard = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [studentsWithProgress, setStudentsWithProgress] = useState([]);
  const [learningStudents, setLearningStudents] = useState([]);
  const [subject, setSubject] = useState("fullstack");
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [showMultiSelect, setShowMultiSelect] = useState(false);
  const [loading, setLoading] = useState(true);
  const [learningLoading, setLearningLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [syncingLearning, setSyncingLearning] = useState(false);
  const [exportMessage, setExportMessage] = useState("");
  const [activeTab, setActiveTab] = useState("interviews");
  const [bugReports, setBugReports] = useState([]);

  const availableSubjects = [
    "react",
    "java",
    "python",
    "javascript",
    "nodejs",
    "angular",
    "typescript",
    "sql",
  ];

  useEffect(() => {
    fetchLeaderboard();
    fetchLearningProgress();
    fetchBugReports();
  }, [subject, selectedSubjects]);

  const fetchBugReports = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/trainer/feedback/recent?limit=8`, {
        headers: getTrainerHeaders(),
      });
      setBugReports(res.data?.reports || []);
    } catch (err) {
      console.error("Bug reports fetch error:", err);
    }
  };

  const fetchLearningProgress = async () => {
    try {
      setLearningLoading(true);
      const res = await axios.get(`${BASE_URL}/trainer/learning-progress`, {
        headers: getTrainerHeaders(),
      });
      setLearningStudents(res.data?.students || []);
    } catch (err) {
      console.error("Learning progress error:", err);
      setLearningStudents([]);
    } finally {
      setLearningLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);

      if (selectedSubjects.length > 0) {
        const res = await axios.get(`${BASE_URL}/trainer/leaderboard`, {
          headers: getTrainerHeaders(),
        });

        const studentsList = res.data || [];

        const rankedStudents = studentsList
          .map((student) => {
            const selectedScores = selectedSubjects
              .map((sub) => parseFloat(student.subjects?.[sub] || 0))
              .filter((score) => score > 0);

            if (selectedScores.length === 0) {
              return { ...student, score: 0, hasAllSubjects: false };
            }

            const avgScore = (
              selectedScores.reduce((a, b) => a + b, 0) / selectedScores.length
            ).toFixed(2);

            return {
              ...student,
              score: avgScore,
              hasAllSubjects: selectedScores.length === selectedSubjects.length,
              matchedSubjects: selectedScores.length,
            };
          })
          .filter((student) => student.matchedSubjects > 0)
          .sort((a, b) => parseFloat(b.score) - parseFloat(a.score))
          .map((student, index) => ({ ...student, rank: index + 1 }));

        setStudents(rankedStudents);
        fetchStudentProgress(rankedStudents);
      } else {
        const url =
          subject === "fullstack"
            ? `${BASE_URL}/trainer/leaderboard`
            : `${BASE_URL}/trainer/leaderboard/${subject}`;

        const res = await axios.get(url, { headers: getTrainerHeaders() });

        const studentsList = res.data || [];
        setStudents(studentsList);
        fetchStudentProgress(studentsList);
      }
    } catch (err) {
      console.error("Leaderboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentProgress = async (studentsList) => {
    try {
      const progressPromises = studentsList.map(async (student) => {
        try {
          const memoryRes = await axios.get(
            `${BASE_URL}/student/${student.studentId}/memory`,
            { headers: getTrainerHeaders() }
          );
          return { ...student, memory: memoryRes.data };
        } catch {
          return { ...student, memory: null };
        }
      });

      const studentsWithMem = await Promise.all(progressPromises);
      setStudentsWithProgress(studentsWithMem);
    } catch (err) {
      console.error("Progress fetch error:", err);
      setStudentsWithProgress(studentsList);
    }
  };

  const handleExportToSheets = async () => {
    try {
      setExporting(true);
      setExportMessage("");

      const url =
        subject === "fullstack"
          ? `${BASE_URL}/admin/export-status`
          : `${BASE_URL}/admin/export-status/${subject}`;

      const res = await axios.post(url, {}, { headers: getTrainerHeaders() });

      setExportMessage(
        `✅ Exported ${res.data.studentsExported} students to Google Sheets!`
      );
      setTimeout(() => setExportMessage(""), 5000);
    } catch (err) {
      console.error("Export error:", err);
      setExportMessage("❌ Export failed. Please try again.");
      setTimeout(() => setExportMessage(""), 5000);
    } finally {
      setExporting(false);
    }
  };

  const handleSyncLearningProgress = async () => {
    try {
      setSyncingLearning(true);
      setExportMessage("");
      const res = await axios.post(
        `${BASE_URL}/trainer/learning-progress/sync`,
        {},
        { headers: getTrainerHeaders() }
      );
      setExportMessage(`✅ ${res.data.message}`);
      await fetchLearningProgress();
      setTimeout(() => setExportMessage(""), 5000);
    } catch (err) {
      console.error("Learning sync error:", err);
      setExportMessage(
        "❌ Learning progress sync failed. Check Google Sheets credentials."
      );
      setTimeout(() => setExportMessage(""), 5000);
    } finally {
      setSyncingLearning(false);
    }
  };

  const getTrendIcon = (trend) => {
    if (trend === "improving") return "↗️";
    if (trend === "declining") return "↘️";
    return "→";
  };

  const getTrendColor = (trend) => {
    if (trend === "improving") return "text-green-600";
    if (trend === "declining") return "text-red-600";
    return "text-gray-500";
  };

  const getLevelBadge = (level) => {
    if (!level) return null;

    const colors = {
      advanced: "bg-purple-100 text-purple-700 border-purple-300",
      intermediate: "bg-blue-100 text-blue-700 border-blue-300",
      beginner: "bg-green-100 text-green-700 border-green-300",
    };

    return (
      <span
        className={`px-2 py-0.5 rounded-lg text-xs font-medium border ${colors[level] || colors.beginner}`}
      >
        {level.charAt(0).toUpperCase() + level.slice(1)}
      </span>
    );
  };

  const getProgressColor = (pct) => {
    if (pct >= 80) return "text-green-600";
    if (pct >= 40) return "text-yellow-600";
    if (pct > 0) return "text-blue-600";
    return "text-gray-400";
  };

  const formatSyncLabel = (syncStatus) => {
    if (!syncStatus?.lastSuccessfulSyncAt) return "No sync";
    return new Date(syncStatus.lastSuccessfulSyncAt).toLocaleDateString();
  };

  const getSyncBadge = (syncStatus) => {
    const connected = syncStatus?.officialBenefitsEnabled;
    return (
      <span
        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${
          connected
            ? "bg-emerald-100 text-emerald-700"
            : "bg-amber-100 text-amber-800"
        }`}
        title={syncStatus?.message || "Official sync status unknown"}
      >
        {connected ? "Synced" : "No official sync"}
      </span>
    );
  };

  const toggleSubjectSelection = (subj) => {
    setSelectedSubjects((prev) =>
      prev.includes(subj) ? prev.filter((s) => s !== subj) : [...prev, subj]
    );
  };

  const clearMultiSelect = () => {
    setSelectedSubjects([]);
    setShowMultiSelect(false);
    setSubject("fullstack");
  };

  const interviewRows =
    studentsWithProgress.length > 0 ? studentsWithProgress : students;

  return (
    <div className="min-h-screen p-6 bg-white">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Trainer Dashboard</h1>
          <p className="text-gray-500 text-sm">
            Interview rankings & guided course progress (synced to Google Sheets)
          </p>
        </div>

        <div className="flex flex-wrap gap-3 items-center justify-end">
          <button
            onClick={handleSyncLearningProgress}
            disabled={syncingLearning || learningLoading}
            className={`px-4 py-2 rounded-xl font-medium transition ${
              syncingLearning
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700"
            }`}
          >
            {syncingLearning ? "Syncing..." : "📚 Sync Course Progress"}
          </button>

          <button
            onClick={handleExportToSheets}
            disabled={exporting || loading}
            className={`px-4 py-2 rounded-xl font-medium transition ${
              exporting
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
            }`}
          >
            {exporting ? "Exporting..." : "📊 Export Interviews"}
          </button>

          {activeTab === "interviews" && (
            <>
              <button
                onClick={() => {
                  setShowMultiSelect(!showMultiSelect);
                  if (showMultiSelect) clearMultiSelect();
                }}
                className={`px-4 py-2 rounded-xl font-medium transition ${
                  showMultiSelect
                    ? "bg-purple-500 text-white"
                    : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {showMultiSelect ? "✓ Multi-Select" : "🎯 Multi-Select"}
              </button>

              {!showMultiSelect && (
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="app-select p-2 rounded-xl min-w-[140px]"
                >
                  <option value="fullstack">Fullstack</option>
                  <option value="react">React</option>
                  <option value="java">Java</option>
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                  <option value="nodejs">Node.js</option>
                </select>
              )}
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("interviews")}
          className={`px-4 py-2 rounded-xl font-medium transition ${
            activeTab === "interviews"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          🎤 Interview Leaderboard
        </button>
        <button
          onClick={() => setActiveTab("learning")}
          className={`px-4 py-2 rounded-xl font-medium transition ${
            activeTab === "learning"
              ? "bg-emerald-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          📚 Guided Course Progress
        </button>
      </div>

      {showMultiSelect && activeTab === "interviews" && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-4 mb-6 border border-purple-200"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold text-gray-800">
                Select Technologies to Compare
              </h3>
              <p className="text-sm text-gray-600">
                {selectedSubjects.length === 0
                  ? "Choose 2 or more technologies to see combined rankings"
                  : `Selected: ${selectedSubjects.length} technologies`}
              </p>
            </div>
            {selectedSubjects.length > 0 && (
              <button
                onClick={clearMultiSelect}
                className="px-3 py-1 bg-white rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition"
              >
                Clear All
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {availableSubjects.map((subj) => (
              <button
                key={subj}
                onClick={() => toggleSubjectSelection(subj)}
                className={`px-4 py-2 rounded-xl font-medium transition ${
                  selectedSubjects.includes(subj)
                    ? "bg-purple-500 text-white shadow-md"
                    : "bg-white text-gray-700 border border-gray-200 hover:border-purple-300"
                }`}
              >
                {selectedSubjects.includes(subj) && "✓ "}
                {subj.charAt(0).toUpperCase() + subj.slice(1)}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {exportMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-4 p-3 rounded-xl ${
            exportMessage.includes("✅")
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {exportMessage}
        </motion.div>
      )}

      {bugReports.length > 0 && (
        <div className="mb-6 rounded-2xl border border-indigo-100 bg-indigo-50/50 dark:bg-indigo-950/20 dark:border-indigo-900/40 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Recent bug reports
            </h2>
            <button
              type="button"
              onClick={fetchBugReports}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
            >
              Refresh
            </button>
          </div>
          <ul className="space-y-2 max-h-48 overflow-y-auto">
            {bugReports.map((r, i) => (
              <li
                key={`${r.timestamp}-${i}`}
                className="text-sm bg-white dark:bg-slate-900 rounded-xl px-3 py-2 border border-slate-100 dark:border-slate-800"
              >
                <div className="flex justify-between gap-2 text-xs text-slate-500">
                  <span>{r.name || r.email || r.studentId}</span>
                  <span>{new Date(r.timestamp).toLocaleString()}</span>
                </div>
                <p className="text-slate-800 dark:text-slate-200 mt-1 line-clamp-2">
                  {r.message}
                </p>
                <p className="text-xs text-slate-400 mt-0.5 font-mono">{r.pagePath}</p>
              </li>
            ))}
          </ul>
          <p className="text-xs text-slate-500 mt-2">
            Also logged to Google Sheet tab &quot;BugReports&quot; and server console when running.
          </p>
        </div>
      )}

      {/* Interview table */}
      {activeTab === "interviews" && (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="grid grid-cols-6 p-4 border-b border-gray-200 text-sm text-gray-500 font-medium">
            <span>Rank</span>
            <span>Student ID</span>
            <span>Score</span>
            <span>Level</span>
            <span>Trend</span>
            <span>Subjects</span>
          </div>

          {loading && (
            <div className="p-4 text-gray-500 text-sm">Loading leaderboard...</div>
          )}

          {!loading &&
            interviewRows.map((student, index) => (
              <motion.div
                key={student.studentId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() =>
                  navigate(`/trainer/student/${student.studentId}`)
                }
                className={`grid grid-cols-6 p-4 border-b border-gray-200 transition cursor-pointer ${
                  index < 3 ? "bg-blue-50 hover:bg-blue-100" : "hover:bg-gray-50"
                }`}
              >
                <span className="font-semibold text-gray-800 flex items-center">
                  #{student.rank}
                  {index === 0 && <span className="ml-2">🥇</span>}
                  {index === 1 && <span className="ml-2">🥈</span>}
                  {index === 2 && <span className="ml-2">🥉</span>}
                </span>
                <span className="text-gray-700 font-medium">
                  {student.studentId}
                </span>
                <span
                  className={`font-bold ${
                    parseFloat(student.score) >= 80
                      ? "text-green-600"
                      : parseFloat(student.score) >= 60
                        ? "text-yellow-600"
                        : "text-red-600"
                  }`}
                >
                  {student.score}
                </span>
                <div className="flex items-center">
                  {student.memory?.level ? (
                    getLevelBadge(student.memory.level)
                  ) : (
                    <span className="text-gray-400 text-xs">N/A</span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {student.memory?.trend ? (
                    <>
                      <span
                        className={`text-lg ${getTrendColor(student.memory.trend)}`}
                      >
                        {getTrendIcon(student.memory.trend)}
                      </span>
                      <span
                        className={`text-xs ${getTrendColor(student.memory.trend)} capitalize`}
                      >
                        {student.memory.trend}
                      </span>
                    </>
                  ) : (
                    <span className="text-gray-400 text-xs">N/A</span>
                  )}
                </div>
                <span className="text-sm text-gray-500 truncate">
                  {subject === "fullstack"
                    ? Object.entries(student.subjects || {})
                        .slice(0, 3)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(" | ")
                    : student.subjects?.[subject]
                      ? `${subject}: ${student.subjects[subject]}`
                      : "N/A"}
                </span>
              </motion.div>
            ))}

          {!loading && students.length === 0 && (
            <div className="p-4 text-gray-500 text-sm">No interview data available</div>
          )}
        </div>
      )}

      {/* Guided course progress table */}
      {activeTab === "learning" && (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-gray-100 bg-emerald-50">
            <p className="text-sm text-emerald-800">
              Progress updates when students pass a lesson quiz (≥60%). Data is
              stored on the server and synced to the <strong>Learning_Progress</strong> tab
              in Google Sheets. Use <strong>Sync Course Progress</strong> to push all
              on-server records to Sheets.
            </p>
          </div>

          <div className="grid grid-cols-9 p-4 border-b border-gray-200 text-sm text-gray-500 font-medium">
            <span className="col-span-2">Name</span>
            <span>Initial</span>
            <span>Batch</span>
            <span>Course %</span>
            <span>Current lesson</span>
            <span>Concepts done</span>
            <span>Official sync</span>
            <span>Technologies</span>
          </div>

          {learningLoading && (
            <div className="p-4 text-gray-500 text-sm">Loading course progress...</div>
          )}

          {!learningLoading &&
            learningStudents.map((student, index) => (
              <motion.div
                key={student.studentId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() =>
                  navigate(`/trainer/student/${student.studentId}`)
                }
                className={`grid grid-cols-9 p-4 border-b border-gray-200 transition cursor-pointer ${
                  index < 3
                    ? "bg-emerald-50 hover:bg-emerald-100"
                    : "hover:bg-gray-50"
                }`}
              >
                <span className="col-span-2 text-gray-800 font-medium truncate">
                  {student.name || student.displayName || student.studentId}
                </span>
                <span className="text-gray-700 font-semibold">
                  {student.initial || "—"}
                </span>
                <span className="text-gray-600 text-sm truncate">
                  {student.batch || "—"}
                </span>
                <span
                  className={`font-bold ${getProgressColor(student.learningProgress)}`}
                >
                  {student.learningProgress ?? 0}%
                </span>
                <span className="text-sm text-gray-600">
                  {student.currentTechnology
                    ? `${student.currentTechnology} — ${student.currentLesson || "—"}`
                    : "Not started"}
                </span>
                <span className="text-sm text-gray-600">
                  {student.conceptsCompleted ?? 0}
                </span>
                <span className="text-sm text-gray-600">
                  {getSyncBadge(student.syncStatus)}
                  <span className="block text-xs text-gray-400 mt-1">
                    {formatSyncLabel(student.syncStatus)}
                  </span>
                </span>
                <span className="text-sm text-gray-500 truncate">
                  {(student.technologies || [])
                    .map(
                      (t) =>
                        `${t.technology}: ${t.overallProgress}% (${t.completedCount}/${t.totalConcepts})`
                    )
                    .join(" | ") || "—"}
                </span>
              </motion.div>
            ))}

          {!learningLoading && learningStudents.length === 0 && (
            <div className="p-6 text-center text-gray-500 text-sm">
              No guided course progress yet. Students appear here after they complete
              at least one lesson quiz, or after you run Sync Course Progress.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TrainerDashboard;
