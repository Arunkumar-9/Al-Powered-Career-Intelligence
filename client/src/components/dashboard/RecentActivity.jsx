import { useEffect, useState } from "react";
import { getDashboardSummary } from "../../services/dashboardService";

function RecentActivity() {
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    let active = true;
    getDashboardSummary()
      .then((response) => { if (active) setActivity(response.data.recentActivity || []); })
      .catch(() => { if (active) setActivity([]); });
    return () => { active = false; };
  }, []);

  return (

    <div className="dashboard-card">

      <h2>📅 Recent Activity</h2>

      <ul className="activity-list">

        {activity.length ? activity.map((item) => (
          <li key={item.id}>✅ {item.message} <small>{new Date(item.createdAt).toLocaleString()}</small></li>
        )) : <li>No recent activity yet.</li>}

      </ul>

    </div>

  );

}

export default RecentActivity;
