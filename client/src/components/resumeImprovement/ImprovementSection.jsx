import Card from "../common/Card";
import "./ImprovementSection.css";

function ImprovementSection({ title, items }) {
  if (!items?.length) return null;

  return (
    <Card className="improvement-section">
      <h3>{title}</h3>
      <ul>
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </Card>
  );
}

export default ImprovementSection;
