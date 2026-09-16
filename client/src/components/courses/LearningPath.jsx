import Card from "../common/Card";
import "./LearningPath.css";

function LearningPath({ steps }) {
  if (!steps?.length) return null;

  return (
    <Card>
      <h3>Suggested Learning Path</h3>
      <div className="learning-path">
        {steps
          .slice()
          .sort((a, b) => a.step - b.step)
          .map((s) => (
            <div className="learning-path__step" key={s.step}>
              <div className="learning-path__badge">{s.step}</div>
              <div>
                <strong>{s.skill}</strong>
                <p>{s.description}</p>
              </div>
            </div>
          ))}
      </div>
    </Card>
  );
}

export default LearningPath;
