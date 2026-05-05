import { useEffect, useState } from "react";
import { getLeaderboard } from "../api/api";
import { motion } from "framer-motion";

const TrainerDashboard = () => {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await getLeaderboard();
      setStudents(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-bg text-text">

      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Trainer Dashboard</h1>
        <p className="text-gray-400">Monitor student performance</p>
      </div>

      {/* TABLE */}
      <div className="bg-code-bg border border-border rounded-2xl overflow-hidden shadow-base">

        {/* Table Header */}
        <div className="grid grid-cols-5 p-4 border-b border-border text-sm text-gray-400">
          <span>Rank</span>
          <span>Student ID</span>
          <span>Avg Score</span>
          <span>Communication</span>
          <span>Technical</span>
        </div>

        {/* Rows */}
        {students.map((student, index) => (
          <motion.div
            key={student.studentId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-5 p-4 border-b border-border hover:bg-white/5 transition"
          >
            <span className="font-semibold">#{index + 1}</span>
            <span>{student.studentId}</span>
            <span>{student.averageScore}</span>
            <span>{student.communicationScore}</span>
            <span>{student.technicalScore}</span>
          </motion.div>
        ))}

        {students.length === 0 && (
          <div className="p-4 text-gray-400 text-sm">
            No data available
          </div>
        )}
      </div>

    </div>
  );
};

export default TrainerDashboard;