import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  RefreshCw,
  Download,
  SlidersHorizontal,
  Mic,
  BookOpen,
  TrendingUp,
  TrendingDown,
  Minus,
  X,
  BarChart3,
} from "lucide-react";
import AppSelect from "../components/AppSelect";
import FeedbackScreenshotThumb from "../components/FeedbackScreenshotThumb";
import { getTrainerHeaders } from "../utils/trainerAuth";

const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const btnSecondary =
  "inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#292a2d] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition disabled:opacity-50 disabled:cursor-not-allowed";

const btnPrimary =
  "inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg bg-[#1a73e8] dark:bg-[#8ab4f8] text-white dark:text-gray-900 hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed";

function TabButton({ active, onClick, icon: Icon, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition -mb-px ${
        active
          ? "border-[#1a73e8] dark:border-[#8ab4f8] text-gray-900 dark:text-gray-100"
          : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
      }`}
    >
      <Icon className="w-4 h-4 shrink-0 opacity-80" strokeWidth={2} />
      {children}
    </button>
  );
}

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
  const [syncingReadiness, setSyncingReadiness] = useState(false);
  const [exportMessage, setExportMessage] = useState("");
  const [activeTab, setActiveTab] = useState("interviews");
  const [bugReports, setBugReports] = useState([]);
  const [readinessData, setReadinessData] = useState({ students: [], technologies: [] });
  const [readinessLoading, setReadinessLoading] = useState(true);

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
    fetchTechnologyReadiness();
  }, [subject, selectedSubjects]);

  const fetchTechnologyReadiness = async () => {
    try {
      setReadinessLoading(true);
      const res = await axios.get(`${BASE_URL}/trainer/technology-readiness`, {
        headers: getTrainerHeaders(),
      });
      setReadinessData({
        students: res.data?.students || [],
        technologies: res.data?.technologies || availableSubjects,
      });
    } catch (err) {
      console.error("Technology readiness error:", err);
      setReadinessData({ students: [], technologies: availableSubjects });
    } finally {
      setReadinessLoading(false);
    }
  };

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
        `Exported ${res.data.studentsExported} students to Google Sheets.`
      );
      setTimeout(() => setExportMessage(""), 5000);
    } catch (err) {
      console.error("Export error:", err);
      setExportMessage("Export failed. Please try again.");
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
      setExportMessage(res.data.message || "Course progress synced.");
      await fetchLearningProgress();
      setTimeout(() => setExportMessage(""), 5000);
    } catch (err) {
      console.error("Learning sync error:", err);
      setExportMessage(
        "Sync failed. Check Google Sheets credentials on the server."
      );
      setTimeout(() => setExportMessage(""), 5000);
    } finally {
      setSyncingLearning(false);
    }
  };

  const handleSyncTechnologyReadiness = async () => {
    try {
      setSyncingReadiness(true);
      setExportMessage("");
      const res = await axios.post(
        `${BASE_URL}/trainer/technology-readiness/sync`,
        {},
        { headers: getTrainerHeaders() }
      );
      setExportMessage(res.data.message || "Technology readiness synced.");
      await fetchTechnologyReadiness();
      setTimeout(() => setExportMessage(""), 5000);
    } catch (err) {
      console.error("Readiness sync error:", err);
      setExportMessage(
        "Readiness sync failed. Check Google Sheets credentials on the server."
      );
      setTimeout(() => setExportMessage(""), 5000);
    } finally {
      setSyncingReadiness(false);
    }
  };

  const getTrendDisplay = (trend) => {
    if (trend === "improving") {
      return {
        Icon: TrendingUp,
        className: "text-green-600 dark:text-green-400",
        label: "Improving",
      };
    }
    if (trend === "declining") {
      return {
        Icon: TrendingDown,
        className: "text-red-600 dark:text-red-400",
        label: "Declining",
      };
    }
    return {
      Icon: Minus,
      className: "text-gray-500 dark:text-gray-400",
      label: trend || "Stable",
    };
  };

  const getLevelBadge = (level) => {
    if (!level) return null;

    const styles = {
      advanced:
        "bg-gray-100 dark:bg-gray-700/60 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600",
      intermediate:
        "bg-gray-100 dark:bg-gray-700/60 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600",
      beginner:
        "bg-gray-50 dark:bg-gray-800/80 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700",
    };

    return (
      <span
        className={`px-2 py-0.5 rounded-md text-xs font-medium border ${
          styles[level] || styles.beginner
        }`}
      >
        {level.charAt(0).toUpperCase() + level.slice(1)}
      </span>
    );
  };

  const getProgressColor = (pct) => {
    if (pct >= 80) return "text-green-600 dark:text-green-400";
    if (pct >= 40) return "text-amber-600 dark:text-amber-400";
    if (pct > 0) return "text-gray-700 dark:text-gray-300";
    return "text-gray-400 dark:text-gray-500";
  };

  const formatSyncLabel = (syncStatus) => {
    if (!syncStatus?.lastSuccessfulSyncAt) return "No sync";
    return new Date(syncStatus.lastSuccessfulSyncAt).toLocaleDateString();
  };

  const getReadinessBandClass = (band) => {
    if (band === "Good") return "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
    if (band === "Average") return "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800";
    if (band === "Weak") return "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800";
    return "bg-gray-50 dark:bg-gray-800/60 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-700";
  };

  const getStudentTechBand = (student, tech) => {
    const entry = (student.technologies || []).find(
      (t) => t.technology === tech
    );
    return entry?.band || "—";
  };

  const getSyncBadge = (syncStatus) => {
    const connected = syncStatus?.officialBenefitsEnabled;
    return (
      <span
        className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium border ${
          connected
            ? "bg-gray-50 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600"
            : "bg-gray-50 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700"
        }`}
        title={syncStatus?.message || "Official sync status unknown"}
      >
        {connected ? "Synced" : "Not synced"}
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

  const exportOk = exportMessage && !exportMessage.toLowerCase().includes("fail");

  return (
    <div className="min-h-screen pb-10">
      <header className="mb-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-2xl font-medium text-gray-900 dark:text-gray-100 tracking-tight">
              Trainer dashboard
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-xl">
              Interview rankings and guided course progress. Data syncs to Google
              Sheets when configured.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <button
              type="button"
              onClick={handleSyncLearningProgress}
              disabled={syncingLearning || learningLoading}
              className={btnSecondary}
            >
              <RefreshCw
                className={`w-4 h-4 ${syncingLearning ? "animate-spin" : ""}`}
              />
              {syncingLearning ? "Syncing…" : "Sync course progress"}
            </button>

            <button
              type="button"
              onClick={handleSyncTechnologyReadiness}
              disabled={syncingReadiness || readinessLoading}
              className={btnSecondary}
            >
              <RefreshCw
                className={`w-4 h-4 ${syncingReadiness ? "animate-spin" : ""}`}
              />
              {syncingReadiness ? "Syncing…" : "Sync tech readiness"}
            </button>

            <button
              type="button"
              onClick={handleExportToSheets}
              disabled={exporting || loading}
              className={btnPrimary}
            >
              <Download className="w-4 h-4" />
              {exporting ? "Exporting…" : "Export interviews"}
            </button>

            {activeTab === "interviews" && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setShowMultiSelect(!showMultiSelect);
                    if (showMultiSelect) clearMultiSelect();
                  }}
                  className={`${btnSecondary} ${
                    showMultiSelect
                      ? "border-[#1a73e8] dark:border-[#8ab4f8] text-[#1a73e8] dark:text-[#8ab4f8]"
                      : ""
                  }`}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  {showMultiSelect ? "Close filters" : "Compare subjects"}
                </button>

                {!showMultiSelect && (
                  <AppSelect
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="min-w-[140px] py-2 text-sm rounded-lg"
                  >
                    <option value="fullstack">Fullstack</option>
                    <option value="react">React</option>
                    <option value="java">Java</option>
                    <option value="python">Python</option>
                    <option value="javascript">JavaScript</option>
                    <option value="nodejs">Node.js</option>
                  </AppSelect>
                )}
              </>
            )}
          </div>
        </div>

        <nav
          className="mt-8 flex gap-1 border-b border-gray-200 dark:border-gray-700"
          aria-label="Dashboard sections"
        >
          <TabButton
            active={activeTab === "interviews"}
            onClick={() => setActiveTab("interviews")}
            icon={Mic}
          >
            Interview leaderboard
          </TabButton>
          <TabButton
            active={activeTab === "learning"}
            onClick={() => setActiveTab("learning")}
            icon={BookOpen}
          >
            Guided course progress
          </TabButton>
          <TabButton
            active={activeTab === "readiness"}
            onClick={() => setActiveTab("readiness")}
            icon={BarChart3}
          >
            Technology readiness
          </TabButton>
        </nav>
      </header>

      {showMultiSelect && activeTab === "interviews" && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#292a2d] p-4"
        >
          <div className="flex items-center justify-between mb-3 gap-3">
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Compare technologies
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {selectedSubjects.length === 0
                  ? "Select two or more to rank by average score"
                  : `${selectedSubjects.length} selected`}
              </p>
            </div>
            {selectedSubjects.length > 0 && (
              <button
                type="button"
                onClick={clearMultiSelect}
                className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                <X className="w-3.5 h-3.5" />
                Clear
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {availableSubjects.map((subj) => {
              const selected = selectedSubjects.includes(subj);
              return (
                <button
                  key={subj}
                  type="button"
                  onClick={() => toggleSubjectSelection(subj)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition ${
                    selected
                      ? "border-[#1a73e8] dark:border-[#8ab4f8] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      : "border-gray-200 dark:border-gray-600 bg-white dark:bg-[#202124] text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500"
                  }`}
                >
                  {subj.charAt(0).toUpperCase() + subj.slice(1)}
                </button>
              );
            })}
          </div>
        </motion.div>
      )}

      {exportMessage && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-4 px-4 py-3 rounded-lg text-sm border ${
            exportOk
              ? "bg-gray-50 dark:bg-gray-800/50 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700"
              : "bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-200 border-red-200 dark:border-red-900"
          }`}
          role="status"
        >
          {exportMessage}
        </motion.div>
      )}

      {bugReports.length > 0 && (
        <div className="mb-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#292a2d] p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Recent feedback
            </h2>
            <button
              type="button"
              onClick={fetchBugReports}
              className="text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Refresh
            </button>
          </div>
          <ul className="space-y-2 max-h-48 overflow-y-auto">
            {bugReports.map((r, i) => (
              <li
                key={`${r.timestamp}-${i}`}
                className="text-sm rounded-lg px-3 py-2 border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-[#202124]"
              >
                <div className="flex justify-between gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>{r.name || r.email || r.studentId}</span>
                  <span>{new Date(r.timestamp).toLocaleString()}</span>
                </div>
                <p className="text-gray-800 dark:text-gray-200 mt-1 line-clamp-2">
                  {r.message}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 font-mono">
                  {r.pagePath}
                </p>
                {r.screenshotCount > 0 && r.reportId && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(r.screenshots || []).map((shot) => (
                      <FeedbackScreenshotThumb
                        key={shot.id}
                        reportId={r.reportId}
                        screenshot={shot}
                      />
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {activeTab === "interviews" && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#292a2d] overflow-hidden">
          <div className="grid grid-cols-6 gap-2 px-4 py-3 border-b border-gray-200 dark:border-gray-700 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            <span>Rank</span>
            <span>Student</span>
            <span>Score</span>
            <span>Level</span>
            <span>Trend</span>
            <span>Subjects</span>
          </div>

          {loading && (
            <div className="px-4 py-8 text-sm text-gray-500 dark:text-gray-400 text-center">
              Loading leaderboard…
            </div>
          )}

          {!loading &&
            interviewRows.map((student, index) => {
              const trend = getTrendDisplay(student.memory?.trend);
              const TrendIcon = trend.Icon;
              return (
                <motion.div
                  key={student.studentId}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() =>
                    navigate(`/trainer/student/${student.studentId}`)
                  }
                  className={`grid grid-cols-6 gap-2 px-4 py-3 border-b border-gray-100 dark:border-gray-700/80 text-sm cursor-pointer transition ${
                    index < 3
                      ? "bg-gray-50/80 dark:bg-gray-800/30 hover:bg-gray-100 dark:hover:bg-gray-800/50"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800/30"
                  }`}
                >
                  <span className="font-medium text-gray-800 dark:text-gray-200 tabular-nums">
                    {student.rank}
                  </span>
                  <span className="text-gray-700 dark:text-gray-300 font-medium truncate">
                    {student.studentId}
                  </span>
                  <span
                    className={`font-medium tabular-nums ${
                      parseFloat(student.score) >= 80
                        ? "text-green-600 dark:text-green-400"
                        : parseFloat(student.score) >= 60
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {student.score}
                  </span>
                  <div className="flex items-center">
                    {student.memory?.level ? (
                      getLevelBadge(student.memory.level)
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500 text-xs">
                        —
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {student.memory?.trend ? (
                      <>
                        <TrendIcon
                          className={`w-4 h-4 shrink-0 ${trend.className}`}
                        />
                        <span className={`text-xs capitalize ${trend.className}`}>
                          {trend.label}
                        </span>
                      </>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500 text-xs">
                        —
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {subject === "fullstack"
                      ? Object.entries(student.subjects || {})
                          .slice(0, 3)
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(" · ")
                      : student.subjects?.[subject]
                        ? `${subject}: ${student.subjects[subject]}`
                        : "—"}
                  </span>
                </motion.div>
              );
            })}

          {!loading && students.length === 0 && (
            <div className="px-4 py-8 text-sm text-gray-500 dark:text-gray-400 text-center">
              No interview data yet. Scores appear after students complete mock
              interviews.
            </div>
          )}
        </div>
      )}

      {activeTab === "readiness" && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#292a2d] overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#202124]/50">
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Overall strength per technology from interviews, guided lessons, Ask Anything,
              coding problems, and daily quizzes. Rows auto-sync to the{" "}
              <span className="font-medium">Technology_Readiness</span> sheet tab when students
              learn. Use <span className="font-medium">Sync tech readiness</span> for a full refresh.
            </p>
          </div>

          <div className="overflow-x-auto">
            <div
              className="grid gap-2 px-4 py-3 border-b border-gray-200 dark:border-gray-700 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 min-w-[900px]"
              style={{
                gridTemplateColumns: `minmax(140px, 1.4fr) repeat(${readinessData.technologies.length}, minmax(72px, 1fr))`,
              }}
            >
              <span>Student</span>
              {readinessData.technologies.map((tech) => (
                <span key={tech} className="text-center capitalize truncate">
                  {tech}
                </span>
              ))}
            </div>

            {readinessLoading && (
              <div className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                Loading technology readiness…
              </div>
            )}

            {!readinessLoading &&
              readinessData.students.map((student) => (
                <motion.div
                  key={student.studentId}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => navigate(`/trainer/student/${student.studentId}`)}
                  className="grid gap-2 px-4 py-3 border-b border-gray-100 dark:border-gray-700/80 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/30 transition min-w-[900px]"
                  style={{
                    gridTemplateColumns: `minmax(140px, 1.4fr) repeat(${readinessData.technologies.length}, minmax(72px, 1fr))`,
                  }}
                >
                  <span className="font-medium text-gray-800 dark:text-gray-200 truncate">
                    {student.displayName || student.name || student.studentId}
                  </span>
                  {readinessData.technologies.map((tech) => {
                    const band = getStudentTechBand(student, tech);
                    return (
                      <span key={tech} className="flex justify-center">
                        <span
                          className={`inline-flex items-center justify-center min-w-[4.5rem] px-2 py-0.5 rounded-md text-xs font-medium border ${getReadinessBandClass(band)}`}
                        >
                          {band === "Not assessed" ? "—" : band}
                        </span>
                      </span>
                    );
                  })}
                </motion.div>
              ))}

            {!readinessLoading && readinessData.students.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                No learning activity recorded yet. Students appear here after interviews,
                guided lessons, Ask Anything, or problem solving.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "learning" && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#292a2d] overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#202124]/50">
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Progress updates when students pass a lesson quiz (60% or higher).
              Use <span className="font-medium">Sync course progress</span> to push
              records to the Learning_Progress sheet.
            </p>
          </div>

          <div className="grid grid-cols-9 gap-2 px-4 py-3 border-b border-gray-200 dark:border-gray-700 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            <span className="col-span-2">Name</span>
            <span>Initial</span>
            <span>Batch</span>
            <span>Course %</span>
            <span>Lesson</span>
            <span>Done</span>
            <span>Sync</span>
            <span>Tech</span>
          </div>

          {learningLoading && (
            <div className="px-4 py-8 text-sm text-gray-500 dark:text-gray-400 text-center">
              Loading course progress…
            </div>
          )}

          {!learningLoading &&
            learningStudents.map((student, index) => (
              <motion.div
                key={student.studentId}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() =>
                  navigate(`/trainer/student/${student.studentId}`)
                }
                className={`grid grid-cols-9 gap-2 px-4 py-3 border-b border-gray-100 dark:border-gray-700/80 text-sm cursor-pointer transition ${
                  index < 3
                    ? "bg-gray-50/80 dark:bg-gray-800/30 hover:bg-gray-100 dark:hover:bg-gray-800/50"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800/30"
                }`}
              >
                <span className="col-span-2 text-gray-800 dark:text-gray-200 font-medium truncate">
                  {student.name || student.displayName || student.studentId}
                </span>
                <span className="text-gray-700 dark:text-gray-300 tabular-nums">
                  {student.initial || "—"}
                </span>
                <span className="text-gray-600 dark:text-gray-400 text-xs truncate">
                  {student.batch || "—"}
                </span>
                <span
                  className={`font-medium tabular-nums ${getProgressColor(student.learningProgress)}`}
                >
                  {student.learningProgress ?? 0}%
                </span>
                <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
                  {student.currentTechnology
                    ? `${student.currentTechnology} — ${student.currentLesson || "—"}`
                    : "Not started"}
                </span>
                <span className="text-gray-600 dark:text-gray-400 tabular-nums">
                  {student.conceptsCompleted ?? 0}
                </span>
                <span className="text-xs">
                  {getSyncBadge(student.syncStatus)}
                  <span className="block text-gray-400 dark:text-gray-500 mt-0.5">
                    {formatSyncLabel(student.syncStatus)}
                  </span>
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {(student.technologies || [])
                    .map(
                      (t) =>
                        `${t.technology}: ${t.overallProgress}% (${t.completedCount}/${t.totalConcepts})`
                    )
                    .join(" · ") || "—"}
                </span>
              </motion.div>
            ))}

          {!learningLoading && learningStudents.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              No guided course progress yet. Students appear after they complete a
              lesson quiz, or after you sync from the server.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TrainerDashboard;
