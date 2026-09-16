import { NavLink } from "react-router-dom";

import {
  FaHome,
  FaUser,
  FaFileAlt,
  FaRobot,
  FaBullseye,
  FaChartBar,
  FaGraduationCap,
  FaComments,
  FaCog,
  FaBriefcase,
  FaMagic,
} from "react-icons/fa";

import "./DashboardLayout.css";

function Sidebar() {

  return (

    <aside className="sidebar">

      <h2>AI Career</h2>

      <NavLink to="/dashboard">
        <FaHome />
        Dashboard
      </NavLink>

      <NavLink to="/profile">
        <FaUser />
        My Profile
      </NavLink>

      <NavLink to="/resume">
        <FaFileAlt />
        Resume
      </NavLink>

      <NavLink to="/analysis">
        <FaRobot />
        AI Analysis
      </NavLink>

      <NavLink to="/career-match">
        <FaBullseye />
        Career Match
      </NavLink>

      <NavLink to="/skill-gap">
        <FaChartBar />
        Skill Gap
      </NavLink>

      <NavLink to="/roadmap">
        <FaGraduationCap />
        Learning Roadmap
      </NavLink>

      <NavLink to="/jobs">
        <FaBriefcase />
        Job Recommendations
      </NavLink>

      <NavLink to="/resume-improvement">
        <FaMagic />
        Resume Improvement
      </NavLink>

      <NavLink to="/chat">
        <FaComments />
        AI Chat
      </NavLink>

      <NavLink to="/settings">
        <FaCog />
        Settings
      </NavLink>
    <div className="sidebar-footer">
        <p>CareerAI v1.0</p>
        <small>© 2026</small>
    </div>
    </aside>

  );

}

export default Sidebar;