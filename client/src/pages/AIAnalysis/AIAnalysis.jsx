import { useState } from "react";
import { toast } from "react-toastify";
import { FaSearch } from "react-icons/fa";
import JDSelector from "../../components/jd/JDSelector";
import AtsResultPanel from "../../components/ats/AtsResultPanel";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import { analyzeResumeAgainstJD } from "../../services/atsService";
import "./AIAnalysis.css";

// Module 1: ATS Resume Analysis.
// Compares the user's uploaded resume against a selected/pasted Job
// Description using AI/semantic matching and shows the ATS score,
// match %, keyword match, matching/missing keywords and strengths &
// weaknesses.
function AIAnalysis() {
  const [jdPayload, setJdPayload] = useState({ jdText: "", jdTitle: "" });
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    const hasJdText = jdPayload.jdText && jdPayload.jdText.trim().length > 0;
    const hasJdId = Boolean(jdPayload.jobDescriptionId);

    if (!hasJdText && !hasJdId) {
      toast.error("Paste a job description or select a saved one first");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await analyzeResumeAgainstJD(jdPayload);
      setReport(res.data.report);
      toast.success(res.data.cached ? "Loaded previous analysis" : "Analysis complete");
    } catch (err) {
      const message = err.response?.data?.message || "Failed to analyze resume";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-analysis-page">
      <div className="ai-analysis-header">
        <div>
          <h1>ATS Resume Analysis</h1>
          <p>Compare your resume against a job description to see how it scores.</p>
        </div>
        <Button icon={<FaSearch />} onClick={handleAnalyze} loading={loading}>
          Analyze Resume
        </Button>
      </div>

      <JDSelector onChange={setJdPayload} />

      <div className="ai-analysis-results">
        {loading && <Loader label="Analyzing your resume against the job description..." />}

        {!loading && error && (
          <Card>
            <div className="ui-error-state">{error}</div>
          </Card>
        )}

        {!loading && !error && !report && (
          <Card>
            <EmptyState
              title="No analysis yet"
              description="Paste or select a job description above, then click Analyze Resume."
            />
          </Card>
        )}

        {!loading && report && <AtsResultPanel report={report} />}
      </div>
    </div>
  );
}

export default AIAnalysis;
