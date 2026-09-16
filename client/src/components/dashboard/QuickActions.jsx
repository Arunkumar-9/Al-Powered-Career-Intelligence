import { Link } from "react-router-dom";

function QuickActions() {

  return (

    <div className="dashboard-card">

      <h2>⚡ Quick Actions</h2>

      <div className="action-grid">

        <Link to="/profile">
          <button>👤 Profile</button>
        </Link>

        <Link to="/resume">
          <button>📄 Upload Resume</button>
        </Link>

        <Link to="/analysis">
          <button>🤖 AI Analysis</button>
        </Link>

        <Link to="/chat">
          <button>💬 AI Chat</button>
        </Link>

      </div>

    </div>

  );

}

export default QuickActions;