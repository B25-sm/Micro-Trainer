import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAnalytics, getMemory, getRecommendations } from "../api";
import { motion } from "framer-motion";
import SyncRequiredBanner from "../components/SyncRequiredBanner";
import InterviewHistoryPanel from "../components/InterviewHistoryPanel";
import { getStudentId } from "../utils/studentAuth";
import { isTrainerSession } from "../utils/trainerAuth";
import {
  clearAuthSession,
  getSessionStudentId,
  isAuthError,
} from "../utils/authSession";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const EMPTY_ANALYTICS = {
  totalQuestions: 0,
  averageScore: "0.00",
  communicationScore: "0.00",
  technicalScore: "0.00",
  weakAreas: [],
};

const EMPTY_MEMORY = {
  level: "Beginner",
  trend: "Stable",
  consistency: "New",
  totalAttempts: 0,
  strongConcepts: [],
  weakConcepts: [],
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [memory, setMemory] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error | trainer | no-profile | auth-expired

  useEffect(() => {
    if (isTrainerSession()) {
      setStatus("trainer");
      return;
    }

    const studentId = getSessionStudentId();
    if (!studentId) {
      setStatus("no-profile");
      return;
    }

    fetchData(studentId);
  }, []);

  const fetchData = async (studentId) => {
    setStatus("loading");
    try {
      const [aRes, mRes] = await Promise.all([
        getAnalytics(studentId),
        getMemory(studentId),
      ]);

      setAnalytics({ ...EMPTY_ANALYTICS, ...(aRes.data || {}) });
      setMemory({ ...EMPTY_MEMORY, ...(mRes.data || {}) });
      setStatus("ready");

      // Recommendations are non-critical — never block the dashboard on them
      getRecommendations(studentId)
        .then((rRes) => setRecommendations(rRes.data?.recommendations || []))
        .catch(() => setRecommendations([]));
    } catch (err) {
      console.error("Dashboard error:", err);
      if (isAuthError(err)) {
        setStatus("auth-expired");
        return;
      }
      setStatus("error");
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
          <div className="flex gap-1">
            <span
              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}
            />
            <span
              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}
            />
            <span
              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            />
          </div>
          <span>Loading dashboard…</span>
        </div>
      </div>
    );
  }

  if (status === "trainer") {
    return (
      <div className="max-w-lg mx-auto py-16 px-4 text-center">
        <h1 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">
          Trainer account
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
          This page shows individual student progress. As a trainer, use the Trainer
          panel to view and manage all students.
        </p>
        <button
          type="button"
          onClick={() => navigate("/trainer")}
          className="px-5 py-2.5 rounded-lg bg-[#1a73e8] dark:bg-[#8ab4f8] text-white dark:text-gray-900 text-sm font-medium hover:opacity-90 transition"
        >
          Open Trainer panel
        </button>
      </div>
    );
  }

  if (status === "no-profile") {
    return (
      <div className="max-w-lg mx-auto py-16 px-4 text-center">
        <h1 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">
          Complete your profile
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
          We need your student profile before we can show your dashboard.
        </p>
        <button
          type="button"
          onClick={() => navigate("/complete-profile")}
          className="px-5 py-2.5 rounded-lg bg-[#1a73e8] dark:bg-[#8ab4f8] text-white dark:text-gray-900 text-sm font-medium hover:opacity-90 transition"
        >
          Complete profile
        </button>
      </div>
    );
  }

  if (status === "auth-expired") {
    return (
      <div className="max-w-lg mx-auto py-16 px-4 text-center">
        <h1 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">
          Session expired
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
          Please sign in again to view your dashboard.
        </p>
        <button
          type="button"
          onClick={() => {
            clearAuthSession();
            navigate("/login", { replace: true });
          }}
          className="px-5 py-2.5 rounded-lg bg-[#1a73e8] dark:bg-[#8ab4f8] text-white dark:text-gray-900 text-sm font-medium hover:opacity-90 transition"
        >
          Sign in again
        </button>
      </div>
    );
  }

  if (status === "error") {
    const studentId = getStudentId();
    return (
      <div className="max-w-lg mx-auto py-16 px-4 text-center">
        <h1 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">
          Could not load dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
          Check your connection or try again in a moment.
        </p>
        <button
          type="button"
          onClick={() => studentId && fetchData(studentId)}
          className="px-5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  const studentId = getStudentId();

  const chartData =
    memory?.totalAttempts > 0
      ? Array.from({ length: memory.totalAttempts }, (_, i) => ({
          name: `Q${i + 1}`,
          value: Number(analytics.averageScore) || 0,
        }))
      : [];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-6 py-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
        <div>
          <h1 className="text-lg font-medium text-gray-800 dark:text-gray-100">
            Dashboard
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Track your performance
          </p>
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <SyncRequiredBanner studentId={studentId} />

          {recommendations.length > 0 && (
            <RecommendationsCard
              items={recommendations}
              onAct={(path) => navigate(path)}
            />
          )}

          {analytics.totalQuestions === 0 && (
            <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 px-4 py-3 text-sm text-blue-800 dark:text-blue-200">
              No interview data yet. Start an{" "}
              <button
                type="button"
                onClick={() => navigate("/interview")}
                className="underline font-medium"
              >
                interview
              </button>{" "}
              to see your stats here.
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              title="Questions Answered"
              value={analytics.totalQuestions}
              color="text-[#1a73e8] dark:text-[#8ab4f8]"
            />
            <StatCard
              title="Average Score"
              value={`${analytics.averageScore}/10`}
              color="text-green-600 dark:text-green-400"
            />
            <StatCard
              title="Communication"
              value={`${analytics.communicationScore}/10`}
            />
            <StatCard
              title="Technical"
              value={`${analytics.technicalScore}/10`}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard title="Current Level" value={memory.level} badge />
            <StatCard title="Trend" value={memory.trend} badge />
            <StatCard title="Consistency" value={memory.consistency} badge />
            <StatCard title="Total Attempts" value={memory.totalAttempts} />
          </div>

          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#292a2d] p-6 shadow-sm">
            <h2 className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-4">
              Performance trend
            </h2>

            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="name"
                    stroke="var(--text-secondary)"
                    style={{ fontSize: "12px" }}
                  />
                  <YAxis
                    domain={[0, 10]}
                    stroke="var(--text-secondary)"
                    style={{ fontSize: "12px" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--bg-elevated)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="var(--accent)"
                    strokeWidth={2}
                    dot={{ fill: "var(--accent)", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm">
                No performance data yet. Start an interview to see your progress.
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ConceptCard
              title="Strong concepts"
              items={memory.strongConcepts}
              type="success"
            />
            <ConceptCard
              title="Areas to improve"
              items={memory.weakConcepts}
              type="warning"
            />
          </div>

          <InterviewHistoryPanel
            studentId={getStudentId()}
            title="Your interview history"
          />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

const StatCard = ({ title, value, color, badge }) => (
  <motion.div
    whileHover={{ y: -2 }}
    className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#292a2d] p-5 shadow-sm transition-all hover:shadow-md"
  >
    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{title}</p>
    <h3
      className={`text-2xl font-normal ${color || "text-gray-800 dark:text-gray-100"} ${badge ? "capitalize" : ""}`}
    >
      {value ?? "—"}
    </h3>
  </motion.div>
);

const RecommendationsCard = ({ items = [], onAct }) => (
  <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#292a2d] p-6 shadow-sm">
    <div className="flex items-center gap-2 mb-4">
      <span className="text-lg">🎯</span>
      <h2 className="text-lg font-medium text-gray-800 dark:text-gray-100">
        Recommended for you
      </h2>
    </div>
    <ul className="space-y-3">
      {items.map((rec) => (
        <li
          key={rec.id}
          className="flex items-start justify-between gap-4 rounded-xl border border-gray-100 dark:border-gray-700/60 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition"
        >
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
              {rec.title}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {rec.reason}
            </p>
          </div>
          {rec.action?.path && (
            <button
              type="button"
              onClick={() => onAct(rec.action.path)}
              className="shrink-0 px-3 py-1.5 rounded-lg bg-[#1a73e8] dark:bg-[#8ab4f8] text-white dark:text-gray-900 text-xs font-medium hover:opacity-90 transition"
            >
              {rec.action.label || "Go"}
            </button>
          )}
        </li>
      ))}
    </ul>
  </div>
);

const ConceptCard = ({ title, items = [], type }) => {
  const colorClass =
    type === "success"
      ? "text-green-600 dark:text-green-400"
      : "text-amber-600 dark:text-amber-400";
  const bgClass = type === "success" ? "bg-green-500" : "bg-amber-500";

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#292a2d] p-6 shadow-sm">
      <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-4">
        {title}
      </h3>

      {items.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-sm">No data yet</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className={`inline-block w-1.5 h-1.5 rounded-full mt-2 ${bgClass}`} />
              <span className={`text-sm ${colorClass}`}>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
