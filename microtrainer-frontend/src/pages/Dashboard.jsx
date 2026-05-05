import { useEffect, useState } from "react";
import { getReport } from "../api/api";
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
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await getReport("student_1");
      setData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (!data) {
    return <div className="p-6">Loading Dashboard...</div>;
  }

  const chartData =
    data.verdictTrend?.map((v, i) => ({
      name: `Mock ${i + 1}`,
      value: v === "Selected" ? 8 : v === "Average" ? 5 : 3,
    })) || [];

  return (
    <div className="min-h-screen p-6 space-y-6 bg-bg text-text">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">Student Dashboard</h1>
        <p className="text-gray-400">Track your performance</p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard title="Interviews" value={data.totalInterviews} />
        <StatCard title="Avg Score" value={data.averageScore} />
        <StatCard title="Communication" value={data.communicationScore} />
        <StatCard title="Technical" value={data.technicalScore} />
      </div>

      {/* PERFORMANCE CHART */}
      <div className="bg-code-bg p-4 rounded-2xl border border-border shadow-base">
        <h2 className="mb-4 font-semibold">Performance Trend</h2>

        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* STRONG / WEAK */}
      <div className="grid grid-cols-2 gap-4">

        <ListCard
          title="Strong Concepts"
          items={data.strongConcepts}
          color="text-green-400"
        />

        <ListCard
          title="Weak Concepts"
          items={data.weakConcepts}
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
    <h2 className="text-2xl font-bold">{value}</h2>
  </motion.div>
);

const ListCard = ({ title, items = [], color }) => (
  <div className="bg-code-bg border border-border p-4 rounded-2xl shadow-base">
    <h2 className="mb-2 font-semibold">{title}</h2>

    {items.length === 0 ? (
      <p className="text-gray-400 text-sm">No data</p>
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