import "./Common.css";
import Button from "./Button";

function EmptyState({ title, description, actionLabel, onAction }) {
  return (
    <div className="ui-empty-state">
      <h3 style={{ color: "#1e293b", marginBottom: 6 }}>{title}</h3>
      <p style={{ marginBottom: actionLabel ? 16 : 0 }}>{description}</p>
      {actionLabel && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
