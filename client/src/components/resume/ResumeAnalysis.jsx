import { FaRobot } from "react-icons/fa";

function ResumeAnalysis({ analyzed }) {
  if (!analyzed) {
    return (
      <div className="analysis-card">

        <FaRobot className="analysis-icon"/>

        <h2>AI Resume Analysis</h2>

        <p>

          Your resume is uploaded successfully.

        </p>

        <p>

          Click <strong>Analyze Resume</strong> to generate:

        </p>

        <ul>

          <li>✅ Resume Score</li>

          <li>✅ ATS Score</li>

          <li>✅ Career Match</li>

          <li>✅ Missing Skills</li>

          <li>✅ Improvement Suggestions</li>

        </ul>

      </div>
    );
  }

  return (
    <div className="analysis-card">

      <h2>AI Analysis Completed</h2>

      <div className="analysis-grid">

        <div>

          <h3>Resume Score</h3>

          <h1>92%</h1>

        </div>

        <div>

          <h3>ATS Score</h3>

          <h1>88%</h1>

        </div>

        <div>

          <h3>Career Match</h3>

          <h1>AI Engineer</h1>

        </div>

      </div>

    </div>
  );
}

export default ResumeAnalysis;