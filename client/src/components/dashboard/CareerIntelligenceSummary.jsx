import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaFileAlt, FaBriefcase, FaGraduationCap, FaMagic } from "react-icons/fa";
import Card from "../common/Card";
import ScoreRing from "../common/ScoreRing";
import ProgressBar from "../common/ProgressBar";
import Loader from "../common/Loader";
import { getDashboardSummary } from "../../services/dashboardService";
import "./CareerIntelligenceSummary.css";

// Module 7: Career Dashboard. Aggregates results from every other
// Milestone 3 module (ATS score, skill gap, career & course
// recommendations, profile completion) into one dashboard section.
// Appended below the existing dashboard sections — does not modify
// HeroSection / StatsCards / QuickActions / AIInsights / RecentActivity.
function CareerIntelligenceSummary() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await getDashboardSummary();
        setData(res.data);
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="career-intel">
        <Loader label="Loading career intelligence summary..." />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="career-intel">
      <h2 className="career-intel__title">Career Intelligence</h2>

      <div className="career-intel__top">
        <Card className="career-intel__score-card">
          {data.ats ? (
            <ScoreRing value={data.ats.atsScore} label="ATS Score" />
          ) : (
            <div className="career-intel__placeholder">
              <FaFileAlt size={22} />
              <p>Run an ATS analysis to see your score</p>
              <Link to="/analysis">Go to ATS Analysis →</Link>
            </div>
          )}
        </Card>

        <Card className="career-intel__completion-card">
          <h4>Profile Completion</h4>
          <ProgressBar value={data.profileCompletion} />
          <h4 style={{ marginTop: 16 }}>Resume Status</h4>
          <span className="career-intel__resume-status">{data.resumeStatus}</span>
        </Card>

        {data.ats && (
          <Card className="career-intel__skills-card">
            <h4>Matching Skills</h4>
            <div className="ats-chip-list">
              {data.ats.matchingSkills.slice(0, 6).map((s) => (
                <span key={s} className="ui-chip ui-chip--match">
                  {s}
                </span>
              ))}
            </div>
            <h4 style={{ marginTop: 14 }}>Missing Skills</h4>
            <div className="ats-chip-list">
              {data.ats.missingSkills.slice(0, 6).map((s) => (
                <span key={s} className="ui-chip ui-chip--missing">
                  {s}
                </span>
              ))}
            </div>
          </Card>
        )}
      </div>

      <div className="career-intel__bottom">
        <Card>
          <div className="career-intel__section-header">
            <h4>
              <FaBriefcase /> Recommended Careers
            </h4>
            <Link to="/career-match">View all</Link>
          </div>
          {data.recommendedCareers.length ? (
            <ul className="career-intel__mini-list">
              {data.recommendedCareers.map((c, i) => (
                <li key={i}>
                  <span>{c.role}</span>
                  <strong>{c.compatibility}%</strong>
                </li>
              ))}
            </ul>
          ) : (
            <p className="career-intel__empty">No recommendations yet.</p>
          )}
        </Card>

        <Card>
          <div className="career-intel__section-header">
            <h4>
              <FaGraduationCap /> Recommended Courses
            </h4>
            <Link to="/roadmap">View all</Link>
          </div>
          {data.recommendedCourses.length ? (
            <ul className="career-intel__mini-list">
              {data.recommendedCourses.map((c, i) => (
                <li key={i}>
                  <span>{c.title}</span>
                  <strong>{c.platform}</strong>
                </li>
              ))}
            </ul>
          ) : (
            <p className="career-intel__empty">No course suggestions yet.</p>
          )}
        </Card>

        <Card>
          <div className="career-intel__section-header">
            <h4>
              <FaBriefcase /> Job Recommendations
            </h4>
            <Link to="/jobs">View all</Link>
          </div>
          {data.recommendedJobs.length ? (
            <ul className="career-intel__mini-list">
              {data.recommendedJobs.map((job, i) => (
                <li key={`${job.externalId || job.title}-${i}`}>
                  <span>{job.title}</span>
                  <strong>{job.matchPercentage ?? 0}%</strong>
                </li>
              ))}
            </ul>
          ) : (
            <p className="career-intel__empty">Search for jobs to see matches here.</p>
          )}
        </Card>

        <Card>
          <div className="career-intel__section-header">
            <h4>
              <FaMagic /> Resume Improvements
            </h4>
            <Link to="/resume-improvement">View all</Link>
          </div>
          {data.resumeImprovement ? (
            <div className="career-intel__improvement-summary">
              <strong>{data.resumeImprovement.tipsCount} suggestions ready</strong>
              <p>{data.resumeImprovement.missingKeywords.length ? `Keywords to add: ${data.resumeImprovement.missingKeywords.join(", ")}` : "Your latest improvement report is ready to review."}</p>
            </div>
          ) : (
            <p className="career-intel__empty">Generate resume suggestions to see them here.</p>
          )}
        </Card>
      </div>
    </div>
  );
}

export default CareerIntelligenceSummary;
