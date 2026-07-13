import { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "sidebarCollapsed";

const SidebarContext = createContext(null);

export function SidebarProvider({ children }) {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  // Expansion is explicit. Hover-driven width changes caused portaled page
  // tools to repeatedly enter/leave the sidebar boundary and visibly jitter.
  const isCollapsed = collapsed;

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(collapsed));
    } catch {
      /* ignore */
    }
  }, [collapsed]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  const value = {
    collapsed,
    isCollapsed,
    mobileOpen,
    toggleCollapsed: () => {
      setCollapsed((c) => !c);
    },
    openMobile: () => setMobileOpen(true),
    closeMobile: () => setMobileOpen(false),
    sidebarWidth: isCollapsed ? 72 : 240,
  };

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within SidebarProvider");
  return ctx;
}
