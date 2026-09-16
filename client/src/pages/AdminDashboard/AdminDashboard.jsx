import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getDashboardStats, getAtsAnalytics } from "../../services/adminService";
import "./AdminDashboard.css";

function StatCard({ label, value, hint }) { return <div className="admin-stat-card"><p className="admin-stat-label">{label}</p><h3 className="admin-stat-value">{value}</h3>{hint && <p className="admin-stat-hint">{hint}</p>}</div>; }
function MiniBars({ items, valueKey, labelKey }) { const max = Math.max(...items.map(x => Number(x[valueKey]) || 0), 1); return <div className="admin-mini-bars">{items.map((x,i)=><div className="admin-mini-bar" key={i}><span>{x[labelKey]}</span><div><i style={{height:`${Math.max(((Number(x[valueKey])||0)/max)*100,3)}%`}}/></div><b>{x[valueKey]}</b></div>)}</div>; }

function AdminDashboard() {
  const [stats,setStats]=useState(null); const [ats,setAts]=useState(null); const [loading,setLoading]=useState(true); const [error,setError]=useState(null);
  const load=async()=>{setLoading(true);setError(null);try{const [s,a]=await Promise.all([getDashboardStats(),getAtsAnalytics()]);setStats(s.data);setAts(a.data);}catch(err){const m=err.response?.data?.message||"Failed to load dashboard";setError(m);toast.error(m)}finally{setLoading(false)}};
  useEffect(()=>{ let cancelled=false; Promise.all([getDashboardStats(),getAtsAnalytics()]).then(([s,a])=>{ if(cancelled)return; setStats(s.data); setAts(a.data); }).catch(err=>{ if(cancelled)return; const m=err.response?.data?.message||"Failed to load dashboard"; setError(m); toast.error(m); }).finally(()=>{ if(!cancelled) setLoading(false); }); return ()=>{cancelled=true}; },[]);
  if(loading)return <div className="admin-panel">Loading dashboard...</div>;
  if(error)return <div className="admin-panel admin-error-panel"><p>{error}</p><button onClick={load}>Retry</button></div>;
  return <div><div className="admin-dashboard-heading"><div><h1 className="admin-page-title">Dashboard Overview</h1><p>Live platform intelligence from your existing production data.</p></div><span className="admin-live-pill">● Live data</span></div>
    <div className="admin-stats-grid">
      <StatCard label="Total Users" value={stats.users.total}/><StatCard label="Active Users" value={stats.users.active}/><StatCard label="New This Week" value={stats.users.newThisWeek}/><StatCard label="Total Resumes" value={stats.resumes.total}/><StatCard label="Resume Analyses" value={stats.resumes.totalAnalyses}/><StatCard label="Average ATS" value={`${stats.resumes.averageAtsScore}%`}/><StatCard label="Saved Job Descriptions" value={stats.jobs.total}/><StatCard label="Job Searches" value={stats.jobRecommendations?.totalSearches || 0}/><StatCard label="Career Recommendations" value={stats.recommendations.careerRecommendationBatches}/><StatCard label="Course Recommendations" value={stats.recommendations.courseRecommendationBatches}/><StatCard label="30-Day Activity" value={stats.activityStats?.totalEvents || 0}/>
    </div>
    <div className="admin-dashboard-grid">
      <div className="admin-panel"><h2 className="admin-panel-title">ATS Score Distribution</h2>{ats?.distribution?.length?<MiniBars items={ats.distribution} valueKey="count" labelKey="range"/>:<p className="admin-empty-state">No ATS analysis data yet.</p>}</div>
      <div className="admin-panel"><h2 className="admin-panel-title">Recent Platform Activity</h2>{stats.recentActivity.length===0?<p className="admin-empty-state">No recent activity yet.</p>:<ul className="admin-activity-list">{stats.recentActivity.map((item,idx)=><li key={idx}><span className="admin-activity-message">{item.message}</span><span className="admin-activity-time">{new Date(item.timestamp).toLocaleString()}</span></li>)}</ul>}</div>
    </div>
    <div className="admin-dashboard-grid">
      <div className="admin-panel"><h2 className="admin-panel-title">ATS Trend — Last 30 Days</h2>{ats?.trend?.length?<MiniBars items={ats.trend.slice(-12)} valueKey="averageScore" labelKey="date"/>:<p className="admin-empty-state">No recent analyses.</p>}</div>
      <div className="admin-panel"><h2 className="admin-panel-title">Common Resume Gaps</h2>{ats?.topMissingSkills?.length?<MiniBars items={ats.topMissingSkills.slice(0,8)} valueKey="count" labelKey="skill"/>:<p className="admin-empty-state">No skill-gap data yet.</p>}</div>
    </div>
    <p className="admin-generated">Last refreshed: {new Date(stats.generatedAt).toLocaleString()}</p>
  </div>;
}
export default AdminDashboard;
