import "./Common.css";

// Circular score indicator (0-100) used for ATS Score / Match % cards.
function ScoreRing({ value = 0, size = 110, strokeWidth = 10, label }) {
  const clamped = Math.max(0, Math.min(100, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  const color = clamped >= 70 ? "#22c55e" : clamped >= 40 ? "#f59e0b" : "#ef4444";

  return (
    <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={size * 0.24}
          fontWeight="700"
          fill="#1e293b"
        >
          {clamped}
        </text>
      </svg>
      {label && <span style={{ fontSize: "0.82rem", color: "#64748b", fontWeight: 600 }}>{label}</span>}
    </div>
  );
}

export default ScoreRing;
