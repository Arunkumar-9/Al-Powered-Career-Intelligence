import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getSystemStatus } from "../../services/adminService";
import "../AdminDashboard/AdminDashboard.css";
import "../AdminUsers/AdminUsers.css";

function StatusDot({ ok }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: 10,
        height: 10,
        borderRadius: "50%",
        background: ok ? "#22c55e" : "#ef4444",
        marginRight: 8,
      }}
    />
  );
}

function AdminSystem() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    setError(null);
    getSystemStatus()
      .then((r) => setData(r.data))
      .catch((err) => {
        const message = err.response?.data?.message || "Failed to load system status";
        setError(message);
        toast.error(message);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h1 className="admin-page-title">System / API Monitoring</h1>

      {loading && !data ? (
        <p className="admin-empty-state">Loading system status...</p>
      ) : error ? (
        <div className="admin-panel admin-error-panel">
          <p>{error}</p>
          <button onClick={load}>Retry</button>
        </div>
      ) : (
        <>
          <div className="admin-stats-grid">
            <div className="admin-stat-card">
              <p className="admin-stat-label"><StatusDot ok /> Backend</p>
              <p className="admin-stat-value" style={{ fontSize: 20 }}>Up</p>
              <p className="admin-stat-hint">Uptime: {Math.floor(data.backend.uptimeSeconds / 60)} min</p>
            </div>
            <div className="admin-stat-card">
              <p className="admin-stat-label"><StatusDot ok={data.database.healthy} /> Database</p>
              <p className="admin-stat-value" style={{ fontSize: 20, textTransform: "capitalize" }}>
                {data.database.status}
              </p>
              <p className="admin-stat-hint">
                {data.database.pingMs !== null ? `Ping: ${data.database.pingMs}ms` : data.database.error || "—"}
              </p>
            </div>
            <div className="admin-stat-card">
              <p className="admin-stat-label">Memory</p>
              <p className="admin-stat-value" style={{ fontSize: 20 }}>
                {data.backend.memoryUsedMb}MB
              </p>
              <p className="admin-stat-hint">of {data.backend.memoryTotalMb}MB heap</p>
            </div>
            <div className="admin-stat-card">
              <p className="admin-stat-label">Environment</p>
              <p className="admin-stat-value" style={{ fontSize: 20 }}>{data.backend.environment}</p>
              <p className="admin-stat-hint">Node {data.backend.nodeVersion}</p>
            </div>
          </div>

          <div className="admin-panel">
            <h2 className="admin-panel-title">External Services</h2>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Used For</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.externalServices.map((s) => (
                    <tr key={s.name}>
                      <td>{s.name}</td>
                      <td>{s.usedFor}</td>
                      <td>
                        <span className={`admin-badge ${s.configured ? "admin-badge-active" : "admin-badge-inactive"}`}>
                          {s.configured ? "Configured" : "Not Configured"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p style={{ color: "#94a3b8", fontSize: 12, marginTop: 12 }}>
            Last updated: {new Date(data.generatedAt).toLocaleString()} · Auto-refreshes every 30s
          </p>
        </>
      )}
    </div>
  );
}

export default AdminSystem;
