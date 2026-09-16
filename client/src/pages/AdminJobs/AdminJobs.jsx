import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { listJobDescriptions, deleteJobDescription } from "../../services/adminService";
import "../AdminUsers/AdminUsers.css";

const PAGE_SIZE = 10;

function AdminJobs() {
  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const loadJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await listJobDescriptions({ search: search || undefined, page, limit: PAGE_SIZE });
      setJobs(response.data.jobs);
      setPagination(response.data.pagination);
    } catch (err) {
      const message = err.response?.data?.message || "Failed to load job descriptions";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, [page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadJobs();
  };

  const handleDelete = async (job) => {
    if (!window.confirm(`Delete job description "${job.title}"?`)) return;
    setBusyId(job._id);
    try {
      await deleteJobDescription(job._id);
      toast.success("Job description deleted");
      loadJobs();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <h1 className="admin-page-title">Job Description Management</h1>
      <p style={{ color: "#64748b", marginTop: -14, marginBottom: 20, fontSize: 14 }}>
        This platform's job "recommendations" are fetched live from an external API and aren't stored, so
        this section manages the saved Job Description library users build for ATS/skill-gap comparisons.
      </p>

      <div className="admin-panel admin-users-toolbar">
        <form onSubmit={handleSearchSubmit} className="admin-users-search">
          <input
            type="text"
            placeholder="Search by title or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>
      </div>

      <div className="admin-panel">
        {loading ? (
          <p className="admin-empty-state">Loading job descriptions...</p>
        ) : error ? (
          <p className="admin-empty-state">{error}</p>
        ) : jobs.length === 0 ? (
          <p className="admin-empty-state">No job descriptions found.</p>
        ) : (
          <>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Company</th>
                    <th>Saved By</th>
                    <th>Used in Analyses</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((j) => (
                    <tr key={j._id}>
                      <td>{j.title}</td>
                      <td>{j.company || "—"}</td>
                      <td>{j.user ? `${j.user.name} (${j.user.email})` : "Unknown user"}</td>
                      <td>{j.analysisUsageCount}</td>
                      <td>{new Date(j.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button
                          className="admin-btn-danger"
                          disabled={busyId === j._id}
                          onClick={() => handleDelete(j)}
                        >
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
              <span>Page {pagination.page} of {pagination.totalPages} ({pagination.total} job descriptions)</span>
              <button disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AdminJobs;
