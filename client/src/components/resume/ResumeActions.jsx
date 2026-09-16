import {
  FaEye,
  FaDownload,
  FaRobot,
  FaSyncAlt,
  FaTrash,
} from "react-icons/fa";

function ResumeActions({
  onView,
  onDownload,
  onAnalyze,
  onReplace,
  onDelete,
}) {
  return (
    <div className="actions-grid">

      <button onClick={onView}>
        <FaEye />
        <span>View</span>
      </button>

      <button onClick={onDownload}>
        <FaDownload />
        Download
      </button>

      <button onClick={onAnalyze}>
        <FaRobot />
        Analyze
      </button>

      <button onClick={onReplace}>
        <FaSyncAlt />
        Replace
      </button>

      <button
        className="danger"
        onClick={onDelete}
      >
        <FaTrash />
        Delete
      </button>

    </div>
  );
}

export default ResumeActions;