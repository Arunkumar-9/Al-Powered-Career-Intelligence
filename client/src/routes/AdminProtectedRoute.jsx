import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getAdminSession } from "../services/adminService";

function AdminProtectedRoute({ children }) {
  const token = localStorage.getItem("adminToken");
  const [state, setState] = useState(token ? "checking" : "unauthenticated");

  useEffect(() => {
    if (!token) return;
    let mounted = true;
    getAdminSession()
      .then(({ data }) => {
        if (!mounted) return;
        localStorage.setItem("adminUser", JSON.stringify(data.user));
        setState("authenticated");
      })
      .catch(() => {
        if (!mounted) return;
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        setState("unauthenticated");
      });
    return () => { mounted = false; };
  }, [token]);

  if (state === "checking") return <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>Validating admin session...</div>;
  if (state !== "authenticated") return <Navigate to="/admin/login" replace />;
  return children;
}

export default AdminProtectedRoute;
