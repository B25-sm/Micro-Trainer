import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const ChatBubble = ({ type, text }) => {
  const isUser = type === "user";
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    // Typing effect only for AI
    if (!isUser) {
      let i = 0;
      setDisplayText("");

      const interval = setInterval(() => {
        setDisplayText(text.slice(0, i));
        i++;

        if (i > text.length) {
          clearInterval(interval);
        }
      }, 12); // speed control

      return () => clearInterval(interval);
    } else {
      setDisplayText(text);
    }
  }, [text, isUser]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-lg px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-base ${
          isUser
            ? "bg-accent text-white"
            : "bg-code-bg text-text-h border border-border"
        }`}
      >
        {displayText}
      </div>
    </motion.div>
  );
};

export default ChatBubble;