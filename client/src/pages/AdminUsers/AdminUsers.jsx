import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  listUsers,
  updateUserStatus,
  updateUserRole,
  deleteUser,
  getUserDetail,
  exportUsers,
} from "../../services/adminService";
import "./AdminUsers.css";

const PAGE_SIZE = 10;

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  const currentAdminId = (() => {
    try {
      return JSON.parse(localStorage.getItem("adminUser"))?.id;
    } catch {
      return null;
    }
  })();

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await listUsers({
        search: search || undefined,
        role: role || undefined,
        status: status || undefined,
        page,
        limit: PAGE_SIZE,
      });
      setUsers(response.data.users);
      setPagination(response.data.pagination);
    } catch (err) {
      const message = err.response?.data?.message || "Failed to load users";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [page, role, status]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadUsers();
  };

  const handleToggleActive = async (user) => {
    const nextActive = user.isActive === false;
    const verb = nextActive ? "activate" : "deactivate";

    if (!window.confirm(`Are you sure you want to ${verb} ${user.name}?`)) return;

    setBusyId(user._id);
    try {
      await updateUserStatus(user._id, nextActive);
      toast.success(`User ${verb}d`);
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${verb} user`);
    } finally {
      setBusyId(null);
    }
  };

  const handleRoleToggle = async (user) => {
    const nextRole = user.role === "admin" ? "user" : "admin";

    if (!window.confirm(`Change ${user.name}'s role to "${nextRole}"?`)) return;

    setBusyId(user._id);
    try {
      await updateUserRole(user._id, nextRole);
      toast.success("Role updated");
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update role");
    } finally {
      setBusyId(null);
    }
  };

  const handleView = async (user) => {
    try { const response = await getUserDetail(user._id); setSelectedUser(response.data); } catch (err) { toast.error(err.response?.data?.message || "Failed to load user details"); }
  };

  const handleExport = async () => {
    try { const response = await exportUsers(); const url = URL.createObjectURL(response.data); const a = document.createElement("a"); a.href = url; a.download = "careerai-users.csv"; a.click(); URL.revokeObjectURL(url); } catch (err) { toast.error(err.response?.data?.message || "Export failed"); }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Permanently delete ${user.name} (${user.email})? This cannot be undone.`)) return;

    setBusyId(user._id);
    try {
      await deleteUser(user._id);
      toast.success("User deleted");
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete user");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="admin-users-heading"><h1 className="admin-page-title">User Management</h1><button className="admin-export-btn" onClick={handleExport}>Export CSV</button></div>

      <div className="admin-panel admin-users-toolbar">
        <form onSubmit={handleSearchSubmit} className="admin-users-search">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>

        <select value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }}>
          <option value="">All roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>

        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="admin-panel">
        {loading ? (
          <p className="admin-empty-state">Loading users...</p>
        ) : error ? (
          <p className="admin-empty-state">{error}</p>
        ) : users.length === 0 ? (
          <p className="admin-empty-state">No users match these filters.</p>
        ) : (
          <>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Registered</th>
                    <th>Last Login</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`admin-badge admin-badge-${user.role}`}>{user.role}</span>
                      </td>
                      <td>
                        <span className={`admin-badge ${user.isActive === false ? "admin-badge-inactive" : "admin-badge-active"}`}>
                          {user.isActive === false ? "Inactive" : "Active"}
                        </span>
                      </td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td>{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "Never"}</td>
                      <td className="admin-table-actions">
                        <button disabled={busyId === user._id || user._id === currentAdminId} onClick={() => handleToggleActive(user)}>
                          {user.isActive === false ? "Activate" : "Deactivate"}
                        </button>
                        <button disabled={busyId === user._id || user._id === currentAdminId} onClick={() => handleRoleToggle(user)}>
                          {user.role === "admin" ? "Make User" : "Make Admin"}
                        </button>
                        <button
                          className="admin-btn-view"
                          disabled={busyId === user._id}
                          onClick={() => handleView(user)}
                        >View
                        </button>
                        <button
                          className="admin-btn-danger"
                          disabled={busyId === user._id || user._id === currentAdminId}
                          onClick={() => handleDelete(user)}
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
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </button>
              <span>
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} users)
              </span>
              <button disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}>
                Next
              </button>
            </div>
          </>
        )}
      </div>
      {selectedUser && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedUser(null)}>
          <div className="admin-user-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header"><h2>{selectedUser.user.name}</h2><button onClick={() => setSelectedUser(null)}>×</button></div>
            <p><strong>Email:</strong> {selectedUser.user.email}</p>
            <p><strong>Role:</strong> {selectedUser.user.role} · <strong>Status:</strong> {selectedUser.user.isActive === false ? "Inactive" : "Active"}</p>
            <p><strong>Registered:</strong> {new Date(selectedUser.user.createdAt).toLocaleString()}</p>
            <p><strong>Last login:</strong> {selectedUser.user.lastLoginAt ? new Date(selectedUser.user.lastLoginAt).toLocaleString() : "Never"}</p>
            <hr/>
            <h3>Profile</h3>
            {selectedUser.profile ? <div className="admin-user-detail-grid"><span>College<strong>{selectedUser.profile.college || "—"}</strong></span><span>Degree<strong>{selectedUser.profile.degree || "—"}</strong></span><span>CGPA<strong>{selectedUser.profile.cgpa ?? "—"}</strong></span><span>Skills<strong>{(selectedUser.profile.skills || []).join(", ") || "—"}</strong></span></div> : <p className="admin-empty-state">No profile created.</p>}
            <hr/>
            <h3>Activity</h3><p>Resumes: <strong>{selectedUser.activity.resumeCount}</strong> · Latest ATS: <strong>{selectedUser.activity.latestAtsScore ?? "—"}</strong></p>
          </div>
        </div>
      )}

    </div>
  );
}

export default AdminUsers;
