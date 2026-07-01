import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Home,
  Mic,
  Code2,
  BookOpen,
  Calendar,
  BarChart3,
  Settings,
  GraduationCap,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X,
  MessageSquareText,
  Building2,
} from "lucide-react";
import DisplayModeToggle from "./DisplayModeToggle";
import { clearAuthSession } from "../utils/authSession";
import { isTrainerSession } from "../utils/trainerAuth";
import { useSidebar } from "../context/SidebarContext";

const NAV_SECTIONS = [
  {
    items: [{ path: "/", label: "Home", icon: Home }],
  },
  {
    label: "Practice",
    items: [
      { path: "/interview", label: "Interview", icon: Mic },
      { path: "/company-interviews", label: "Company Interviews", icon: Building2 },
      { path: "/communication", label: "Communication", icon: MessageSquareText, badge: "Under progress" },
      { path: "/problems", label: "Code Practice", icon: Code2 },
    ],
  },
  {
    label: "Learn",
    items: [
      { path: "/learn", label: "Courses", icon: BookOpen },
      { path: "/schedule", label: "Personal Schedule", icon: Calendar },
    ],
  },
  {
    label: "You",
    items: [
      { path: "/dashboard", label: "Progress", icon: BarChart3 },
      { path: "/settings/notifications", label: "Settings", icon: Settings },
    ],
  },
];

function navLinkClass(active, collapsed) {
  return `w-full flex items-center gap-3 rounded-lg transition-colors ${
    collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2"
  } ${
    active
      ? "bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 font-medium"
      : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50"
  }`;
}

