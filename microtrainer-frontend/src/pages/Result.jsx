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
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading results...
      </div>
    );
  }

  const chartData = [
    { name: "Average", value: Number(data.averageScore) },
    { name: "Communication", value: Number(data.communicationScore) },
    { name: "Technical", value: Number(data.technicalScore) },
  ];

  return (
    <div className="min-h-screen p-6 space-y-6 bg-bg text-text">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">Interview Result</h1>
        <p className="text-gray-400">Performance summary</p>
      </div>

      {/* SCORE CARDS */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card title="Average Score" value={data.averageScore} />
        <Card title="Communication" value={data.communicationScore} />
        <Card title="Technical" value={data.technicalScore} />
      </div>

      {/* CHART */}
      <div className="bg-code-bg p-4 rounded-2xl border border-border shadow-base">
        <h2 className="mb-4 font-semibold">Performance Chart</h2>

        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" />
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
      <div className="bg-code-bg p-4 rounded-2xl border border-border shadow-base">
        <h2 className="mb-2 font-semibold">Verdict Trend</h2>
        <p className="text-sm text-gray-400">
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
          <h2 className="text-xl font-bold text-text-h">
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
  );
};

export default Result;


/* ================= COMPONENTS ================= */

const Card = ({ title, value }) => (
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

const Section = ({ title, children }) => (
  <div className="bg-code-bg border border-border p-4 rounded-2xl shadow-base">
    <h2 className="text-lg font-semibold mb-2">{title}</h2>
    <div className="text-sm text-gray-300">{children}</div>
  </div>
);