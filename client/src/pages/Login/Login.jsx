import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { loginUser } from "../../services/authService";
import { adminLogin } from "../../services/adminService";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loginType, setLoginType] = useState("user");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = formData;

    if (!email || !password) {
      toast.error("Please fill all fields");
      return;
    }

    setSubmitting(true);
    try {
      if (loginType === "admin") {
        const response = await adminLogin({ email, password });

        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.setItem("adminToken", response.data.token);
        localStorage.setItem("adminUser", JSON.stringify(response.data.user));

        toast.success(response.data.message);
        navigate("/admin/dashboard");
        return;
      }

      const response = await loginUser({ email, password });

      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      toast.success(response.data.message);
      navigate("/dashboard");
    } catch (error) {
      toast.error(
        error.response?.data?.message || `${loginType === "admin" ? "Admin" : "User"} login failed`
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>

        <h2>Sign in</h2>
        <p className="auth-subtitle">Choose the account you want to access.</p>

        <div className="login-type-toggle" role="group" aria-label="Account type">
          <button
            type="button"
            className={loginType === "user" ? "active" : ""}
            onClick={() => setLoginType("user")}
          >
            User
          </button>
          <button
            type="button"
            className={loginType === "admin" ? "active" : ""}
            onClick={() => setLoginType("admin")}
          >
            Admin
          </button>
        </div>

        <input
          type="email"
          name="email"
          placeholder={loginType === "admin" ? "Admin email" : "Email"}
          value={formData.email}
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
        />

        <button type="submit" disabled={submitting}>
          {submitting ? "Signing in..." : `Sign in as ${loginType === "admin" ? "Admin" : "User"}`}
        </button>

        {loginType === "user" && (
          <p className="auth-link">
            Don't have an account?{" "}
            <Link to="/register">Register</Link>
          </p>
        )}

      </form>
    </div>
  );
}

export default Login;