function SidebarContent({ showLevelBadge, currentLevel, onNavigate }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isCollapsed, closeMobile } = useSidebar();
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

  function go(path) {
    navigate(path);
    closeMobile();
    onNavigate?.();
  }

  function handleLogout() {
    clearAuthSession();
    localStorage.clear();
    navigate("/login");
  }

  return (
    <div className="flex h-full flex-col">
      <div
        className={`flex items-center border-b border-gray-200 dark:border-gray-700 ${
          isCollapsed ? "justify-center px-2 py-4" : "gap-2 px-4 py-4"
        }`}
      >
        <button
          type="button"
          onClick={() => go("/")}
          className={`font-semibold text-gray-800 dark:text-gray-100 read-mode:text-[var(--read-text-heading)] hover:text-blue-600 dark:hover:text-blue-400 transition ${
            isCollapsed ? "text-sm" : "text-lg"
          }`}
          title="MicroTrainer home"
        >
          {isCollapsed ? "MT" : "MicroTrainer"}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4" aria-label="Main">
        {NAV_SECTIONS.map((section, idx) => (
          <div key={section.label || `section-${idx}`}>
            {section.label && !isCollapsed && (
              <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                {section.label}
              </p>
            )}
            {section.label && isCollapsed && (
              <div className="mx-auto mb-2 h-px w-8 bg-gray-200 dark:bg-gray-700" aria-hidden />
            )}
            <ul className="space-y-0.5">
              {section.items.map(({ path, label, icon: Icon, badge }) => (
                <li key={path}>
                  <button
                    type="button"
                    onClick={() => go(path)}
                    className={navLinkClass(isActive(path), isCollapsed)}
                    title={isCollapsed ? (badge ? `${label} — ${badge}` : label) : undefined}
                  >
                    <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} aria-hidden />
                    {!isCollapsed && (
                      <span className="flex min-w-0 flex-1 items-center justify-between gap-2 text-sm">
                        <span className="truncate">{label}</span>
                        {badge && (
                          <span className="shrink-0 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
                            {badge}
                          </span>
                        )}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {showTrainerNav && (
          <div>
            {!isCollapsed && (
              <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Staff
              </p>
            )}
            {isCollapsed && (
              <div className="mx-auto mb-2 h-px w-8 bg-gray-200 dark:bg-gray-700" aria-hidden />
            )}
            <button
              type="button"
              onClick={() => go("/trainer")}
              className={navLinkClass(isActive("/trainer"), isCollapsed)}
              title={isCollapsed ? "Trainer" : undefined}
            >
              <GraduationCap className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} aria-hidden />
              {!isCollapsed && <span className="text-sm truncate">Trainer</span>}
            </button>
          </div>
        )}
      </nav>

      <div
        className={`border-t border-gray-200 dark:border-gray-700 ${
          isCollapsed ? "px-2 py-3 space-y-2" : "px-3 py-3 space-y-3"
        }`}
      >
        <div className={isCollapsed ? "flex justify-center" : ""}>
          <DisplayModeToggle variant={isCollapsed ? "icon" : "compact"} />
        </div>

        {showLevelBadge && currentLevel && !isCollapsed && (
          <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300">
            {currentLevel.charAt(0).toUpperCase() + currentLevel.slice(1)}
          </span>
        )}

        <div
          className={`flex items-center gap-2.5 ${isCollapsed ? "justify-center" : ""}`}
          title={userName || "Guest"}
        >
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-300"
            aria-hidden
          >
            {(userName || "G").charAt(0).toUpperCase()}
          </span>
          {!isCollapsed && (
            <span className="min-w-0 flex-1 truncate text-sm text-gray-700 dark:text-gray-200 leading-tight">
              {userName || "Guest"}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleLogout}
          aria-label="Sign out of MicroTrainer"
          className={`w-full inline-flex items-center rounded-lg text-sm font-normal text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-100/90 dark:hover:bg-white/[0.06] transition-colors ${
            isCollapsed ? "justify-center p-2" : "gap-2 px-3 py-2"
          }`}
          title={isCollapsed ? "Sign out" : undefined}
        >
          <LogOut className="h-4 w-4 shrink-0 opacity-80" strokeWidth={1.75} aria-hidden />
          {!isCollapsed && <span>Sign out</span>}
        </button>
      </div>
    </div>
  );
}

export default function AppNavbar({ showLevelBadge = false, currentLevel = null }) {
  const {
    collapsed,
    isCollapsed,
    setHoverExpanded,
    mobileOpen,
    toggleCollapsed,
    openMobile,
    closeMobile,
  } = useSidebar();

  const handleSidebarMouseEnter = () => {
    if (collapsed) setHoverExpanded(true);
  };

  const handleSidebarMouseLeave = () => {
    setHoverExpanded(false);
  };

  return (
    <>
      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-30 flex h-12 items-center gap-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[#292a2d] px-4">
        <button
          type="button"
          onClick={openMobile}
          className="rounded-lg p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="text-base font-semibold text-gray-800 dark:text-gray-100">MicroTrainer</span>
      </header>

      {/* Mobile drawer backdrop */}
      {mobileOpen && (
        <button
          type="button"
          className="lg:hidden fixed inset-0 z-40 bg-black/40"
          aria-label="Close menu"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar */}
      <aside
        onMouseEnter={handleSidebarMouseEnter}
        onMouseLeave={handleSidebarMouseLeave}
        className={`
          fixed top-0 left-0 z-50 h-full border-r border-gray-200 dark:border-gray-700
          bg-white dark:bg-[#292a2d] read-mode:bg-[var(--read-surface-elevated)] read-mode:border-[var(--read-border)]
          transition-all duration-300 ease-in-out
          ${isCollapsed ? "w-[72px]" : "w-60"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        <div className="relative h-full lg:pr-3">
          <button
            type="button"
            onClick={closeMobile}
            className="lg:hidden absolute top-3 right-2 rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700/50"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>

          <SidebarContent
            showLevelBadge={showLevelBadge}
            currentLevel={currentLevel}
          />

          {/* Desktop collapse toggle */}
          <button
            type="button"
            onClick={toggleCollapsed}
            className="hidden lg:flex absolute -right-3 top-16 z-10 h-6 w-6 items-center justify-center rounded-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-[#292a2d] text-gray-500 dark:text-gray-400 shadow-sm hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="h-3.5 w-3.5" />
            ) : (
              <PanelLeftClose className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
