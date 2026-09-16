function ProgressCard({ percentage }) {
  return (
    <div className="progress-card">

      <div className="progress-header">
        <h3>📈 Profile Completion</h3>
        <span className="progress-percent">{percentage}%</span>
      </div>

      <div className="progress">
        <div
          className="progress-fill"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>

      <p className="progress-text">
        Complete your profile to unlock AI recommendations.
      </p>

    </div>
  );
}

export default ProgressCard;