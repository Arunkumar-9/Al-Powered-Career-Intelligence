import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getNotifications } from "../../services/adminService";
import "../AdminDashboard/AdminDashboard.css";

const SEVERITY_STYLE = {
  critical: { borderColor: "#ef4444", background: "#fef2f2", color: "#b91c1c" },
  warning: { borderColor: "#f59e0b", background: "#fffbeb", color: "#92400e" },
  info: { borderColor: "#2563eb", background: "#eff6ff", color: "#1d4ed8" },
};

function AdminNotifications() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    setError(null);
    getNotifications()
      .then((r) => setData(r.data))
      .catch((err) => {
        const message = err.response?.data?.message || "Failed to load notifications";
        setError(message);
        toast.error(message);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <h1 className="admin-page-title">Notifications & Alerts</h1>

      <div className="admin-panel admin-note-panel" style={{ marginBottom: 20 }}>
        Alerts here are computed live from current platform conditions each time this page loads (not a
        stored, ever-growing notification log), so they always reflect real, current state.
      </div>

      {loading ? (
        <p className="admin-empty-state">Loading...</p>
      ) : error ? (
        <p className="admin-empty-state">{error}</p>
      ) : data.alerts.length === 0 ? (
        <div className="admin-panel">
          <p className="admin-empty-state">All clear — no active alerts right now.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {data.alerts.map((a, idx) => {
            const style = SEVERITY_STYLE[a.severity] || SEVERITY_STYLE.info;
            return (
              <div
                key={idx}
                className="admin-panel"
                style={{ borderLeft: `4px solid ${style.borderColor}`, background: style.background }}
              >
                <p style={{ margin: 0, color: style.color, fontWeight: 600, textTransform: "uppercase", fontSize: 11 }}>
                  {a.severity} · {a.type.replace("_", " ")}
                </p>
                <p style={{ margin: "6px 0 0", color: "#1e293b" }}>{a.message}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AdminNotifications;
