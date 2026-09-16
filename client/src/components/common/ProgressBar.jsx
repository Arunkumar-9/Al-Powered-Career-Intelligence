import "./Common.css";

// value: 0-100. tone auto-derives color unless explicitly passed.
function ProgressBar({ value = 0, label, tone }) {
  const clamped = Math.max(0, Math.min(100, value));
  const derivedTone = tone || (clamped >= 70 ? "" : clamped >= 40 ? "warn" : "danger");
  const fillClass =
    derivedTone === "warn"
      ? "ui-progress-fill--warn"
      : derivedTone === "danger"
      ? "ui-progress-fill--danger"
      : "";

  return (
    <div>
      {label && (
        <div className="ui-progress-label">
          <span>{label}</span>
          <span>{clamped}%</span>
        </div>
      )}
      <div className="ui-progress-track">
        <div className={`ui-progress-fill ${fillClass}`} style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}

export default ProgressBar;
