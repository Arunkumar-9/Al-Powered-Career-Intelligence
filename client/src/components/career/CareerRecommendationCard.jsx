import { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import Card from "../common/Card";
import ProgressBar from "../common/ProgressBar";
import "./CareerRecommendationCard.css";

function CareerRecommendationCard({ item }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="career-card">
      <div className="career-card__header" onClick={() => setExpanded(!expanded)}>
        <div>
          <h3>{item.role}</h3>
          <ProgressBar value={item.compatibility} label="Compatibility" />
        </div>
        <button className="career-card__toggle" type="button">
          {expanded ? <FaChevronUp /> : <FaChevronDown />}
        </button>
      </div>

      {expanded && (
        <div className="career-card__body">
          <p className="career-card__reason">{item.reason}</p>

          {item.requiredSkills?.length > 0 && (
            <div className="career-card__section">
              <h4>Required Skills</h4>
              <div className="ats-chip-list">
                {item.requiredSkills.map((s) => (
                  <span key={s} className="ui-chip ui-chip--neutral">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {item.roadmap?.length > 0 && (
            <div className="career-card__section">
              <h4>Career Roadmap</h4>
              <ol className="career-card__roadmap">
                {item.roadmap.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

export default CareerRecommendationCard;
