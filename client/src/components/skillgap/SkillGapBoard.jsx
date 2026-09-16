import Card from "../common/Card";
import ProgressBar from "../common/ProgressBar";
import ScoreRing from "../common/ScoreRing";
import "./SkillGapBoard.css";

// Module 2: Skill Gap Analysis view, driven by the same
// AnalysisReport used by the ATS module (matchingSkills / missingSkills
// / recommendedSkills / skillMatchPercentage).
function SkillGapBoard({ report }) {
  if (!report) return null;

  const totalSkills = report.matchingSkills.length + report.missingSkills.length;

  return (
    <div className="skillgap-board">
      <div className="skillgap-board__top">
        <Card className="skillgap-board__score">
          <ScoreRing value={report.skillMatchPercentage} label="Skill Match" />
        </Card>

        <Card className="skillgap-board__viz">
          <h3>Skill Coverage</h3>
          {totalSkills === 0 ? (
            <p className="skillgap-empty">Run an analysis to see your skill coverage.</p>
          ) : (
            <>
              <ProgressBar
                value={Math.round((report.matchingSkills.length / totalSkills) * 100)}
                label={`Matched (${report.matchingSkills.length}/${totalSkills})`}
              />
              <div style={{ height: 14 }} />
              <ProgressBar
                value={Math.round((report.missingSkills.length / totalSkills) * 100)}
                label={`Missing (${report.missingSkills.length}/${totalSkills})`}
                tone="danger"
              />
            </>
          )}
        </Card>
      </div>

      <div className="skillgap-board__grid">
        <Card>
          <h3>Matching Skills</h3>
          <div className="ats-chip-list">
            {report.matchingSkills.length ? (
              report.matchingSkills.map((s) => (
                <span key={s} className="ui-chip ui-chip--match">
                  {s}
                </span>
              ))
            ) : (
              <p className="skillgap-empty">No matched skills yet.</p>
            )}
          </div>
        </Card>

        <Card>
          <h3>Missing Skills</h3>
          <div className="ats-chip-list">
            {report.missingSkills.length ? (
              report.missingSkills.map((s) => (
                <span key={s} className="ui-chip ui-chip--missing">
                  {s}
                </span>
              ))
            ) : (
              <p className="skillgap-empty">No skill gaps found 🎉</p>
            )}
          </div>
        </Card>

        <Card className="skillgap-board__full">
          <h3>Suggested Technologies to Learn</h3>
          <div className="ats-chip-list">
            {report.recommendedSkills.length ? (
              report.recommendedSkills.map((s) => (
                <span key={s} className="ui-chip ui-chip--neutral">
                  {s}
                </span>
              ))
            ) : (
              <p className="skillgap-empty">No suggestions right now.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default SkillGapBoard;
