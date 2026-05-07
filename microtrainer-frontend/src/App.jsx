import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

// Layout
import MainLayout from "./layout/MainLayout.jsx";

// Pages
import Home from "./pages/Home.jsx";
import Interview from "./pages/Interview.jsx";
import Result from "./pages/Result.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import TrainerDashboard from "./pages/TrainerDashboard.jsx";
import ProblemSolving from "./pages/ProblemSolving.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";

function App() {
  return (
    <BrowserRouter>
      <AnimatePresence mode="wait">
        <Routes>

          {/* Landing Page */}
          <Route
            path="/"
            element={
              <MainLayout>
                <Home />
              </MainLayout>
            }
          />

          {/* Interview */}
          <Route
            path="/interview"
            element={
              <MainLayout>
                <Interview />
              </MainLayout>
            }
          />

          {/* Problem Solving */}
          <Route
            path="/problems"
            element={
              <MainLayout>
                <ProblemSolving />
              </MainLayout>
            }
          />

          {/* Result */}
          <Route
            path="/result"
            element={
              <MainLayout>
                <Result />
              </MainLayout>
            }
          />

          {/* Student Dashboard */}
          <Route
            path="/dashboard"
            element={
              <MainLayout>
                <Dashboard />
              </MainLayout>
            }
          />

          {/* Trainer Dashboard */}
          <Route
            path="/trainer"
            element={
              <MainLayout>
                <TrainerDashboard />
              </MainLayout>
            }
          />

          {/* Admin Dashboard - Anti-Cheat Monitoring */}
          <Route
            path="/admin"
            element={
              <AdminDashboard />
            }
          />

        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  );
}

export default App;