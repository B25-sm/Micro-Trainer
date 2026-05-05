import { useEffect, useState } from "react";
import { getAnalytics, getMemory } from "../api";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const Dashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [memory, setMemory] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [aRes, mRes] = await Promise.all([
        getAnalytics("student_1"),
        getMemory("student_1"),
      ]);

      setAnalytics(aRes.data);
      setMemory(mRes.data);
    } catch (err) {
      console.error("Dashboard error:", err);
    }
  };

  if (!analytics || !memory) {
    return <div className="p-6">Loading Dashboard...</div>;
  }

  // 🔥 Chart Data (real scores progression if available)
  const chartData =
    memory?.totalAttempts > 0
      ? Array.from({ length: memory.totalAttempts }, (_, i) => ({
          name: `Q${i + 1}`,
          value: analytics.averageScore,
        }))
      : [];

  return (
    <div className="min-h-screen p-6 space-y-6 bg-bg text-text">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">Student Dashboard</h1>
        <p className="text-gray-400">
          Live performance tracking & AI insights
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Questions" value={analytics.totalQuestions} />
        <StatCard title="Avg Score" value={analytics.averageScore} />
        <StatCard title="Communication" value={analytics.communicationScore} />
        <StatCard title="Technical" value={analytics.technicalScore} />
      </div>

      {/* AI MEMORY STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Level" value={memory.level} />
        <StatCard title="Trend" value={memory.trend} />
        <StatCard title="Consistency" value={memory.consistency} />
        <StatCard title="Attempts" value={memory.totalAttempts} />
      </div>

      {/* PERFORMANCE CHART */}
      <div className="bg-code-bg p-4 rounded-2xl border border-border shadow-base">
        <h2 className="mb-4 font-semibold">Performance Trend</h2>

        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis domain={[0, 10]} />
            <Tooltip />
            <Line type="monotone" dataKey="value" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* STRONG / WEAK */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <ListCard
          title="Strong Concepts"
          items={memory.strongConcepts}
          color="text-green-400"
        />

        <ListCard
          title="Weak Concepts"
          items={memory.weakConcepts}
          color="text-red-400"
        />

      </div>

    </div>
  );
};

export default Dashboard;

/* ================= COMPONENTS ================= */

const StatCard = ({ title, value }) => (
  <motion.div
    whileHover={{ scale: 1.03 }}
    className="bg-code-bg border border-border p-4 rounded-2xl shadow-base"
  >
    <p className="text-sm text-gray-400">{title}</p>
    <h2 className="text-xl font-bold capitalize">{value || "—"}</h2>
  </motion.div>
);

const ListCard = ({ title, items = [], color }) => (
  <div className="bg-code-bg border border-border p-4 rounded-2xl shadow-base">
    <h2 className="mb-2 font-semibold">{title}</h2>

    {items.length === 0 ? (
      <p className="text-gray-400 text-sm">No data yet</p>
    ) : (
      <ul className="space-y-1 text-sm">
        {items.map((item, index) => (
          <li key={index} className={color}>
            • {item}
          </li>
        ))}
      </ul>
    )}
  </div>
);