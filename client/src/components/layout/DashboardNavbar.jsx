import { FaBell, FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./DashboardLayout.css";

function DashboardNavbar() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header className="dashboard-navbar">

      <div className="logo">
        <h2>CareerAI</h2>
        <p>AI-Powered Career Guidance</p>
      </div>

      <div className="nav-right">

        <FaBell className="icon" size={20} />

        <div className="user-info">
          <FaUserCircle size={30} />
          <span>{user?.name}</span>
        </div>

        <button onClick={logout}>
          Logout
        </button>

      </div>

    </header>
  );
}

export default DashboardNavbar;