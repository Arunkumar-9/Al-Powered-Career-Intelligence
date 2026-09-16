import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { listFeedback, getFeedbackStats, updateFeedbackStatus, deleteFeedback } from "../../services/adminService";
import "../AdminUsers/AdminUsers.css";
import "../AdminDashboard/AdminDashboard.css";

const PAGE_SIZE = 10;

function AdminFeedback() {
  const [feedback, setFeedback] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const loadFeedback = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await listFeedback({ search: search || undefined, status: status || undefined, page, limit: PAGE_SIZE });
      setFeedback(response.data.feedback);
      setPagination(response.data.pagination);
    } catch (err) {
      const message = err.response?.data?.message || "Failed to load feedback";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedback();
    getFeedbackStats().then((r) => setStats(r.data)).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadFeedback();
  };

  const handleStatusChange = async (item, newStatus) => {
    setBusyId(item._id);
    try {
      await updateFeedbackStatus(item._id, newStatus);
      toast.success("Status updated");
      loadFeedback();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm("Delete this feedback? This cannot be undone.")) return;
    setBusyId(item._id);
    try {
      await deleteFeedback(item._id);
      toast.success("Feedback deleted");
      loadFeedback();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete feedback");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <h1 className="admin-page-title">User Feedback Management</h1>

      {stats && (
        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <p className="admin-stat-label">Total Feedback</p>
            <p className="admin-stat-value">{stats.total}</p>
          </div>
          <div className="admin-stat-card">
            <p className="admin-stat-label">Average Rating</p>
            <p className="admin-stat-value">{stats.averageRating ?? "—"}</p>
          </div>
          <div className="admin-stat-card">
            <p className="admin-stat-label">New / Unreviewed</p>
            <p className="admin-stat-value">{stats.byStatus.find((s) => s.status === "new")?.count || 0}</p>
          </div>
        </div>
      )}

      <div className="admin-panel admin-users-toolbar">
        <form onSubmit={handleSearchSubmit} className="admin-users-search">
          <input
            type="text"
            placeholder="Search feedback text..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>

        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All statuses</option>
          <option value="new">New</option>
          <option value="reviewed">Reviewed</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      <div className="admin-panel">
        {loading ? (
          <p className="admin-empty-state">Loading feedback...</p>
        ) : error ? (
          <p className="admin-empty-state">{error}</p>
        ) : feedback.length === 0 ? (
          <p className="admin-empty-state">No feedback submitted yet.</p>
        ) : (
          <>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Category</th>
                    <th>Rating</th>
                    <th>Message</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {feedback.map((f) => (
                    <tr key={f._id}>
                      <td>{f.user ? `${f.user.name}` : "Deleted user"}</td>
                      <td style={{ textTransform: "capitalize" }}>{f.category.replace("_", " ")}</td>
                      <td>{f.rating ? `${f.rating}/5` : "—"}</td>
                      <td style={{ whiteSpace: "normal", maxWidth: 280 }}>{f.message}</td>
                      <td>
                        <span className={`admin-badge admin-badge-${f.status === "new" ? "inactive" : "active"}`}>
                          {f.status}
                        </span>
                      </td>
                      <td>{new Date(f.createdAt).toLocaleDateString()}</td>
                      <td className="admin-table-actions">
                        {f.status !== "reviewed" && (
                          <button disabled={busyId === f._id} onClick={() => handleStatusChange(f, "reviewed")}>
                            Mark Reviewed
                          </button>
                        )}
                        {f.status !== "resolved" && (
                          <button disabled={busyId === f._id} onClick={() => handleStatusChange(f, "resolved")}>
                            Mark Resolved
                          </button>
                        )}
                        <button className="admin-btn-danger" disabled={busyId === f._id} onClick={() => handleDelete(f)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="admin-pagination">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
              <span>Page {pagination.page} of {pagination.totalPages} ({pagination.total} items)</span>
              <button disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AdminFeedback;
