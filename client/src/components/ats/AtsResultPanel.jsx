import Card from "../common/Card";
import ScoreRing from "../common/ScoreRing";
import "./AtsResultPanel.css";

// Renders Module 1 (ATS) dashboard cards + keyword/strength breakdown
// for a given AnalysisReport document.
function AtsResultPanel({ report }) {
  if (!report) return null;

  const statusToneClass =
    report.overallStatus === "Excellent Match"
      ? "ats-status--excellent"
      : report.overallStatus === "Good Match"
      ? "ats-status--good"
      : report.overallStatus === "Average Match"
      ? "ats-status--average"
      : "ats-status--poor";

  return (
    <div className="ats-panel">
      <div className="ats-panel__cards">
        <Card className="ats-card">
          <ScoreRing value={report.atsScore} label="ATS Score" />
        </Card>

        <Card className="ats-card">
          <ScoreRing value={report.matchPercentage} label="Requirement Match" />
        </Card>

        <Card className="ats-card">
          <ScoreRing value={report.keywordMatchPercentage} label="Required Keywords" />
        </Card>

        <Card className="ats-card ats-card--status">
          <span className={`ats-status-badge ${statusToneClass}`}>{report.overallStatus}</span>
          <p>Overall Status</p>
        </Card>
      </div>

      <div className="ats-panel__grid">
        <Card>
          <h3>Matching Keywords</h3>
          <div className="ats-chip-list">
            {report.matchingKeywords.length ? (
              report.matchingKeywords.map((kw) => (
                <span key={kw} className="ui-chip ui-chip--match">
                  {kw}
                </span>
              ))
            ) : (
              <p className="ats-empty">No matching keywords found.</p>
            )}
          </div>
        </Card>

        <Card>
          <h3>Missing Keywords</h3>
          <div className="ats-chip-list">
            {report.missingKeywords.length ? (
              report.missingKeywords.map((kw) => (
                <span key={kw} className="ui-chip ui-chip--missing">
                  {kw}
                </span>
              ))
            ) : (
              <p className="ats-empty">No missing keywords 🎉</p>
            )}
          </div>
        </Card>

        {report.importantMissingTechnologies?.length > 0 && (
          <Card className="ats-panel__full">
            <h3>Important Missing Technologies</h3>
            <div className="ats-chip-list">
              {report.importantMissingTechnologies.map((t) => (
                <span key={t} className="ui-chip" style={{ background: "#fff7ed", color: "#c2410c" }}>
                  {t}
                </span>
              ))}
            </div>
          </Card>
        )}

        <Card>
          <h3>Resume Strengths</h3>
          <ul className="ats-list ats-list--positive">
            {report.strengths.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </Card>

        <Card>
          <h3>Resume Weaknesses</h3>
          <ul className="ats-list ats-list--negative">
            {report.weaknesses.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

export default AtsResultPanel;
