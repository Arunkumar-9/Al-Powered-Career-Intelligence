import { Outlet } from "react-router-dom";

import AdminNavbar from "./AdminNavbar";
import AdminSidebar from "./AdminSidebar";

import "./AdminLayout.css";

function AdminLayout() {
  return (
    <div>
      <AdminNavbar />

      <div className="admin-layout">
        <AdminSidebar />

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
