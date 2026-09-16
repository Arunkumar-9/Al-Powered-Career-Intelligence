import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getResumeParsingStats } from "../../services/adminService";
import "../AdminDashboard/AdminDashboard.css";

function AdminResumeParsing() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const response = await getResumeParsingStats();
        setStats(response.data);
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load parsing stats");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="admin-panel">Loading...</div>;
  if (!stats) return null;

  return (
    <div>
      <h1 className="admin-page-title">Resume Parsing Monitoring</h1>

      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <p className="admin-stat-label">Total Resumes</p>
          <h3 className="admin-stat-value">{stats.totalResumes}</h3>
        </div>
        <div className="admin-stat-card">
          <p className="admin-stat-label">Text Extracted</p>
          <h3 className="admin-stat-value">{stats.textExtracted}</h3>
        </div>
        <div className="admin-stat-card">
          <p className="admin-stat-label">Analyzed</p>
          <h3 className="admin-stat-value">{stats.analyzed}</h3>
        </div>
        <div className="admin-stat-card">
          <p className="admin-stat-label">Not Yet Processed</p>
          <h3 className="admin-stat-value">{stats.notYetProcessed}</h3>
        </div>
      </div>

      <div className="admin-panel" style={{ marginTop: 20, borderLeft: "4px solid #f59e0b" }}>
        <h2 className="admin-panel-title">A note on "failed parsing" tracking</h2>
        <p style={{ color: "#475569", lineHeight: 1.6 }}>{stats.note}</p>
        <p style={{ color: "#475569", lineHeight: 1.6 }}>
          To track real parsing failures, the resume text-extraction step in{" "}
          <code>server/services/resumeService.js</code> and its callers would need to catch errors and
          persist them (e.g. a <code>parsingError</code> field on the Resume document) instead of only
          returning a 500 response to the user. That's a small, additive schema change — worth doing in a
          follow-up phase if failure monitoring is a priority.
        </p>
      </div>
    </div>
  );
}

export default AdminResumeParsing;
