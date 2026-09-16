import { Link } from "react-router-dom";

function HeroSection() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="hero-card">
      <p className="hero-subtitle">CAREER HUB</p>

      <h1>
        Welcome back, {user?.name} 👋
      </h1>

      <p className="hero-description">
        Track your progress, review AI suggestions,
        and take the next step toward your career goals.
      </p>

      <Link to="/profile">
        <button className="primary-btn">
          Update Profile
        </button>
      </Link>
    </div>
  );
}

export default HeroSection;