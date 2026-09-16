import { NavLink } from "react-router-dom";

import {
  FaChartPie,
  FaUsers,
  FaIdBadge,
  FaFileAlt,
  FaCogs,
  FaBriefcase,
  FaBullseye,
  FaChartBar,
  FaRoute,
  FaThumbsUp,
  FaGraduationCap,
  FaCommentDots,
  FaHistory,
  FaServer,
  FaFileExport,
  FaBell,
  FaSlidersH,
} from "react-icons/fa";

import "./AdminLayout.css";

// Modules not yet built in this phase route to a shared "coming soon"
// placeholder (see AdminComingSoon) rather than a dead link, so the
// full information architecture from the spec is visible and
// navigable even before every module has a real implementation.
const NAV_ITEMS = [
  { to: "/admin/dashboard", label: "Dashboard", icon: <FaChartPie /> },
  { to: "/admin/users", label: "Users", icon: <FaUsers /> },
  { to: "/admin/profiles", label: "Profiles", icon: <FaIdBadge /> },
  { to: "/admin/resumes", label: "Resumes", icon: <FaFileAlt /> },
  { to: "/admin/resume-parsing", label: "Resume Parsing", icon: <FaCogs /> },
  { to: "/admin/jobs", label: "Jobs", icon: <FaBriefcase /> },
  { to: "/admin/ats-analytics", label: "ATS Analytics", icon: <FaBullseye /> },
  { to: "/admin/skill-gap-analytics", label: "Skill Gap Analytics", icon: <FaChartBar /> },
  { to: "/admin/career-analytics", label: "Career Analytics", icon: <FaRoute /> },
  { to: "/admin/job-rec-analytics", label: "Job Rec. Analytics", icon: <FaThumbsUp /> },
  { to: "/admin/courses", label: "Courses & Certifications", icon: <FaGraduationCap /> },
  { to: "/admin/feedback", label: "Feedback", icon: <FaCommentDots /> },
  { to: "/admin/activity", label: "Activity", icon: <FaHistory /> },
  { to: "/admin/system", label: "System / API Monitoring", icon: <FaServer /> },
  { to: "/admin/reports", label: "Reports", icon: <FaFileExport /> },
  { to: "/admin/notifications", label: "Notifications", icon: <FaBell /> },
  { to: "/admin/settings", label: "Settings", icon: <FaSlidersH /> },
];

function AdminSidebar() {
  return (
    <aside className="admin-sidebar">
      {NAV_ITEMS.map((item) => (
        <NavLink key={item.to} to={item.to}>
          {item.icon}
          {item.label}
        </NavLink>
      ))}

      <div className="admin-sidebar-footer">
        <p>CareerAI Admin</p>
        <small>Phase 1</small>
      </div>
    </aside>
  );
}

export default AdminSidebar;
