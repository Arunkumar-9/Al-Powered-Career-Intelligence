import "./CTA.css";
import { Link } from "react-router-dom";

function CTA() {
  return (
    <section className="cta">
      <h2>Ready to Shape Your Future?</h2>

      <p>
        Join thousands of students using AI to discover the right career path.
      </p>

      <Link to="/register">
        <button>Get Started Free</button>
      </Link>
    </section>
  );
}

export default CTA;