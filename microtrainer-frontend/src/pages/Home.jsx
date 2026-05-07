import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-50">
      
      {/* Minimal Header - Gemini Style */}
      <header className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-200 rounded-lg transition">
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-xl font-normal text-gray-800">MicroTrainer</h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-200 rounded-lg transition">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-200 rounded-lg transition">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main Content - Centered Gemini Style */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 max-w-2xl mx-auto w-full">
        
        {/* Hero Title - Large Blue Text */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-6xl font-normal text-blue-500 text-center mb-16 leading-tight"
        >
          Practice technical interviews
        </motion.h2>

        {/* Suggestion Chips - Gemini Style */}
        <div className="w-full space-y-3 mb-8">
          <SuggestionChip
            text="Start a JavaScript interview session"
            onClick={() => navigate("/interview")}
          />
          <SuggestionChip
            text="View my performance dashboard"
            onClick={() => navigate("/dashboard")}
          />
          <SuggestionChip
            text="What can MicroTrainer help me with?"
            onClick={() => {}}
          />
          <button
            onClick={() => {}}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 text-sm font-medium transition px-2 py-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
            View all suggestions
          </button>
        </div>

        {/* Input Area - Gemini Style */}
        <div className="w-full bg-white dark:bg-gray-50 rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 px-5 py-4">
            <input
              type="text"
              placeholder="Ask MicroTrainer"
              className="flex-1 bg-transparent text-gray-800 placeholder-gray-400 outline-none text-base"
            />
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Beta Badge & Footer Text */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            MicroTrainer can make mistakes.{" "}
            <a href="#" className="underline hover:text-gray-700">Learn more</a>
          </p>
        </div>

      </main>

      {/* Floating Action Button - Gemini Gradient Style */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate("/interview")}
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 via-purple-600 to-pink-500 shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center"
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </motion.button>

    </div>
  );
};

export default Home;

/* ================= COMPONENTS ================= */

const SuggestionChip = ({ text, onClick }) => (
  <motion.button
    whileHover={{ backgroundColor: "rgba(0, 0, 0, 0.02)" }}
    onClick={onClick}
    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border border-gray-200 hover:border-gray-300 transition-all text-left group"
  >
    <svg 
      className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition flex-shrink-0" 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
    </svg>
    <span className="text-gray-700 text-sm font-normal">{text}</span>
  </motion.button>
);