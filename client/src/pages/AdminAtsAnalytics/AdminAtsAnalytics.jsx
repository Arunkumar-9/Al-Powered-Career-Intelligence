import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getAtsAnalytics } from "../../services/adminService";
import "../AdminDashboard/AdminDashboard.css";
import "../../components/adminLayout/AdminAnalytics.css";

function BarList({ items, labelKey, countKey }) {
  const max = Math.max(...items.map((i) => i[countKey]), 1);
  return (
    <ul className="admin-bar-list">
      {items.map((item, idx) => (
        <li key={idx} className="admin-bar-row">
          <span className="admin-bar-label">{item[labelKey]}</span>
          <span className="admin-bar-track">
            <span className="admin-bar-fill" style={{ width: `${(item[countKey] / max) * 100}%` }} />
          </span>
          <span className="admin-bar-count">{item[countKey]}</span>
        </li>
      ))}
    </ul>
  );
}

function AdminAtsAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const response = await getAtsAnalytics();
        setData(response.data);
      } catch (err) {
        const message = err.response?.data?.message || "Failed to load ATS analytics";
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="admin-panel">Loading ATS analytics...</div>;
  if (error) return <div className="admin-panel admin-error-panel">{error}</div>;
  if (!data) return null;

  const maxDistribution = Math.max(...data.distribution.map((d) => d.count), 1);

  return (
    <div>
      <h1 className="admin-page-title">ATS Score & Analysis Monitoring</h1>

      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <p className="admin-stat-label">Average Score</p>
          <h3 className="admin-stat-value">{data.summary.average}</h3>
        </div>
        <div className="admin-stat-card">
          <p className="admin-stat-label">Highest Score</p>
          <h3 className="admin-stat-value">{data.summary.highest}</h3>
        </div>
        <div className="admin-stat-card">
          <p className="admin-stat-label">Lowest Score</p>
          <h3 className="admin-stat-value">{data.summary.lowest}</h3>
        </div>
        <div className="admin-stat-card">
          <p className="admin-stat-label">Total Analyses</p>
          <h3 className="admin-stat-value">{data.summary.totalAnalyses}</h3>
        </div>
      </div>

      <div className="admin-analytics-grid">
        <div className="admin-panel">
          <h2 className="admin-panel-title">Score Distribution</h2>
          {data.distribution.length === 0 ? (
            <p className="admin-empty-state">No analyses yet.</p>
          ) : (
            <ul className="admin-bar-list">
              {data.distribution.map((b, idx) => (
                <li key={idx} className="admin-bar-row">
                  <span className="admin-bar-label">{b.range}</span>
                  <span className="admin-bar-track">
                    <span className="admin-bar-fill" style={{ width: `${(b.count / maxDistribution) * 100}%` }} />
                  </span>
                  <span className="admin-bar-count">{b.count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="admin-panel">
          <h2 className="admin-panel-title">Score Trend (last 30 days)</h2>
          {data.trend.length === 0 ? (
            <p className="admin-empty-state">No analyses in the last 30 days.</p>
          ) : (
            <ul className="admin-bar-list">
              {data.trend.map((t, idx) => (
                <li key={idx} className="admin-bar-row">
                  <span className="admin-bar-label">{t.date}</span>
                  <span className="admin-bar-track">
                    <span className="admin-bar-fill" style={{ width: `${t.averageScore}%` }} />
                  </span>
                  <span className="admin-bar-count">{t.averageScore}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="admin-panel">
          <h2 className="admin-panel-title">Most Common Missing Keywords</h2>
          {data.topMissingKeywords.length === 0 ? (
            <p className="admin-empty-state">No data yet.</p>
          ) : (
            <BarList items={data.topMissingKeywords} labelKey="keyword" countKey="count" />
          )}
        </div>

        <div className="admin-panel">
          <h2 className="admin-panel-title">Most Common Missing Skills</h2>
          {data.topMissingSkills.length === 0 ? (
            <p className="admin-empty-state">No data yet.</p>
          ) : (
            <BarList items={data.topMissingSkills} labelKey="skill" countKey="count" />
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminAtsAnalytics;
