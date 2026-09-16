import "../AdminDashboard/AdminDashboard.css";

function AdminJobRecAnalytics() {
  return (
    <div>
      <h1 className="admin-page-title">Job Recommendation Analytics</h1>

      <div className="admin-panel" style={{ borderLeft: "4px solid #f59e0b" }}>
        <h2 className="admin-panel-title">Not implementable with the current architecture</h2>
        <p style={{ color: "#475569", lineHeight: 1.6 }}>
          Job recommendations on this platform (<code>server/controllers/jobController.js</code>) are
          fetched live from the Adzuna external API on every request and are never saved to the database.
          There is no <code>JobRecommendation</code> collection recording which jobs were shown to a user,
          clicked, or saved — so figures like "most recommended jobs" or "recommendation usage" cannot be
          computed from real data, and this page intentionally does not fabricate them.
        </p>
        <p style={{ color: "#475569", lineHeight: 1.6 }}>
          To make this analytics module possible, a lightweight <code>JobSearchLog</code> (or similar)
          schema would need to be added and written to whenever <code>searchJobsForUser</code> runs —
          recording the querying user, search terms, and returned job IDs. That's a scoped, additive change
          worth planning as its own follow-up rather than bolting on here.
        </p>
      </div>
    </div>
  );
}

export default AdminJobRecAnalytics;
