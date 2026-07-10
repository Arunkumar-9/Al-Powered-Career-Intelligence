import React from "react";
import "./Dashboard.css";

function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const navItems = [
    "Dashboard",
    "My Profile",
    "Resume",
    "AI Analysis",
    "Career Match",
    "Skill Gap",
    "Learning Roadmap",
    "AI Chat",
    "Settings",
    "Logout",
  ];

  const stats = [
    { title: "Resume Score", value: "82%", description: "Optimized for current roles" },
    { title: "Career Match", value: "High", description: "Good fit for product roles" },
    { title: "Learning Progress", value: "58%", description: "On track for next milestone" },
  ];

  const quickActions = ["Update resume", "Review career goals", "Check skill gaps", "Explore roadmap"];

  return (
    <div className="dashboard">
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand">AI Career</div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button key={item} className="sidebar-link">
              {item}
            </button>
          ))}
        </nav>
      </aside>

      <main className="dashboard-main">
        <div className="dashboard-header">
          <div>
            <p className="dashboard-subtitle">Career Hub</p>
            <h1>Welcome back, {user?.name ?? "there"} 👋</h1>
            <p className="dashboard-intro">
              Track your progress, review suggestions, and take the next steps toward your career goals.
            </p>
          </div>
          <button className="dashboard-action">Update Profile</button>
        </div>

        <div className="summary-grid">
          {stats.map((item) => (
            <div key={item.title} className="card summary-card">
              <h2>{item.title}</h2>
              <p className="metric">{item.value}</p>
              <p className="card-note">{item.description}</p>
            </div>
          ))}
        </div>

        <div className="dashboard-body">
          <div className="card insights-card">
            <h2>AI Insights</h2>
            <ul>
              <li>Resume needs 3 updates for ATS keywords</li>
              <li>Latest career match suggests Data Analyst</li>
              <li>Complete 2 learning modules this week</li>
            </ul>
          </div>

          <div className="card actions-card">
            <h2>Quick actions</h2>
            <div className="quick-actions">
              {quickActions.map((action) => (
                <button key={action} className="quick-link">
                  {action}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;