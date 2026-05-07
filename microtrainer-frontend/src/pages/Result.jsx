import { useEffect, useState } from "react";
import { getReport } from "../api";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useLocation } from "react-router-dom";

const Result = () => {
  const [data, setData] = useState(null);

  // 🔥 NEW: Coach data from interview flow
  const { state } = useLocation();
  const coach = state?.coachReport;

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      const res = await getReport("student_1");
      setData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex items-center gap-2 text-gray-500">
          <div className="flex gap-1">
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
          </div>
          <span>Loading results...</span>
        </div>
      </div>
    );
  }

  const chartData = [
    { name: "Average", value: Number(data.averageScore) },
    { name: "Communication", value: Number(data.communicationScore) },
    { name: "Technical", value: Number(data.technicalScore) },
  ];

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
            <h1 className="text-lg font-normal text-gray-800">Interview Results</h1>
            <p className="text-xs text-gray-500">Performance summary</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto space-y-6">

      {/* SCORE CARDS */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card title="Average Score" value={data.averageScore} />
        <Card title="Communication" value={data.communicationScore} />
        <Card title="Technical" value={data.technicalScore} />
      </div>

      {/* CHART */}
      <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
        <h2 className="mb-4 font-normal text-gray-800">Performance Chart</h2>

        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" stroke="#9ca3af" style={{ fontSize: '12px' }} />
            <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
              }}
            />
            <Bar dataKey="value" fill="#1a73e8" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* STRONG / WEAK */}
      <div className="grid md:grid-cols-2 gap-4">
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

      {/* VERDICT TREND */}
      <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
        <h2 className="mb-2 font-normal text-gray-800">Verdict Trend</h2>
        <p className="text-sm text-gray-500">
          {data.verdictTrend?.join(" → ")}
        </p>
      </div>

      {/* 🔥 COACH REPORT (MOST IMPORTANT) */}
      {coach && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <h2 className="text-xl font-normal text-gray-800">
            AI Coach Feedback
          </h2>

          <Section title="Overall Performance">
            {coach.overallPerformance}
          </Section>

          <Section title="Weak Areas">
            <ul className="list-disc ml-5">
              {coach.topWeakAreas?.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </Section>

          <Section title="Strengths">
            <ul className="list-disc ml-5">
              {coach.topStrengths?.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </Section>

          <Section title="Improvement Plan">
            <ul className="list-decimal ml-5">
              {coach.improvementPlan?.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ul>
          </Section>

          <Section title="Next Focus">
            {coach.nextFocus}
          </Section>
        </motion.div>
      )}

        </div>
      </main>

    </div>
  );
};

export default Result;


/* ================= COMPONENTS ================= */

const Card = ({ title, value }) => (
  <motion.div
    whileHover={{ y: -2 }}
    className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm transition-all hover:shadow-md"
  >
    <p className="text-sm text-gray-500">{title}</p>
    <h2 className="text-2xl font-normal text-gray-800">{value}</h2>
  </motion.div>
);

const ListCard = ({ title, items = [], color }) => (
  <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
    <h2 className="mb-2 font-normal text-gray-800">{title}</h2>

    {items.length === 0 ? (
      <p className="text-gray-500 text-sm">No data</p>
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

const Section = ({ title, children }) => (
  <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
    <h2 className="text-lg font-normal text-gray-800 mb-2">{title}</h2>
    <div className="text-sm text-gray-600">{children}</div>
  </div>
);