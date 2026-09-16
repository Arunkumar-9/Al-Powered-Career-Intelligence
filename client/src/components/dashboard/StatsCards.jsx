import { useEffect, useState } from "react";
import { getDashboardSummary } from "../../services/dashboardService";

// Bug 1 fix: this card previously read a "profile" key from
// localStorage that nothing in the app ever set, so Career Goal was
// always empty, and Resume Score / Profile Completion were hardcoded
// placeholder values ("--" / "80%"). It now pulls real data from the
// same /api/dashboard/summary endpoint the Career Intelligence
// section below already uses, with a proper loading state and a
// fallback only when the data genuinely doesn't exist yet.
function StatsCards() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const res = await getDashboardSummary();
        if (isMounted) setSummary(res.data);
      } catch {
        if (isMounted) setSummary(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const atsScore = summary?.ats?.atsScore;
  const careerGoal = summary?.careerGoal;
  const profileCompletion = summary?.profileCompletion ?? 0;

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <h3>📄 Resume Score</h3>
        <h1>{loading ? "..." : atsScore !== undefined && atsScore !== null ? atsScore : "--"}</h1>
        <p>
          {loading
            ? "Loading..."
            : atsScore !== undefined && atsScore !== null
            ? "ATS Score"
            : "Upload resume to analyze"}
        </p>
      </div>

      <div className="stat-card">
        <h3>🎯 Career Goal</h3>
        <h1>{loading ? "..." : careerGoal || "--"}</h1>
        <p>{loading ? "Loading..." : careerGoal ? "Current Target" : "Set your goal in Profile"}</p>
      </div>

      <div className="stat-card">
        <h3>📈 Profile</h3>
        <h1>{loading ? "..." : `${profileCompletion}%`}</h1>
        <p>Completion</p>
      </div>
    </div>
  );
}

export default StatsCards;
