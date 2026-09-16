import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { listActivity } from "../../services/adminService";
import "../AdminDashboard/AdminDashboard.css";
import "../AdminUsers/AdminUsers.css";

const PAGE_SIZE = 20;

const TYPE_LABELS = {
  user_registered: "User Registered",
  user_login: "User Login",
  profile_updated: "Profile Updated",
  resume_uploaded: "Resume Uploaded",
  resume_analyzed: "Resume Analyzed",
  career_recommendation: "Career Recommendation",
  course_recommendation: "Course Recommendation",
  job_search: "Job Search",
};

function AdminActivity() {
  const [activity, setActivity] = useState([]);
  const [types, setTypes] = useState([]);
  const [type, setType] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    listActivity({ type: type || undefined, page, limit: PAGE_SIZE })
      .then((r) => {
        setActivity(r.data.activity);
        setPagination(r.data.pagination);
        setTypes(r.data.availableTypes);
      })
      .catch((err) => {
        const message = err.response?.data?.message || "Failed to load activity";
        setError(message);
        toast.error(message);
      })
      .finally(() => setLoading(false));
  }, [type, page]);

  return (
    <div>
      <h1 className="admin-page-title">Platform Usage & Activity Monitoring</h1>

      <div className="admin-panel admin-users-toolbar">
        <select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }}>
          <option value="">All activity types</option>
          {types.map((t) => (
            <option key={t} value={t}>{TYPE_LABELS[t] || t}</option>
          ))}
        </select>
      </div>

      <div className="admin-panel">
        {loading ? (
          <p className="admin-empty-state">Loading activity...</p>
        ) : error ? (
          <p className="admin-empty-state">{error}</p>
        ) : activity.length === 0 ? (
          <p className="admin-empty-state">No activity recorded yet.</p>
        ) : (
          <>
            <ul className="admin-activity-list">
              {activity.map((a, idx) => (
                <li key={idx}>
                  <span className="admin-activity-message">
                    <strong>{a.user?.name || "Unknown user"}</strong> — {a.message}
                  </span>
                  <span className="admin-activity-time">{new Date(a.timestamp).toLocaleString()}</span>
                </li>
              ))}
            </ul>

            <div className="admin-pagination">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
              <span>Page {pagination.page} of {pagination.totalPages} ({pagination.total} events)</span>
              <button disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AdminActivity;
