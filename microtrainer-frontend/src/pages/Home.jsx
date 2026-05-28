import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { chatWithMicroTrainer } from "../api";
import Header from "../components/Header";

const Home = () => {
  const navigate = useNavigate();
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const chatEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!question.trim() || isLoading) return;

    const userQuestion = question.trim();
    setQuestion("");

    // Add user message to chat
    setChatHistory(prev => [...prev, { 
      role: "user", 
      content: userQuestion,
      timestamp: new Date().toISOString()
    }]);

    setIsLoading(true);

    try {
      const response = await chatWithMicroTrainer({
        question: userQuestion,
        sessionId: sessionId
      });

      // Update session ID
      if (response.data.sessionId && !sessionId) {
        setSessionId(response.data.sessionId);
      }

      // Add AI response to chat
      setChatHistory(prev => [...prev, {
        role: "assistant",
        content: response.data.answer,
        timestamp: response.data.timestamp
      }]);

    } catch (err) {
      console.error("Chat error:", err);
      const errorMessage = err?.response?.data?.error || err?.message || "Something went wrong. Please try again.";
      
      // Add error message to chat
      setChatHistory(prev => [...prev, {
        role: "error",
        content: errorMessage,
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const clearChat = () => {
    setChatHistory([]);
    setSessionId(null);
    setQuestion("");
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      
      {/* Unified Header */}
      <Header />

      {/* Main Content - Centered Gemini Style */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 max-w-2xl mx-auto w-full">
        
        {/* Hero Title - Large Blue Text */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-6xl font-normal text-blue-500 text-center mb-4 leading-tight"
        >
          Practice technical interviews
        </motion.h2>
        
        <p className="text-gray-600 text-center mb-12 text-lg">
          Choose full stack roles or individual technologies
        </p>

        {/* Full Stack Interviews */}
        <div className="w-full mb-8">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 px-2">
            Full Stack Developer Roles
          </h3>
          <div className="space-y-3">
            <SuggestionChip
              text="🚀 MERN Stack Developer"
              subtitle="MongoDB, Express, React, Node.js"
              onClick={() => navigate("/interview?subject=MERN Stack")}
            />
            <SuggestionChip
              text="☕ Java Full Stack Developer"
              subtitle="Spring Boot, Hibernate, React/Angular"
              onClick={() => navigate("/interview?subject=Java Full Stack")}
            />
            <SuggestionChip
              text="🐍 Python Full Stack Developer"
              subtitle="Django/Flask, PostgreSQL, React"
              onClick={() => navigate("/interview?subject=Python Full Stack")}
            />
          </div>
        </div>

        {/* Data & ML Roles */}
        <div className="w-full mb-8">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 px-2">
            Data & ML Roles
          </h3>
          <div className="space-y-3">
            <SuggestionChip
              text="📈 Data Analyst"
              subtitle="SQL, Excel, dashboards, A/B tests & storytelling"
              onClick={() => navigate("/interview?subject=Data Analyst")}
            />
            <SuggestionChip
              text="🤖 ML Engineer"
              subtitle="Models, deployment, MLOps, LLMs & pipelines"
              onClick={() => navigate("/interview?subject=ML Engineer")}
            />
            <SuggestionChip
              text="📊 Data Scientist (General)"
              subtitle="Full-stack DS: Python, stats, ML & analytics"
              onClick={() => navigate("/interview?subject=Data Science")}
            />
          </div>
        </div>

        {/* Individual Technologies */}
        <div className="w-full mb-8">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 px-2">
            Individual Technologies
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <TechChip
              text="⚛️ React"
              onClick={() => navigate("/interview?subject=React")}
            />
            <TechChip
              text="📜 JavaScript"
              onClick={() => navigate("/interview?subject=JavaScript")}
            />
            <TechChip
              text="☕ Java"
              onClick={() => navigate("/interview?subject=Java")}
            />
            <TechChip
              text="🐍 Python"
              onClick={() => navigate("/interview?subject=Python")}
            />
            <TechChip
              text="🗄️ SQL"
              onClick={() => navigate("/interview?subject=SQL")}
            />
            <TechChip
              text="🟢 Node.js"
              onClick={() => navigate("/interview?subject=Node.js")}
            />
            <TechChip
              text="🅰️ Angular"
              onClick={() => navigate("/interview?subject=Angular")}
            />
            <TechChip
              text="🔷 TypeScript"
              onClick={() => navigate("/interview?subject=TypeScript")}
            />
            <TechChip
              text="📈 Data Analyst"
              onClick={() => navigate("/interview?subject=Data Analyst")}
            />
            <TechChip
              text="🤖 ML Engineer"
              onClick={() => navigate("/interview?subject=ML Engineer")}
            />
          </div>
        </div>

        {/* Other Options */}
        <div className="w-full space-y-3 mb-8">
          <SuggestionChip
            text="🎓 Learn Concepts Interactively"
            subtitle="Adaptive teaching that matches your level"
            onClick={() => navigate("/learn")}
          />
          <SuggestionChip
            text="🧩 Problem Solving & DSA"
            subtitle="Algorithms, Data Structures, Coding Challenges"
            onClick={() => navigate("/problems")}
          />
          <SuggestionChip
            text="📊 View Performance Dashboard"
            subtitle="Track your progress and scores"
            onClick={() => navigate("/dashboard")}
          />
        </div>

        {/* Input Area - Gemini Style */}
        <div className="w-full">
          {/* Chat History */}
          {chatHistory.length > 0 && (
            <div className="mb-6 space-y-4 max-h-96 overflow-y-auto">
              <AnimatePresence>
                {chatHistory.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`p-4 rounded-2xl ${
                      message.role === "user"
                        ? "bg-blue-50 border border-blue-100 ml-8"
                        : message.role === "error"
                        ? "bg-red-50 border border-red-200"
                        : "bg-gray-50 border border-gray-200 mr-8"
                    }`}
                  >
                    {message.role === "user" ? (
                      <div className="text-gray-800 text-sm">{message.content}</div>
                    ) : message.role === "error" ? (
                      <div className="text-red-600 text-sm flex items-start gap-2">
                        <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <span>{message.content}</span>
                      </div>
                    ) : (
                      <div className="prose prose-sm max-w-none text-gray-800">
                        <ReactMarkdown
                          components={{
                            code: ({ inline, children, ...props }) => {
                              return inline ? (
                                <code className="bg-gray-200 px-1.5 py-0.5 rounded text-xs font-mono" {...props}>
                                  {children}
                                </code>
                              ) : (
                                <code className="block bg-gray-800 text-gray-100 p-3 rounded-lg text-xs font-mono overflow-x-auto" {...props}>
                                  {children}
                                </code>
                              );
                            },
                            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                            ul: ({ children }) => <ul className="list-disc pl-5 mb-2 space-y-1">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal pl-5 mb-2 space-y-1">{children}</ol>,
                            strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={chatEndRef} />
            </div>
          )}

          {/* Input Box */}
          <form onSubmit={handleSubmit} className="w-full bg-white rounded-full border border-gray-200 shadow-sm hover:shadow-md focus-within:shadow-lg transition-all duration-200">
            <div className="flex items-center gap-3 px-6 py-4">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask MicroTrainer anything..."
                disabled={isLoading}
                maxLength={500}
                className="flex-1 bg-transparent text-gray-800 placeholder-gray-400 text-base disabled:opacity-50 py-1"
                style={{ 
                  border: 'none',
                  outline: 'none',
                  boxShadow: 'none',
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  appearance: 'none'
                }}
              />
              <div className="flex items-center gap-1">
                {/* Clear button - only show when there's chat history */}
                {chatHistory.length > 0 && (
                  <button
                    type="button"
                    onClick={clearChat}
                    className="p-2.5 hover:bg-gray-100 rounded-full transition-colors"
                    title="Clear chat"
                  >
                    <svg className="w-5 h-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
                
                {/* Send button */}
                <button
                  type="submit"
                  disabled={!question.trim() || isLoading}
                  className="p-2.5 hover:bg-blue-50 rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                  title="Send message"
                >
                  {isLoading ? (
                    <svg className="w-5 h-5 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
            
            {/* Character count */}
            {question.length > 400 && (
              <div className="px-5 pb-2 text-xs text-gray-400 text-right">
                {question.length}/500
              </div>
            )}
          </form>
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

const SuggestionChip = ({ text, subtitle, onClick }) => (
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
    <div className="flex-1">
      <div className="text-gray-700 text-sm font-normal">{text}</div>
      {subtitle && <div className="text-gray-500 text-xs mt-0.5">{subtitle}</div>}
    </div>
  </motion.button>
);

const TechChip = ({ text, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="px-4 py-3 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-sm font-medium text-gray-700 hover:text-blue-600"
  >
    {text}
  </motion.button>
);