import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FaSync } from "react-icons/fa";
import JDSelector from "../../components/jd/JDSelector";
import SkillGapBoard from "../../components/skillgap/SkillGapBoard";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import { analyzeResumeAgainstJD, getLatestAnalysis } from "../../services/atsService";
import "./SkillGap.css";

// Module 2: Skill Gap Analysis. Reuses the exact same AI comparison
// as Module 1 (one combined ATS + Skill Gap AnalysisReport) so
// analyzing here or on the ATS Analysis page keeps both pages in
// sync and avoids duplicate AI calls.
function SkillGap() {
  const [jdPayload, setJdPayload] = useState({ jdText: "", jdTitle: "" });
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await getLatestAnalysis();
        setReport(res.data);
      } catch {
        // no previous analysis yet — that's fine
      } finally {
        setInitializing(false);
      }
    })();
  }, []);

  const handleAnalyze = async () => {
    const hasJdText = jdPayload.jdText && jdPayload.jdText.trim().length > 0;
    const hasJdId = Boolean(jdPayload.jobDescriptionId);

    if (!hasJdText && !hasJdId) {
      toast.error("Paste a job description or select a saved one first");
      return;
    }

    setLoading(true);
    try {
      const res = await analyzeResumeAgainstJD(jdPayload);
      setReport(res.data.report);
      toast.success(res.data.cached ? "Loaded previous analysis" : "Skill gap analysis ready");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to analyze skill gap");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="skillgap-page">
      <div className="skillgap-page__header">
        <div>
          <h1>Skill Gap Analysis</h1>
          <p>See exactly which skills from the job description you already have — and which to learn next.</p>
        </div>
        <Button icon={<FaSync />} onClick={handleAnalyze} loading={loading}>
          Run Analysis
        </Button>
      </div>

      <JDSelector onChange={setJdPayload} />

      <div className="skillgap-page__results">
        {(loading || initializing) && <Loader label="Comparing skills against the job description..." />}

        {!loading && !initializing && !report && (
          <Card>
            <EmptyState
              title="No skill gap analysis yet"
              description="Paste or select a job description above, then click Run Analysis."
            />
          </Card>
        )}

        {!loading && !initializing && report && <SkillGapBoard report={report} />}
      </div>
    </div>
  );
}

export default SkillGap;
