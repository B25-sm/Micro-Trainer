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
  Shuffle,
  Sparkles,
  Bot,
  UserRound,
} from "lucide-react";
import DisplayModeToggle from "./DisplayModeToggle";
import { clearAuthSession } from "../utils/authSession";
import { isTrainerSession } from "../utils/trainerAuth";
import { useSidebar } from "../context/SidebarContext";

const NAV_SECTIONS = [
  {
    items: [
      { path: "/", label: "Home", icon: Home },
      { path: "/ai-chat", label: "AI Chat", icon: Bot },
    ],
  },
  {
    label: "Practice",
    items: [
      { path: "/interview", label: "Interview", icon: Mic },
      { path: "/company-interviews", label: "Company Interviews", icon: Building2 },
      { path: "/communication", label: "Communication", icon: MessageSquareText, badge: "Under progress" },
      { path: "/speaking-practice", label: "Speaking Practice", icon: Shuffle },
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
  return `group relative w-full flex items-center gap-3 rounded-lg transition-colors duration-150 ${
    collapsed ? "justify-center px-0 py-2.5" : "px-3 py-2.5"
  } ${
    active
      ? "bg-black/[0.055] dark:bg-white/[0.09] text-gray-950 dark:text-white font-medium"
      : "text-gray-500 dark:text-[#b4b4b4] hover:text-gray-900 dark:hover:text-white hover:bg-black/[0.035] dark:hover:bg-white/[0.06]"
  }`;
}

function navIconClass(active) {
  return `h-[18px] w-[18px] shrink-0 transition-colors duration-150 ${active ? "" : ""}`;
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
        className={`flex items-center ${
          isCollapsed ? "justify-center px-2 py-4" : "gap-2.5 px-3.5 py-4"
        }`}
      >
        <button
          type="button"
          onClick={() => go("/")}
          className="flex items-center gap-2.5 min-w-0"
          title="MicroTrainer home"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-950 text-white dark:bg-white dark:text-black">
            <Sparkles className="h-4 w-4" strokeWidth={1.8} aria-hidden />
          </span>
          {!isCollapsed && (
            <span className="truncate text-[15px] font-semibold tracking-tight text-gray-900 dark:text-gray-100 read-mode:text-[var(--read-text-heading)]">
              MicroTrainer
            </span>
          )}
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto px-2.5 py-2 space-y-4" aria-label="Main">
        {NAV_SECTIONS.map((section, idx) => (
          <div key={section.label || `section-${idx}`}>
            {section.label && !isCollapsed && (
              <p className="px-2.5 mb-1.5 text-[9.5px] font-semibold uppercase tracking-[0.16em] text-gray-400/80 dark:text-gray-500/80">
                {section.label}
              </p>
            )}
            {section.label && isCollapsed && (
              <div className="mx-auto mb-2 h-px w-6 bg-black/[0.08] dark:bg-white/10" aria-hidden />
            )}
            <ul className="space-y-0.5">
              {section.items.map(({ path, label, icon: Icon, badge }) => {
                const active = isActive(path);
                return (
                <li key={path}>
                  <button
                    type="button"
                    onClick={() => go(path)}
                    className={navLinkClass(active, isCollapsed)}
                    title={isCollapsed ? (badge ? `${label} — ${badge}` : label) : undefined}
                  >
                    <Icon className={navIconClass(active)} strokeWidth={1.75} aria-hidden />
                    {!isCollapsed && (
                      <span className="flex min-w-0 flex-1 items-center justify-between gap-2 text-[13px]">
                        <span className="truncate">{label}</span>
                        {badge && (
                          <span className="shrink-0 rounded-full bg-amber-500/10 dark:bg-amber-400/10 px-1.5 py-px text-[9px] font-medium text-amber-600 dark:text-amber-300 ring-1 ring-amber-500/20 dark:ring-amber-400/20">
                            {badge}
                          </span>
                        )}
                      </span>
                    )}
                  </button>
                </li>
                );
              })}
            </ul>
          </div>
        ))}

        {showTrainerNav && (
          <div>
            {!isCollapsed && (
              <p className="px-2.5 mb-1.5 text-[9.5px] font-semibold uppercase tracking-[0.16em] text-gray-400/80 dark:text-gray-500/80">
                Staff
              </p>
            )}
            {isCollapsed && (
              <div className="mx-auto mb-2 h-px w-6 bg-black/[0.08] dark:bg-white/10" aria-hidden />
            )}
            <button
              type="button"
              onClick={() => go("/trainer")}
              className={navLinkClass(isActive("/trainer"), isCollapsed)}
              title={isCollapsed ? "Trainer" : undefined}
            >
              <GraduationCap className={navIconClass(isActive("/trainer"))} strokeWidth={1.75} aria-hidden />
              {!isCollapsed && <span className="text-[13px] truncate">Trainer</span>}
            </button>
          </div>
        )}
      </nav>

      <div className={`px-2.5 py-3 space-y-2.5 ${isCollapsed ? "flex flex-col items-center" : ""}`}>
        <div className={isCollapsed ? "flex justify-center" : ""}>
          <DisplayModeToggle variant={isCollapsed ? "icon" : "compact"} />
        </div>

        {showLevelBadge && currentLevel && !isCollapsed && (
          <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300">
            {currentLevel.charAt(0).toUpperCase() + currentLevel.slice(1)}
          </span>
        )}

        {isCollapsed ? (
          <div className="flex flex-col items-center gap-1.5">
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-black/[0.035] text-gray-500 ring-1 ring-inset ring-black/[0.07] dark:bg-white/[0.055] dark:text-gray-400 dark:ring-white/[0.08]"
              title={userName || "Guest"}
              aria-hidden
            >
              <UserRound className="h-4 w-4" strokeWidth={1.8} />
            </span>
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Sign out of MicroTrainer"
              title="Sign out"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="h-[15px] w-[15px]" strokeWidth={1.75} aria-hidden />
            </button>
          </div>
        ) : (
          <div
            className="group/user flex w-full items-center gap-2.5 rounded-xl px-1.5 py-1.5 hover:bg-black/[0.03] dark:hover:bg-white/[0.045] transition-colors"
            title={userName || "Guest"}
          >
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-black/[0.035] text-gray-500 ring-1 ring-inset ring-black/[0.07] dark:bg-white/[0.055] dark:text-gray-400 dark:ring-white/[0.08]"
              aria-hidden
            >
              <UserRound className="h-4 w-4" strokeWidth={1.8} />
            </span>
            <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-gray-700 dark:text-gray-200 read-mode:text-[var(--read-text)]">
              {userName || "Guest"}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Sign out of MicroTrainer"
              title="Sign out"
              className="shrink-0 flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 dark:text-gray-500 opacity-70 group-hover/user:opacity-100 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="h-[15px] w-[15px]" strokeWidth={1.75} aria-hidden />
            </button>
          </div>
        )}
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
      <header className="lg:hidden sticky top-0 z-30 flex h-12 items-center gap-2.5 border-b border-black/[0.06] dark:border-white/[0.07] bg-white/85 dark:bg-[#18191c]/90 backdrop-blur-xl px-4">
        <button
          type="button"
          onClick={openMobile}
          className="rounded-lg p-2 -ml-2 text-gray-600 dark:text-gray-400 hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" strokeWidth={1.75} />
        </button>
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[7px] bg-gradient-to-br from-blue-500 to-violet-500 text-white">
          <Sparkles className="h-3 w-3" strokeWidth={2} aria-hidden />
        </span>
        <span className="text-[15px] font-semibold text-gray-800 dark:text-gray-100">MicroTrainer</span>
      </header>

      {/* Mobile drawer backdrop */}
      {mobileOpen && (
        <button
          type="button"
          className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
          aria-label="Close menu"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar */}
      <aside
        onMouseEnter={handleSidebarMouseEnter}
        onMouseLeave={handleSidebarMouseLeave}
        className={`
          fixed top-0 left-0 z-50 h-full
          transition-all duration-300 ease-in-out
          ${isCollapsed ? "w-[72px]" : "w-60"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        <div className="relative h-full">
          <div
            className="relative flex h-full flex-col overflow-hidden border-r border-black/[0.06] dark:border-white/[0.06] bg-[#f2f2f2] dark:bg-[#171717] read-mode:bg-[var(--read-surface-elevated)] read-mode:border-[var(--read-border)]"
          >
            <button
              type="button"
              onClick={closeMobile}
              className="lg:hidden absolute top-3 right-2 rounded-lg p-1.5 text-gray-500 hover:bg-black/[0.05] dark:hover:bg-white/[0.06]"
              aria-label="Close menu"
            >
              <X className="h-4 w-4" strokeWidth={1.75} />
            </button>

            <SidebarContent
              showLevelBadge={showLevelBadge}
              currentLevel={currentLevel}
            />
          </div>

          {/* Desktop collapse toggle */}
          <button
            type="button"
            onClick={toggleCollapsed}
            className="hidden lg:flex absolute right-3 top-5 z-10 h-8 w-8 items-center justify-center rounded-lg text-gray-500 dark:text-[#b4b4b4] hover:text-gray-900 dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.07] transition-colors"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="h-3.5 w-3.5" strokeWidth={1.75} />
            ) : (
              <PanelLeftClose className="h-3.5 w-3.5" strokeWidth={1.75} />
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
