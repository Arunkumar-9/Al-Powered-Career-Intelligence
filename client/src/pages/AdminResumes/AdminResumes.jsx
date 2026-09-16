import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { listResumes, getResumeParsingStats, getAdminResumeView, downloadAdminResume } from "../../services/adminService";
import "../AdminUsers/AdminUsers.css";
import "./AdminResumes.css";

const PAGE_SIZE = 10;

function formatBytes(bytes) {
  if (!bytes) return "0 KB";
  return `${Math.round(bytes / 1024)} KB`;
}

function AdminResumes() {
  const [resumes, setResumes] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [parsingStats, setParsingStats] = useState(null);

  const loadResumes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await listResumes({
        search: search || undefined,
        status: status || undefined,
        page,
        limit: PAGE_SIZE,
      });
      setResumes(response.data.resumes);
      setPagination(response.data.pagination);
    } catch (err) {
      const message = err.response?.data?.message || "Failed to load resumes";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const loadParsingStats = async () => {
    try {
      const response = await getResumeParsingStats();
      setParsingStats(response.data);
    } catch {
      // non-critical for this page; the dedicated parsing page surfaces errors
    }
  };

  useEffect(() => {
    loadResumes();
  }, [page, status]);

  useEffect(() => {
    loadParsingStats();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadResumes();
  };

  return (
    <div>
      <h1 className="admin-page-title">Resume Management</h1>

      {parsingStats && (
        <div className="admin-stats-grid" style={{ marginBottom: 20 }}>
          <div className="admin-stat-card">
            <p className="admin-stat-label">Total Resumes</p>
            <h3 className="admin-stat-value">{parsingStats.totalResumes}</h3>
          </div>
          <div className="admin-stat-card">
            <p className="admin-stat-label">Text Extracted</p>
            <h3 className="admin-stat-value">{parsingStats.textExtracted}</h3>
          </div>
          <div className="admin-stat-card">
            <p className="admin-stat-label">Analyzed</p>
            <h3 className="admin-stat-value">{parsingStats.analyzed}</h3>
          </div>
          <div className="admin-stat-card">
            <p className="admin-stat-label">Not Yet Processed</p>
            <h3 className="admin-stat-value">{parsingStats.notYetProcessed}</h3>
          </div>
          <div className="admin-stat-card">
            <p className="admin-stat-label">Parsing Failed</p>
            <h3 className="admin-stat-value">{parsingStats.failedParsing}</h3>
          </div>
        </div>
      )}

      <div className="admin-panel admin-users-toolbar">
        <form onSubmit={handleSearchSubmit} className="admin-users-search">
          <input
            type="text"
            placeholder="Search by uploader name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>

        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All statuses</option>
          <option value="processed">Text extracted</option>
          <option value="unprocessed">Not processed</option>
          <option value="failed">Parsing failed</option>
          <option value="processing">Parsing in progress</option>
        </select>
      </div>

      <div className="admin-panel">
        {loading ? (
          <p className="admin-empty-state">Loading resumes...</p>
        ) : error ? (
          <p className="admin-empty-state">{error}</p>
        ) : resumes.length === 0 ? (
          <p className="admin-empty-state">No resumes match these filters.</p>
        ) : (
          <>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>File</th>
                    <th>Uploaded By</th>
                    <th>Type</th>
                    <th>Size</th>
                    <th>Version</th>
                    <th>Status</th>
                    <th>Uploaded</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {resumes.map((r) => (
                    <tr key={r._id}>
                      <td>{r.originalName}</td>
                      <td>{r.user ? `${r.user.name} (${r.user.email})` : "Unknown user"}</td>
                      <td>{r.fileType}</td>
                      <td>{formatBytes(r.fileSize)}</td>
                      <td>v{r.version}{r.isActive ? " (active)" : ""}</td>
                      <td>
                        <span className={`admin-badge admin-status-${r.processingStatus.replace(/\s+/g, "-").toLowerCase()}`}>
                          {r.processingStatus}
                        </span>
                      </td>
                      <td>{new Date(r.createdAt).toLocaleString()}</td>
                      <td><button onClick={async () => { try { const response = await getAdminResumeView(r._id); const url = URL.createObjectURL(response.data); window.open(url, "_blank"); setTimeout(() => URL.revokeObjectURL(url), 60000); } catch (e) { toast.error(e.response?.data?.message || "View failed"); } }}>View</button> <button onClick={async () => { try { const response = await downloadAdminResume(r._id); const url = URL.createObjectURL(response.data); const a = document.createElement("a"); a.href = url; a.download = r.originalName; a.click(); URL.revokeObjectURL(url); } catch (e) { toast.error(e.response?.data?.message || "Download failed"); } }}>Download</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="admin-pagination">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
              <span>Page {pagination.page} of {pagination.totalPages} ({pagination.total} resumes)</span>
              <button disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AdminResumes;
