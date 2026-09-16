import { useNavigate } from "react-router-dom";
import { FaUserShield } from "react-icons/fa";

function AdminNavbar() {
  const navigate = useNavigate();

  const adminUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("adminUser"));
    } catch {
      return null;
    }
  })();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate("/admin/login");
  };

  return (
    <nav className="admin-navbar">
      <div className="admin-logo">
        <h2>CareerAI</h2>
        <p>Admin Dashboard</p>
      </div>

      <div className="admin-nav-right">
        <div className="admin-user-info">
          <FaUserShield />
          {adminUser?.name || "Admin"}
        </div>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}

export default AdminNavbar;
