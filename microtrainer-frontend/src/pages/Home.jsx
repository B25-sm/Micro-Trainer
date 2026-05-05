import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-bg text-text px-6">

      {/* TITLE */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold text-text-h mb-4 text-center"
      >
        AI Interview Trainer
      </motion.h1>

      <p className="text-gray-400 mb-10 text-center max-w-md">
        Practice interviews, get evaluated, and track your performance like a real candidate.
      </p>

      {/* ACTION BUTTONS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl">

        <ActionCard
          title="Start Interview"
          desc="Begin mock interview with AI"
          onClick={() => navigate("/interview")}
        />

        <ActionCard
          title="View Dashboard"
          desc="Check your performance"
          onClick={() => navigate("/dashboard")}
        />

        <ActionCard
          title="Trainer Panel"
          desc="Monitor all students"
          onClick={() => navigate("/trainer")}
        />

      </div>
    </div>
  );
};

export default Home;

/* ================= COMPONENT ================= */

const ActionCard = ({ title, desc, onClick }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.97 }}
    onClick={onClick}
    className="cursor-pointer p-6 rounded-2xl bg-code-bg border border-border shadow-base transition"
  >
    <h2 className="text-lg font-semibold mb-2">{title}</h2>
    <p className="text-sm text-gray-400">{desc}</p>
  </motion.div>
);