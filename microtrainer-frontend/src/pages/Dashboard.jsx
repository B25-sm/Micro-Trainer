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
  CartesianGrid,
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex items-center gap-2 text-gray-500">
          <div className="flex gap-1">
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
          </div>
          <span>Loading Dashboard...</span>
        </div>
      </div>
    );
  }

  // Chart Data
  const chartData =
    memory?.totalAttempts > 0
      ? Array.from({ length: memory.totalAttempts }, (_, i) => ({
          name: `Q${i + 1}`,
          value: analytics.averageScore,
        }))
      : [];

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-50">
      
      {/* Minimal Header - Gemini Style */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition">
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div>
            <h1 className="text-lg font-normal text-gray-800">Dashboard</h1>
            <p className="text-xs text-gray-500">Track your performance</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto space-y-6">

          {/* Performance Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard 
              title="Questions Answered" 
              value={analytics.totalQuestions} 
              color="text-accent"
            />
            <StatCard 
              title="Average Score" 
              value={`${analytics.averageScore}/10`} 
              color="text-success"
            />
            <StatCard 
              title="Communication" 
              value={`${analytics.communicationScore}/10`} 
              color="text-text-h"
            />
            <StatCard 
              title="Technical" 
              value={`${analytics.technicalScore}/10`} 
              color="text-text-h"
            />
          </div>

          {/* AI Learning Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard 
              title="Current Level" 
              value={memory.level} 
              badge
            />
            <StatCard 
              title="Trend" 
              value={memory.trend} 
              badge
            />
            <StatCard 
              title="Consistency" 
              value={memory.consistency} 
              badge
            />
            <StatCard 
              title="Total Attempts" 
              value={memory.totalAttempts} 
            />
          </div>

          {/* Performance Chart */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-normal text-gray-800 mb-4">
              Performance Trend
            </h2>

            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis 
                    dataKey="name" 
                    stroke="var(--text-secondary)"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    domain={[0, 10]} 
                    stroke="var(--text-secondary)"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'var(--bg-elevated)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="var(--accent)" 
                    strokeWidth={2}
                    dot={{ fill: 'var(--accent)', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-text-secondary">
                No performance data yet. Start an interview to see your progress.
              </div>
            )}
          </div>

          {/* Concepts Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <ConceptCard
              title="Strong Concepts"
              items={memory.strongConcepts}
              type="success"
            />

            <ConceptCard
              title="Areas to Improve"
              items={memory.weakConcepts}
              type="warning"
            />

          </div>

        </div>
      </main>

    </div>
  );
};

export default Dashboard;

/* ================= COMPONENTS ================= */

const StatCard = ({ title, value, color, badge }) => (
  <motion.div
    whileHover={{ y: -2 }}
    className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm transition-all hover:shadow-md"
  >
    <p className="text-sm text-gray-500 mb-1">{title}</p>
    <h3 className={`text-2xl font-normal ${color || 'text-gray-800'} ${badge ? 'capitalize' : ''}`}>
      {value || "—"}
    </h3>
  </motion.div>
);

const ConceptCard = ({ title, items = [], type }) => {
  const colorClass = type === 'success' ? 'text-green-600' : 'text-amber-600';
  const bgClass = type === 'success' ? 'bg-green-100' : 'bg-amber-100';

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <h3 className="text-lg font-normal text-gray-800 mb-4">{title}</h3>

      {items.length === 0 ? (
        <p className="text-gray-500 text-sm">No data available yet</p>
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