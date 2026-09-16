import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { listProfiles, getProfileDetail } from "../../services/adminService";
import "../AdminUsers/AdminUsers.css";
import "../AdminDashboard/AdminDashboard.css";

const PAGE_SIZE = 10;

function AdminProfiles() {
  const [profiles, setProfiles] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadProfiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await listProfiles({ search: search || undefined, page, limit: PAGE_SIZE });
      setProfiles(response.data.profiles);
      setPagination(response.data.pagination);
    } catch (err) {
      const message = err.response?.data?.message || "Failed to load profiles";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadProfiles();
  };

  const openDetail = async (userId) => {
    setDetailLoading(true);
    try {
      const response = await getProfileDetail(userId);
      setDetail(response.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load profile detail");
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div>
      <h1 className="admin-page-title">Profile Management</h1>

      <div className="admin-panel admin-users-toolbar">
        <form onSubmit={handleSearchSubmit} className="admin-users-search">
          <input
            type="text"
            placeholder="Search by user name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>
      </div>

      <div className="admin-panel">
        {loading ? (
          <p className="admin-empty-state">Loading profiles...</p>
        ) : error ? (
          <p className="admin-empty-state">{error}</p>
        ) : profiles.length === 0 ? (
          <p className="admin-empty-state">No profiles match this search.</p>
        ) : (
          <>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>College</th>
                    <th>Degree / Branch</th>
                    <th>Skills</th>
                    <th>Completion</th>
                    <th>Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {profiles.map((p) => (
                    <tr key={p._id}>
                      <td>
                        {p.user.name}
                        <br />
                        <small style={{ color: "#94a3b8" }}>{p.user.email}</small>
                      </td>
                      <td>{p.college || "—"}</td>
                      <td>{[p.degree, p.branch].filter(Boolean).join(" / ") || "—"}</td>
                      <td>{p.skillsCount}</td>
                      <td>{p.completion}%</td>
                      <td>{new Date(p.updatedAt).toLocaleDateString()}</td>
                      <td className="admin-table-actions">
                        <button onClick={() => openDetail(p.user.id)}>View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="admin-pagination">
              <button disabled={page <= 1} onClick={() => setPage((pg) => pg - 1)}>
                Previous
              </button>
              <span>
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} profiles)
              </span>
              <button disabled={page >= pagination.totalPages} onClick={() => setPage((pg) => pg + 1)}>
                Next
              </button>
            </div>
          </>
        )}
      </div>

      {(detail || detailLoading) && (
        <div className="admin-panel" style={{ marginTop: 20 }}>
          <h2 className="admin-panel-title">Profile Detail</h2>
          {detailLoading ? (
            <p className="admin-empty-state">Loading...</p>
          ) : (
            <>
              <p>
                <strong>{detail.user.name}</strong> ({detail.user.email}) — {detail.completion}% complete
              </p>
              {detail.profile ? (
                <ul style={{ color: "#334155", fontSize: 14, lineHeight: 1.8 }}>
                  <li>Phone: {detail.profile.phone || "—"}</li>
                  <li>College: {detail.profile.college || "—"}</li>
                  <li>Degree: {detail.profile.degree || "—"} ({detail.profile.branch || "—"})</li>
                  <li>Graduation Year: {detail.profile.graduationYear || "—"}</li>
                  <li>CGPA: {detail.profile.cgpa ?? "—"}</li>
                  <li>Skills: {(detail.profile.skills || []).join(", ") || "—"}</li>
                  <li>Interests: {(detail.profile.interests || []).join(", ") || "—"}</li>
                  <li>Career Goal: {detail.profile.careerGoal || "—"}</li>
                  <li>Preferred Role: {detail.profile.preferredRole || "—"}</li>
                  <li>Experience: {detail.profile.experience || "—"}</li>
                  <li>Location: {detail.profile.location || "—"}</li>
                </ul>
              ) : (
                <p className="admin-empty-state">This user hasn't created a profile yet.</p>
              )}
              <button onClick={() => setDetail(null)}>Close</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminProfiles;
