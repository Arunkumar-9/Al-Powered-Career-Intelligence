import {
  FaFilePdf,
  FaCalendarAlt,
  FaDatabase,
  FaRobot,
} from "react-icons/fa";

const getFileType = (type) => {
  switch (type) {
    case "application/pdf":
      return "PDF";

    case "application/msword":
      return "DOC";

    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return "DOCX";

    default:
      return "Unknown";
  }
};

function ResumeOverview({ resume }) {
  return (
    <div className="overview-grid">

      <div className="overview-card">

        <FaFilePdf className="overview-icon"/>

        <h4>Format</h4>

        <p>{getFileType(resume?.fileType) || "PDF"}</p>

      </div>

      <div className="overview-card">

        <FaDatabase className="overview-icon"/>

        <h4>Size</h4>

        <p>

          {resume
            ? `${(resume.fileSize / 1024).toFixed(1)} KB`
            : "--"}

        </p>

      </div>

      <div className="overview-card">

        <FaCalendarAlt className="overview-icon"/>

        <h4>Uploaded</h4>

        <p>

          {resume
            ? new Date(
                resume.createdAt
              ).toLocaleDateString()
            : "--"}

        </p>

      </div>

      <div className="overview-card">

        <FaRobot className="overview-icon"/>

        <h4>Status</h4>

        <span className="status pending">

          {resume?.analysisStatus || "Pending"}

        </span>

      </div>

    </div>
  );
}

export default ResumeOverview;