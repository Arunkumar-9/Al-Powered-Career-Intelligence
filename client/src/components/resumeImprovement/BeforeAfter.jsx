import "./BeforeAfter.css";

function BeforeAfter({ before, after }) {
  return (
    <div className="before-after">
      <div className="before-after__col before-after__col--before">
        <span className="before-after__label">Before</span>
        <p>{before}</p>
      </div>
      <div className="before-after__col before-after__col--after">
        <span className="before-after__label">After</span>
        <p>{after}</p>
      </div>
    </div>
  );
}

export default BeforeAfter;
