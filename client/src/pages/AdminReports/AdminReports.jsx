import { useState } from "react";
import { toast } from "react-toastify";
import {
  adminGlobalSearch,
  downloadUsersReport,
  downloadResumesReport,
  downloadAtsReport,
} from "../../services/adminService";
import "../AdminDashboard/AdminDashboard.css";
import "../AdminUsers/AdminUsers.css";

const REPORTS = [
  { key: "users", label: "Users Report", description: "All users with role, status, registration and last login.", download: downloadUsersReport },
  { key: "resumes", label: "Resumes Report", description: "All uploaded resumes with owner, status, and score.", download: downloadResumesReport },
  { key: "ats", label: "ATS Analyses Report", description: "Every ATS analysis run with score and match details.", download: downloadAtsReport },
];

function AdminReports() {
  const [downloadingKey, setDownloadingKey] = useState(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [searching, setSearching] = useState(false);

  const handleDownload = async (report) => {
    setDownloadingKey(report.key);
    try {
      await report.download();
      toast.success(`${report.label} downloaded`);
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to export ${report.label}`);
    } finally {
      setDownloadingKey(null);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    try {
      const response = await adminGlobalSearch(query.trim());
      setResults(response.data.results);
    } catch (err) {
      toast.error(err.response?.data?.message || "Search failed");
    } finally {
      setSearching(false);
    }
  };

  const hasResults = results && Object.values(results).some((r) => r.length > 0);

  return (
    <div>
      <h1 className="admin-page-title">Search, Filter & Reports</h1>

      <div className="admin-panel" style={{ marginBottom: 20 }}>
        <h2 className="admin-panel-title">Global Search</h2>
        <form onSubmit={handleSearch} className="admin-users-search" style={{ marginBottom: 16 }}>
          <input
            type="text"
            placeholder="Search users, resumes, jobs, feedback..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" disabled={searching}>{searching ? "Searching..." : "Search"}</button>
        </form>

        {results && (
          hasResults ? (
            <div className="admin-analytics-grid">
              {Object.entries(results).map(([group, items]) =>
                items.length > 0 ? (
                  <div key={group}>
                    <h3 style={{ fontSize: 14, textTransform: "capitalize", color: "#1e293b", marginBottom: 8 }}>
                      {group} ({items.length})
                    </h3>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: 13, color: "#334155" }}>
                      {items.map((item) => (
                        <li key={item.id} style={{ padding: "6px 0", borderBottom: "1px solid #f1f5f9" }}>
                          {item.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null
              )}
            </div>
          ) : (
            <p className="admin-empty-state">No results for "{query}".</p>
          )
        )}
      </div>

      <div className="admin-panel">
        <h2 className="admin-panel-title">Export Reports (CSV)</h2>
        <div className="admin-analytics-grid">
          {REPORTS.map((report) => (
            <div key={report.key} className="ui-card" style={{ boxShadow: "none", border: "1px solid #f1f5f9" }}>
              <h3 style={{ margin: "0 0 6px", color: "#1e293b", fontSize: 15 }}>{report.label}</h3>
              <p style={{ color: "#64748b", fontSize: 13, marginBottom: 14 }}>{report.description}</p>
              <button
                disabled={downloadingKey === report.key}
                onClick={() => handleDownload(report)}
                style={{
                  padding: "8px 16px",
                  background: "#2563eb",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                }}
              >
                {downloadingKey === report.key ? "Downloading..." : "Download CSV"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminReports;
