import Navbar from "./Navbar";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";

const MainLayout = ({ children }) => {
  const location = useLocation();
  
  // Home page doesn't need layout constraints
  const isHomePage = location.pathname === "/";
  const isLearnPage = location.pathname === "/learn";

  return (
    <div className="min-h-screen bg-white dark:bg-[#202124] text-gray-800 dark:text-gray-200 read-mode:bg-[var(--read-surface)] read-mode:text-[var(--read-text)] transition-colors duration-300">
      {/* Navbar - only show on non-home pages */}
      {!isHomePage && !isLearnPage && <Navbar />}

      {/* Page Transition Wrapper */}
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={isHomePage || isLearnPage ? "w-full" : "max-w-6xl mx-auto w-full px-4 py-4"}
      >
        {children}
      </motion.div>

    </div>
  );
};

export default MainLayout;