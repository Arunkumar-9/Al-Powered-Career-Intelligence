import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getCareerAnalytics } from "../../services/adminService";
import "../AdminDashboard/AdminDashboard.css";
import "../../components/adminLayout/AdminAnalytics.css";

function AdminCareerAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const response = await getCareerAnalytics();
        setData(response.data);
      } catch (err) {
        const message = err.response?.data?.message || "Failed to load career analytics";
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="admin-panel">Loading career analytics...</div>;
  if (error) return <div className="admin-panel admin-error-panel">{error}</div>;
  if (!data) return null;

  const max = Math.max(...data.topRecommendedRoles.map((r) => r.timesRecommended), 1);

  return (
    <div>
      <h1 className="admin-page-title">Career Recommendation Analytics</h1>

      <div className="admin-stats-grid" style={{ marginBottom: 20 }}>
        <div className="admin-stat-card">
          <p className="admin-stat-label">Recommendation Batches</p>
          <h3 className="admin-stat-value">{data.totalRecommendationBatches}</h3>
        </div>
      </div>

      <div className="admin-panel">
        <h2 className="admin-panel-title">Most Recommended Career Roles</h2>
        {data.topRecommendedRoles.length === 0 ? (
          <p className="admin-empty-state">No career recommendations generated yet.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Times Recommended</th>
                  <th>Avg. Compatibility</th>
                </tr>
              </thead>
              <tbody>
                {data.topRecommendedRoles.map((r, idx) => (
                  <tr key={idx}>
                    <td style={{ minWidth: 200 }}>
                      {r.role}
                      <div className="admin-bar-track" style={{ marginTop: 6 }}>
                        <span
                          className="admin-bar-fill"
                          style={{ width: `${(r.timesRecommended / max) * 100}%` }}
                        />
                      </div>
                    </td>
                    <td>{r.timesRecommended}</td>
                    <td>{r.averageCompatibility}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminCareerAnalytics;
