// Reusable themed card. Was scaffolded but unused before Milestone 3;
// now shared by every new module so cards look consistent with the
// existing Dashboard/Resume styling.
import "./Common.css";

function Card({ children, className = "", tight = false, ...rest }) {
  return (
    <div className={`ui-card ${tight ? "ui-card--tight" : ""} ${className}`} {...rest}>
      {children}
    </div>
  );
}

export default Card;
