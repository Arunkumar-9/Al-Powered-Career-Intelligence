import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getSkillGapAnalytics } from "../../services/adminService";
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

function AdminSkillGapAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const response = await getSkillGapAnalytics();
        setData(response.data);
      } catch (err) {
        const message = err.response?.data?.message || "Failed to load skill gap analytics";
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="admin-panel">Loading skill gap analytics...</div>;
  if (error) return <div className="admin-panel admin-error-panel">{error}</div>;
  if (!data) return null;

  return (
    <div>
      <h1 className="admin-page-title">Skill Gap Analytics</h1>
      <p style={{ color: "#64748b", marginTop: -14, marginBottom: 20, fontSize: 14 }}>
        Aggregated across every stored ATS/skill-gap analysis on the platform.
      </p>

      <div className="admin-analytics-grid">
        <div className="admin-panel">
          <h2 className="admin-panel-title">Skills Users Most Commonly Lack</h2>
          {data.mostMissingSkills.length === 0 ? (
            <p className="admin-empty-state">No data yet.</p>
          ) : (
            <BarList items={data.mostMissingSkills} labelKey="skill" countKey="count" />
          )}
        </div>

        <div className="admin-panel">
          <h2 className="admin-panel-title">Most Common Skills Users Already Have</h2>
          {data.mostCommonMatchingSkills.length === 0 ? (
            <p className="admin-empty-state">No data yet.</p>
          ) : (
            <BarList items={data.mostCommonMatchingSkills} labelKey="skill" countKey="count" />
          )}
        </div>

        <div className="admin-panel">
          <h2 className="admin-panel-title">Most Frequently Recommended Skills</h2>
          {data.mostRecommendedSkills.length === 0 ? (
            <p className="admin-empty-state">No data yet.</p>
          ) : (
            <BarList items={data.mostRecommendedSkills} labelKey="skill" countKey="count" />
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminSkillGapAnalytics;
