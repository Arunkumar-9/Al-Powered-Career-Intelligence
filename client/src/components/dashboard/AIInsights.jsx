import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDashboardSummary } from "../../services/dashboardService";

function AIInsights() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    let active = true;
    getDashboardSummary()
      .then((response) => { if (active) setSummary(response.data); })
      .catch(() => { if (active) setSummary(null); });
    return () => { active = false; };
  }, []);

  const suggestions = [
    !summary?.profileCompletion || summary.profileCompletion < 100
      ? { text: "Complete your profile to improve recommendation quality.", to: "/profile" }
      : null,
    !summary?.ats
      ? { text: "Run an ATS analysis to measure your resume match.", to: "/analysis" }
      : summary.ats.missingSkills?.length
        ? { text: `Build these skills next: ${summary.ats.missingSkills.slice(0, 3).join(", ")}.`, to: "/skill-gap" }
        : null,
    !summary?.resumeImprovement
      ? { text: "Generate tailored resume-improvement suggestions.", to: "/resume-improvement" }
      : null,
  ].filter(Boolean);

  return (

    <div className="dashboard-card">

      <h2>🤖 AI Suggestions</h2>

      <ul className="suggestion-list">

        {suggestions.length ? suggestions.map((suggestion) => (
          <li key={suggestion.to}><Link to={suggestion.to}>✔ {suggestion.text}</Link></li>
        )) : <li>✔ Your career intelligence profile is up to date.</li>}

      </ul>

    </div>

  );

}

export default AIInsights;
