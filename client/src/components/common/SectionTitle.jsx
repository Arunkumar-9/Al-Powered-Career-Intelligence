import "./Common.css";

function SectionTitle({ title, subtitle, action }) {
  return (
    <div className="ui-section-title">
      <div>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export default SectionTitle;
