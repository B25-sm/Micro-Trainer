import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import DisplayModeToggle from "./DisplayModeToggle";
import { clearAuthSession } from "../utils/authSession";
import { isTrainerSession } from "../utils/trainerAuth";

const Header = ({ showLevelBadge = false, currentLevel = null }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userRole, setUserRole] = useState("student");
  const [userName, setUserName] = useState("");
  const showTrainerNav = isTrainerSession();

  useEffect(() => {
    const role = localStorage.getItem("userRole") || "student";
    const name =
      localStorage.getItem("userName") ||
      (() => {
        const full = localStorage.getItem("studentFullName");
        const initial = localStorage.getItem("studentInitial");
        const batch = localStorage.getItem("studentBatch");
        if (full && initial && batch) return `${full} (${initial} · ${batch})`;
        if (full) return full;
        if (initial && batch) return `${initial} · ${batch}`;
        return "";
      })();

    setUserRole(role);
    setUserName(name);
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    clearAuthSession();
    localStorage.clear();
    navigate("/login");
  };

  return (
    <header className="px-6 py-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[#292a2d] read-mode:bg-[var(--read-surface-elevated)] read-mode:border-[var(--read-border)] transition-colors duration-300">
      <div className="flex items-center gap-8">
        <button
          onClick={() => navigate("/")}
          className="text-xl font-semibold text-gray-800 dark:text-gray-100 read-mode:text-[var(--read-text-heading)] hover:text-blue-500 dark:hover:text-blue-400 transition"
        >
          MicroTrainer
        </button>
        <nav className="flex items-center gap-2">
          <button 
            onClick={() => navigate("/")}
            className={`px-3 py-1.5 text-sm rounded-lg transition ${
              isActive("/")
                ? "bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 font-medium"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50"
            }`}
          >
            Home
          </button>
          <button 
            onClick={() => navigate("/interview")}
            className={`px-3 py-1.5 text-sm rounded-lg transition ${
              isActive("/interview")
                ? "bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 font-medium"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50"
            }`}
          >
            Interview
          </button>
          <button 
            onClick={() => navigate("/learn")}
            className={`px-3 py-1.5 text-sm rounded-lg transition ${
              isActive("/learn")
                ? "bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 font-medium"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50"
            }`}
          >
            Learn
          </button>
          <button 
            onClick={() => navigate("/problems")}
            className={`px-3 py-1.5 text-sm rounded-lg transition ${
              isActive("/problems")
                ? "bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 font-medium"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50"
            }`}
          >
            Problems
          </button>
          <button 
            onClick={() => navigate("/dashboard")}
            className={`px-3 py-1.5 text-sm rounded-lg transition ${
              isActive("/dashboard")
                ? "bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 font-medium"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50"
            }`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => navigate("/certificates")}
            className={`px-3 py-1.5 text-sm rounded-lg transition ${
              isActive("/certificates")
                ? "bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 font-medium"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50"
            }`}
          >
            Certificates
          </button>
          <button 
            onClick={() => navigate("/settings/notifications")}
            className={`px-3 py-1.5 text-sm rounded-lg transition ${
              isActive("/settings/notifications")
                ? "bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 font-medium"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50"
            }`}
          >
            Settings
          </button>
          {showTrainerNav && (
            <button
              onClick={() => navigate("/trainer")}
              className={`px-3 py-1.5 text-sm rounded-lg transition ${
                isActive("/trainer")
                  ? "bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 font-medium"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50"
              }`}
            >
              Trainer
            </button>
          )}
        </nav>
      </div>
      <div className="flex items-center gap-3">
        <DisplayModeToggle variant="compact" />
        {showLevelBadge && currentLevel && (
          <div className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 rounded-full text-sm font-medium">
            Level: {currentLevel.charAt(0).toUpperCase() + currentLevel.slice(1)}
          </div>
        )}
        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {userName || "Guest"}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {userRole === "trainer" ? "Trainer" : "Student"}
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="ml-2 px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium shadow-sm"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
