import { useState, useEffect } from "react";
import { startInterview, sendAnswer } from "../api";
import { motion } from "framer-motion";
import CircularTimer from "../components/CircularTimer";
import FeedbackCard from "../components/FeedbackCard";

const Interview = () => {
  const [session, setSession] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState("React");

  const handleStart = async () => {
    setLoading(true);
    try {
      const response = await startInterview({
        subject,
        studentId: "student_" + Date.now(),
      });
      setSession(response.data);
      setCurrentQuestion(response.data.question);
    } catch (error) {
      console.error("Failed to start interview:", error);
      alert("Failed to start interview. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!answer.trim()) {
      alert("Please provide an answer");
      return;
    }

    setLoading(true);
    try {
      const response = await sendAnswer({
        sessionId: session.sessionId,
        answer,
      });

      setFeedback(response.data.feedback);
      setCurrentQuestion(response.data.nextQuestion);
      setAnswer("");
    } catch (error) {
      console.error("Failed to submit answer:", error);
      alert("Failed to submit answer. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-lg p-8 rounded-3xl border border-white/20 max-w-md w-full"
        >
          <h1 className="text-3xl font-bold text-white mb-4">
            Start Interview
          </h1>
          <p className="text-white/80 mb-6">
            Choose your subject and begin your AI-powered interview practice
          </p>

          <div className="mb-6">
            <label className="block text-white mb-2">Select Subject</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full p-3 rounded-xl bg-white/20 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="React">React</option>
              <option value="Java">Java</option>
              <option value="Python">Python</option>
            </select>
          </div>

          <button
            onClick={handleStart}
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:scale-105 transition-transform disabled:opacity-50"
          >
            {loading ? "Starting..." : "Start Interview"}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-lg p-6 rounded-3xl border border-white/20">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">
                {subject} Interview
              </h1>
              <p className="text-white/70">
                Question {session.currentQuestion || 1} of {session.totalQuestions || 20}
              </p>
            </div>
            <CircularTimer duration={30} />
          </div>
        </div>

        {/* Question */}
        {currentQuestion && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/10 backdrop-blur-lg p-6 rounded-3xl border border-white/20"
          >
            <h2 className="text-xl font-semibold text-white mb-4">
              Question:
            </h2>
            <p className="text-white/90 text-lg">{currentQuestion}</p>
          </motion.div>
        )}

        {/* Answer Input */}
        <div className="bg-white/10 backdrop-blur-lg p-6 rounded-3xl border border-white/20">
          <label className="block text-white mb-2 font-semibold">
            Your Answer:
          </label>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer here..."
            rows={6}
            className="w-full p-4 rounded-xl bg-white/20 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-white/50"
          />
          <button
            onClick={handleSubmit}
            disabled={loading || !answer.trim()}
            className="mt-4 w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:scale-105 transition-transform disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Answer"}
          </button>
        </div>

        {/* Feedback */}
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <FeedbackCard feedback={feedback} />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Interview;
