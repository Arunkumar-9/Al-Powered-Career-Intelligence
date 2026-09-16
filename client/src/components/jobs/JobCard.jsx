import { FaMapMarkerAlt, FaBuilding, FaExternalLinkAlt } from "react-icons/fa";
import Card from "../common/Card";
import Button from "../common/Button";
import "./JobCard.css";

function JobCard({ job }) {
  return (
    <Card className="job-card">
      <div className="job-card__top">
        <div>
          <h3>{job.title}</h3>
          <div className="job-card__meta">
            <span>
              <FaBuilding /> {job.company}
            </span>
            <span>
              <FaMapMarkerAlt /> {job.location}
            </span>
          </div>
        </div>
      </div>

      {job.requiredSkills?.length > 0 && (
        <div className="ats-chip-list job-card__skills">
          {job.requiredSkills.slice(0, 6).map((s) => (
            <span key={s} className="ui-chip ui-chip--neutral">
              {s}
            </span>
          ))}
        </div>
      )}

      <div className="job-card__footer">
        <span className="job-card__type">{job.contractType}</span>
        <a href={job.applyUrl} target="_blank" rel="noopener noreferrer">
          <Button size="sm" icon={<FaExternalLinkAlt />}>
            Apply
          </Button>
        </a>
      </div>
    </Card>
  );
}

export default JobCard;
