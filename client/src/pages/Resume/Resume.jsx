import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import ResumeHeader from "../../components/resume/ResumeHeader";
import ResumeOverview from "../../components/resume/ResumeOverview";
import ResumeActions from "../../components/resume/ResumeActions";
import ResumeAnalysis from "../../components/resume/ResumeAnalysis";
import UploadCard from "../../components/resume/UploadCard";
import ResumeHistorySection from "../../components/resume/ResumeHistorySection";

import {
  uploadResume,
  getResume,
  deleteResume,
  notifyResumeUploaded,
} from "../../services/resumeService";
import { API_ORIGIN } from "../../services/apiConfig";

import "./Resume.css";

function Resume() {
  const [resume, setResume] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchResume();
  }, []);

  const fetchResume = async () => {
    try {
      const res = await getResume();
      setResume(res.data);
    } catch {
      console.log("No resume found.");
      setResume(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a resume.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("resume", selectedFile);

      const res = await uploadResume(formData);

      toast.success(res.data.message);

      setSelectedFile(null);

      fetchResume();

      // Resume History feature: let the embedded history section know
      // a new version was just uploaded so it refreshes automatically.
      notifyResumeUploaded();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Upload failed."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReplace = () => {
    fileInputRef.current.click();
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete your resume?")) return;

    try {
      await deleteResume();

      toast.success("Resume deleted successfully.");

      // Resume History: deleting the active resume may promote an
      // older version to active on the backend, so re-fetch instead
      // of assuming nothing is left.
      fetchResume();
    } catch {
      toast.error("Delete failed.");
    }
  };

  const handleView = () => {
    if (!resume) return;

    window.open(
      `${API_ORIGIN}/${resume.filePath}`,
      "_blank"
    );
  };

  const handleDownload = () => {
    if (!resume) return;

    const link = document.createElement("a");

    link.href = `${API_ORIGIN}/${resume.filePath}`;

    link.download = resume.originalName;

    link.click();
  };

  // Bug 3 fix: this used to just show a "coming soon" toast and never
  // called any API. The actual ATS/AI analysis flow (job description
  // selection -> Gemini comparison -> ATS score/strengths/weaknesses)
  // already exists and works on the /analysis page (AIAnalysis.jsx +
  // atsService.js). The analysis needs a job description to compare
  // against, which this page has no UI for, so rather than duplicating
  // that logic here we route the user to the existing analysis flow,
  // exactly matching the intended Upload -> Analyze -> Analysis page
  // workflow.
  const handleAnalyze = () => {
    if (!resume) {
      toast.error("Please upload a resume first.");
      return;
    }

    navigate("/analysis");
  };

  return (
    <div className="resume-page">
      <ResumeHeader />

      {!resume ? (
        <>
          <UploadCard
            setSelectedFile={setSelectedFile}
          />

          {selectedFile && (
            <div className="upload-section">

              <div className="selected-file">

                <h3>Selected Resume</h3>

                <p>{selectedFile.name}</p>

                <small>
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </small>

              </div>

              <button
                className="upload-btn"
                onClick={handleUpload}
                disabled={loading}
              >
                {loading
                  ? "Uploading..."
                  : "Upload Resume"}
              </button>

            </div>
          )}
        </>
      ) : (
        <>
          <ResumeOverview resume={resume} />

          <ResumeActions
            onView={handleView}
            onDownload={handleDownload}
            onAnalyze={handleAnalyze}
            onReplace={handleReplace}
            onDelete={handleDelete}
          />

          <ResumeAnalysis
            analyzed={
              resume.analysisStatus === "Completed"
            }
          />
        </>
      )}

      <ResumeHistorySection onActiveChange={fetchResume} />

      <input
        type="file"
        hidden
        ref={fileInputRef}
        accept=".pdf,.doc,.docx"
        onChange={(e) => {
          const file = e.target.files[0];

          if (!file) return;

          setSelectedFile(file);

          handleUpload();
        }}
      />
    </div>
  );
}

export default Resume;
