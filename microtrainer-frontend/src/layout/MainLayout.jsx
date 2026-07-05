import Navbar from "./Navbar";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { SidebarProvider, useSidebar } from "../context/SidebarContext";

function MainLayoutInner({ children }) {
  const location = useLocation();
  const { isCollapsed } = useSidebar();

  const isHomePage = location.pathname === "/";
  const isLearnPage = location.pathname === "/learn";
  const isInterviewPage = location.pathname === "/interview";
  const isCommunicationPage = location.pathname === "/communication";
  const isCompanyPage = location.pathname.startsWith("/company-interviews");
  const isAiChatPage = location.pathname === "/ai-chat";
  const isFullWidth =
    isHomePage || isLearnPage || isInterviewPage || isCommunicationPage || isCompanyPage || isAiChatPage;

  const contentPad = isFullWidth ? "w-full" : "max-w-6xl mx-auto w-full px-4 py-4";

  return (
    <div className="min-h-screen bg-white dark:bg-[#202124] text-gray-800 dark:text-gray-200 read-mode:bg-[var(--read-surface)] read-mode:text-[var(--read-text)] transition-colors duration-300">
      <Navbar />

      <div
        className={`min-h-screen flex flex-col transition-[margin] duration-300 ease-in-out ${
          isCollapsed ? "lg:ml-[72px]" : "lg:ml-60"
        }`}
      >
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className={`flex-1 ${contentPad}`}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}

const MainLayout = ({ children }) => (
  <SidebarProvider>
    <MainLayoutInner>{children}</MainLayoutInner>
  </SidebarProvider>
);

export default MainLayout;
