import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

// Layout
import MainLayout from "./layout/MainLayout.jsx";

// Pages
import Login from "./pages/Login.jsx";
import AuthCallback from "./pages/AuthCallback.jsx";
import CompleteProfile from "./pages/CompleteProfile.jsx";
import Home from "./pages/Home.jsx";
import Interview from "./pages/Interview.jsx";
import Result from "./pages/Result.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import TrainerDashboard from "./pages/TrainerDashboard.jsx";
import StudentDetailView from "./pages/StudentDetailView.jsx";
import ProblemSolving from "./pages/ProblemSolving.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import Learn from "./pages/Learn.jsx";
import EngagementDashboard from "./pages/EngagementDashboard.jsx";
import AdminEngagementDashboard from "./pages/AdminEngagementDashboard.jsx";
import NotificationSettings from "./pages/NotificationSettings.jsx";
import ExtensionPanel from "./pages/ExtensionPanel.jsx";

// Protected Route Component
import { TrainerOnly } from "./components/ProtectedRoute.jsx";
import { RequireAuth } from "./components/RequireAuth.jsx";
import ReportIssueButton from "./components/ReportIssueButton.jsx";
import ExtensionAutoConnect from "./components/ExtensionAutoConnect.jsx";

function App() {
  return (
    <BrowserRouter>
      <ExtensionAutoConnect />
      <ReportIssueButton />
      <AnimatePresence mode="wait">
        <Routes>

          {/* Login Page */}
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route
            path="/complete-profile"
            element={
              <RequireAuth>
                <CompleteProfile />
              </RequireAuth>
            }
          />

          {/* Compact extension side-panel experience */}
          <Route
            path="/extension"
            element={
              <RequireAuth>
                <ExtensionPanel />
              </RequireAuth>
            }
          />

          {/* Landing Page */}
          <Route
            path="/"
            element={
              <RequireAuth>
                <MainLayout>
                  <Home />
                </MainLayout>
              </RequireAuth>
            }
          />

          {/* Interview */}
          <Route
            path="/interview"
            element={
              <RequireAuth>
                <MainLayout>
                  <Interview />
                </MainLayout>
              </RequireAuth>
            }
          />

          {/* Problem Solving */}
          <Route
            path="/problems"
            element={
              <RequireAuth>
                <MainLayout>
                  <ProblemSolving />
                </MainLayout>
              </RequireAuth>
            }
          />

          {/* Result */}
          <Route
            path="/result"
            element={
              <RequireAuth>
                <MainLayout>
                  <Result />
                </MainLayout>
              </RequireAuth>
            }
          />

          {/* Student Dashboard */}
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </RequireAuth>
            }
          />

          {/* Engagement Dashboard */}
          <Route
            path="/engagement"
            element={
              <RequireAuth>
                <MainLayout>
                  <EngagementDashboard />
                </MainLayout>
              </RequireAuth>
            }
          />

          {/* Notification Settings */}
          <Route
            path="/settings/notifications"
            element={
              <RequireAuth>
                <MainLayout>
                  <NotificationSettings />
                </MainLayout>
              </RequireAuth>
            }
          />

          {/* Trainer Dashboard - TRAINER ONLY */}
          <Route
            path="/trainer"
            element={
              <TrainerOnly>
                <MainLayout>
                  <TrainerDashboard />
                </MainLayout>
              </TrainerOnly>
            }
          />

          {/* Student Detail View - TRAINER ONLY */}
          <Route
            path="/trainer/student/:studentId"
            element={
              <TrainerOnly>
                <MainLayout>
                  <StudentDetailView />
                </MainLayout>
              </TrainerOnly>
            }
          />

          {/* Learn - Adaptive Teaching */}
          <Route
            path="/learn"
            element={
              <RequireAuth>
                <MainLayout>
                  <Learn />
                </MainLayout>
              </RequireAuth>
            }
          />

          {/* Admin Dashboard - Anti-Cheat Monitoring - TRAINER ONLY */}
          <Route
            path="/admin"
            element={
              <TrainerOnly>
                <AdminDashboard />
              </TrainerOnly>
            }
          />

          {/* Admin Engagement Dashboard - TRAINER ONLY */}
          <Route
            path="/admin/engagement"
            element={
              <TrainerOnly>
                <MainLayout>
                  <AdminEngagementDashboard />
                </MainLayout>
              </TrainerOnly>
            }
          />

        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  );
}

export default App;