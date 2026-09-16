import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { listCourses, getCourseStats } from "../../services/adminService";
import "../AdminUsers/AdminUsers.css";
import "../AdminDashboard/AdminDashboard.css";
import "../../components/adminLayout/AdminAnalytics.css";

const PAGE_SIZE = 12;

function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [search, setSearch] = useState("");
  const [platform, setPlatform] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  const loadCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await listCourses({
        search: search || undefined,
        platform: platform || undefined,
        page,
        limit: PAGE_SIZE,
      });
      setCourses(response.data.courses);
      setPlatforms(response.data.platforms);
      setPagination(response.data.pagination);
    } catch (err) {
      const message = err.response?.data?.message || "Failed to load courses";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
    getCourseStats()
      .then((r) => setStats(r.data))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, platform]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadCourses();
  };

  return (
    <div>
      <h1 className="admin-page-title">Course & Certification Management</h1>

      <div className="admin-panel admin-note-panel" style={{ marginBottom: 20 }}>
        There is no admin-authored course catalog in this architecture — courses are AI-recommended per
        user based on skill gaps and cached. This view aggregates every course ever recommended across all
        users, so add/edit of individual courses isn't supported; search, filter, and usage stats are real.
      </div>

      {stats && (
        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <p className="admin-stat-label">Recommendation Batches</p>
            <p className="admin-stat-value">{stats.totalRecommendationBatches}</p>
          </div>
          <div className="admin-stat-card">
            <p className="admin-stat-label">Platforms</p>
            <p className="admin-stat-value">{stats.byPlatform.length}</p>
          </div>
        </div>
      )}

      <div className="admin-panel admin-users-toolbar">
        <form onSubmit={handleSearchSubmit} className="admin-users-search">
          <input
            type="text"
            placeholder="Search by course title or skill..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>

        <select value={platform} onChange={(e) => { setPlatform(e.target.value); setPage(1); }}>
          <option value="">All platforms</option>
          {platforms.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      <div className="admin-panel">
        {loading ? (
          <p className="admin-empty-state">Loading courses...</p>
        ) : error ? (
          <p className="admin-empty-state">{error}</p>
        ) : courses.length === 0 ? (
          <p className="admin-empty-state">No courses match these filters.</p>
        ) : (
          <>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Platform</th>
                    <th>Skills Covered</th>
                    <th>Difficulty</th>
                    <th>Duration</th>
                    <th>Times Recommended</th>
                    <th>Last Recommended</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((c, idx) => (
                    <tr key={idx}>
                      <td>
                        {c.url ? (
                          <a href={c.url} target="_blank" rel="noreferrer">{c.title}</a>
                        ) : (
                          c.title
                        )}
                      </td>
                      <td>{c.platform || "—"}</td>
                      <td>{(c.skills || []).filter(Boolean).join(", ") || "—"}</td>
                      <td>{c.difficulty || "—"}</td>
                      <td>{c.duration || "—"}</td>
                      <td>{c.timesRecommended}</td>
                      <td>{new Date(c.lastRecommendedAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="admin-pagination">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
              <span>Page {pagination.page} of {pagination.totalPages} ({pagination.total} courses)</span>
              <button disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AdminCourses;
