import { useRef } from "react";
import { FaCloudUploadAlt } from "react-icons/fa";

function UploadCard({ setSelectedFile }) {
  const inputRef = useRef();

  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  const handleChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!allowedTypes.includes(file.type)) {
      alert("Only PDF, DOC and DOCX are allowed.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Maximum file size is 5MB.");
      return;
    }

    setSelectedFile(file);
  };

  return (
    <div className="upload-card">
      <FaCloudUploadAlt className="upload-icon" />

      <h2>Upload Resume</h2>

      <p>Supported: PDF, DOC, DOCX</p>

      <button onClick={() => inputRef.current.click()}>
        Choose Resume
      </button>

      <input
        type="file"
        hidden
        ref={inputRef}
        accept=".pdf,.doc,.docx"
        onChange={handleChange}
      />
    </div>
  );
}

export default UploadCard;