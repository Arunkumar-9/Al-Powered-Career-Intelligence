import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

// Public Pages
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";

// Protected Pages
import Dashboard from "./pages/Dashboard/Dashboard";
import Profile from "./pages/Profile/Profile";

// Layouts
import DashboardLayout from "./components/layout/DashboardLayout";
// Protected Route
import ProtectedRoute from "./routes/ProtectedRoute";

// Temporary Pages (Create these files if not created yet)
import Resume from "./pages/Resume/Resume";
import AIAnalysis from "./pages/AIAnalysis/AIAnalysis";
import CareerMatch from "./pages/CareerMatch/CareerMatch";
import SkillGap from "./pages/SkillGap/SkillGap";
import Roadmap from "./pages/Roadmap/Roadmap";
import AIChat from "./pages/AIChat/AIChat";
import Settings from "./pages/Settings/Settings";

// Milestone 3 additions
import Jobs from "./pages/Jobs/Jobs";
import ResumeImprovement from "./pages/ResumeImprovement/ResumeImprovement";

// ---- Admin Dashboard ----
import AdminDashboard from "./pages/AdminDashboard/AdminDashboard";
import AdminUsers from "./pages/AdminUsers/AdminUsers";
import AdminManagementPage from "./pages/AdminManagement/AdminManagementPage";
import AdminResumes from "./pages/AdminResumes/AdminResumes";
import AdminResumeParsing from "./pages/AdminResumeParsing/AdminResumeParsing";
import AdminJobs from "./pages/AdminJobs/AdminJobs";
import AdminAtsAnalytics from "./pages/AdminAtsAnalytics/AdminAtsAnalytics";
import AdminSkillGapAnalytics from "./pages/AdminSkillGapAnalytics/AdminSkillGapAnalytics";
import AdminCareerAnalytics from "./pages/AdminCareerAnalytics/AdminCareerAnalytics";
import AdminLayout from "./components/adminLayout/AdminLayout";
import AdminProtectedRoute from "./routes/AdminProtectedRoute";

function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [location.pathname]);

  return null;
}

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>

      {/* ---------- Public Routes ---------- */}

      <Route path="/" element={<Home />} />

      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />



      {/* ---------- Protected Routes ---------- */}

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >

        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/profile" element={<Profile />} />

        <Route path="/resume" element={<Resume />} />

        <Route path="/analysis" element={<AIAnalysis />} />

        <Route path="/career-match" element={<CareerMatch />} />

        <Route path="/skill-gap" element={<SkillGap />} />

        <Route path="/roadmap" element={<Roadmap />} />

        {/* Milestone 3 additions */}
        <Route path="/jobs" element={<Jobs />} />

        <Route path="/resume-improvement" element={<ResumeImprovement />} />

        <Route path="/chat" element={<AIChat />} />

        <Route path="/settings" element={<Settings />} />

      </Route>

      {/* ---------- Admin Routes ---------- */}

      <Route path="/admin/login" element={<Navigate to="/login" replace />} />

      <Route
        element={
          <AdminProtectedRoute>
            <AdminLayout />
          </AdminProtectedRoute>
        }
      >
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />

        {/* Modules planned for later phases */}
        <Route path="/admin/profiles" element={<AdminManagementPage module="profiles" />} />
        <Route path="/admin/resumes" element={<AdminResumes />} />
        <Route path="/admin/resume-parsing" element={<AdminResumeParsing />} />
        <Route path="/admin/jobs" element={<AdminJobs />} />
        <Route path="/admin/ats-analytics" element={<AdminAtsAnalytics />} />
        <Route path="/admin/skill-gap-analytics" element={<AdminSkillGapAnalytics />} />
        <Route path="/admin/career-analytics" element={<AdminCareerAnalytics />} />
        <Route path="/admin/job-rec-analytics" element={<AdminManagementPage module="job-rec-analytics" />} />
        <Route path="/admin/courses" element={<AdminManagementPage module="courses" />} />
        <Route path="/admin/feedback" element={<AdminManagementPage module="feedback" />} />
        <Route path="/admin/activity" element={<AdminManagementPage module="activity" />} />
        <Route path="/admin/system" element={<AdminManagementPage module="system" />} />
        <Route path="/admin/reports" element={<AdminManagementPage module="reports" />} />
        <Route path="/admin/notifications" element={<AdminManagementPage module="notifications" />} />
        <Route path="/admin/settings" element={<AdminManagementPage module="settings" />} />
      </Route>

    </Routes>
    </>
  );
}

export default App;
