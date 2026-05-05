import Navbar from "./Navbar";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";

const MainLayout = ({ children }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-bg text-text">
      {/* Navbar */}
      <Navbar />

      {/* Page Transition Wrapper */}
      <motion.div
        key={location.pathname} // ensures animation on route change
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="max-w-6xl mx-auto w-full px-4 py-4"
      >
        {children}
      </motion.div>
    </div>
  );
};

export default MainLayout;