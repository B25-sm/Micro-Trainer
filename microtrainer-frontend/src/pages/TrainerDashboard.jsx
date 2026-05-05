import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const TrainerDashboard = () => {
  const [students, setStudents] = useState([]);
  const [subject, setSubject] = useState("fullstack");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [subject]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);

      const url =
        subject === "fullstack"
          ? `${BASE_URL}/trainer/leaderboard`
          : `${BASE_URL}/trainer/leaderboard/${subject}`;

      const res = await axios.get(url, {
        headers: {
          role: "trainer", // 🔐 trainer-only access
        },
      });

      setStudents(res.data || []);
    } catch (err) {
      console.error("Leaderboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-bg text-text">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Trainer Dashboard</h1>
          <p className="text-gray-400 text-sm">
            Rank students & identify top candidates
          </p>
        </div>

        {/* SUBJECT FILTER */}
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="bg-code-bg border border-border p-2 rounded-xl"
        >
          <option value="fullstack">Fullstack</option>
          <option value="react">React</option>
          <option value="java">Java</option>
          <option value="python">Python</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="bg-code-bg border border-border rounded-2xl overflow-hidden shadow-base">

        {/* TABLE HEADER */}
        <div className="grid grid-cols-4 p-4 border-b border-border text-sm text-gray-400">
          <span>Rank</span>
          <span>Student ID</span>
          <span>Score</span>
          <span>Subjects</span>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="p-4 text-gray-400 text-sm">
            Loading leaderboard...
          </div>
        )}

        {/* ROWS */}
        {!loading &&
          students.map((student, index) => (
            <motion.div
              key={student.studentId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`grid grid-cols-4 p-4 border-b border-border transition ${
                index < 3 ? "bg-accent-bg" : "hover:bg-white/5"
              }`}
            >
              {/* RANK */}
              <span className="font-semibold">
                #{student.rank}
              </span>

              {/* STUDENT */}
              <span>{student.studentId}</span>

              {/* SCORE */}
              <span className="font-semibold">
                {student.score}
              </span>

              {/* SUBJECT BREAKDOWN */}
              <span className="text-sm text-gray-400">
                {Object.entries(student.subjects || {})
                  .map(([k, v]) => `${k}: ${v}`)
                  .join(" | ")}
              </span>
            </motion.div>
          ))}

        {/* EMPTY */}
        {!loading && students.length === 0 && (
          <div className="p-4 text-gray-400 text-sm">
            No data available
          </div>
        )}
      </div>

    </div>
  );
};

export default TrainerDashboard;