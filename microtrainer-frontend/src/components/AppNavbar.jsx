import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import DisplayModeToggle from "./DisplayModeToggle";
import { clearAuthSession } from "../utils/authSession";
import { isTrainerSession } from "../utils/trainerAuth";

const BASE_LINKS = [
  { path: "/", label: "Home" },
  { path: "/interview", label: "Interview" },
  { path: "/learn", label: "Learn" },
  { path: "/schedule", label: "Schedule" },
  { path: "/problems", label: "Problems" },
  { path: "/dashboard", label: "Dashboard" },
  { path: "/settings/notifications", label: "Settings" },
];

function navLinkClass(active) {
  return `shrink-0 px-3 py-1.5 text-sm rounded-lg transition whitespace-nowrap ${
    active
      ? "bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 font-medium"
      : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50"
  }`;
}

export default function AppNavbar({ showLevelBadge = false, currentLevel = null }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [userName, setUserName] = useState("");
  const showTrainerNav = isTrainerSession();

  useEffect(() => {
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
    setUserName(name);
  }, [location.pathname]);

  const isActive = (path) =>
    path === "/"
      ? location.pathname === "/"
      : location.pathname === path || location.pathname.startsWith(`${path}/`);

  const links = [
    ...BASE_LINKS,
    ...(showTrainerNav ? [{ path: "/trainer", label: "Trainer" }] : []),
  ];

  function handleLogout() {
    clearAuthSession();
    localStorage.clear();
    navigate("/login");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[#292a2d] read-mode:bg-[var(--read-surface-elevated)] read-mode:border-[var(--read-border)] transition-colors duration-300">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-14 flex items-center gap-3 sm:gap-4">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="shrink-0 text-lg font-semibold text-gray-800 dark:text-gray-100 read-mode:text-[var(--read-text-heading)] hover:text-blue-600 dark:hover:text-blue-400 transition"
        >
          MicroTrainer
        </button>

        <nav
          className="flex-1 flex items-center gap-1 overflow-x-auto min-w-0 scrollbar-thin py-1 -my-1"
          aria-label="Main"
        >
          {links.map(({ path, label }) => (
            <button
              key={path}
              type="button"
              onClick={() => navigate(path)}
              className={navLinkClass(isActive(path))}
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="shrink-0 flex items-center gap-2 sm:gap-3 pl-2 border-l border-gray-200 dark:border-gray-700">
          <DisplayModeToggle variant="compact" />

          {showLevelBadge && currentLevel && (
            <span className="hidden md:inline px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300">
              {currentLevel.charAt(0).toUpperCase() + currentLevel.slice(1)}
            </span>
          )}

          <div
            className="hidden sm:flex items-center gap-2.5 pl-1 max-w-[200px]"
            title={userName || "Guest"}
          >
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-300"
              aria-hidden
            >
              {(userName || "G").charAt(0).toUpperCase()}
            </span>
            <span className="hidden lg:block min-w-0 truncate text-sm text-gray-700 dark:text-gray-200 leading-tight">
              {userName || "Guest"}
            </span>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            aria-label="Sign out of MicroTrainer"
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-normal text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-100/90 dark:hover:bg-white/[0.06] active:bg-gray-200/80 dark:active:bg-white/10 transition-colors whitespace-nowrap"
          >
            <LogOut className="h-4 w-4 shrink-0 opacity-80" strokeWidth={1.75} aria-hidden />
            <span className="hidden md:inline">Sign out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
