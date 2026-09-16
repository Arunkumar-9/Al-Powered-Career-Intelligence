import { useState } from "react";
import { toast } from "react-toastify";
import { FaMagic } from "react-icons/fa";
import JDSelector from "../../components/jd/JDSelector";
import BeforeAfter from "../../components/resumeImprovement/BeforeAfter";
import ImprovementSection from "../../components/resumeImprovement/ImprovementSection";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import { generateResumeImprovements } from "../../services/resumeImprovementService";
import "./ResumeImprovement.css";

// Module 6: Resume Improvement. JD is optional here — improvements
// can be generated resume-only, or tailored to a job description
// using the same JDSelector used by Modules 1 & 2.
function ResumeImprovement() {
  const [jdPayload, setJdPayload] = useState({ jdText: "", jdTitle: "" });
  const [useJD, setUseJD] = useState(false);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const payload = useJD ? jdPayload : {};
      const res = await generateResumeImprovements(payload);
      setReport(res.data.report);
      toast.success(res.data.cached ? "Loaded previous suggestions" : "Improvement suggestions ready");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to generate resume improvements");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="resume-improvement-page">
      <div className="resume-improvement-page__header">
        <div>
          <h1>Resume Improvement</h1>
          <p>AI-powered suggestions to strengthen your resume, with before/after rewrites.</p>
        </div>
        <Button icon={<FaMagic />} onClick={handleGenerate} loading={loading}>
          Generate Suggestions
        </Button>
      </div>

      <Card>
        <label className="resume-improvement-page__toggle">
          <input type="checkbox" checked={useJD} onChange={(e) => setUseJD(e.target.checked)} />
          Tailor suggestions to a specific job description
        </label>
      </Card>

      {useJD && <JDSelector onChange={setJdPayload} />}

      {loading && <Loader label="Reviewing your resume for improvements..." />}

      {!loading && !report && (
        <Card>
          <EmptyState
            title="No suggestions yet"
            description="Click Generate Suggestions to get AI-powered resume improvements."
          />
        </Card>
      )}

      {!loading && report && (
        <div className="resume-improvement-page__results">
          <Card>
            <h3>Summary</h3>
            <BeforeAfter before={report.summary.before} after={report.summary.after} />
          </Card>

          {report.missingKeywords?.length > 0 && (
            <Card>
              <h3>Missing Keywords</h3>
              <div className="ats-chip-list">
                {report.missingKeywords.map((k) => (
                  <span key={k} className="ui-chip ui-chip--missing">
                    {k}
                  </span>
                ))}
              </div>
            </Card>
          )}

          {report.projectImprovements?.length > 0 && (
            <Card>
              <h3>Project Improvements</h3>
              {report.projectImprovements.map((p, i) => (
                <BeforeAfter key={i} before={p.before} after={p.after} />
              ))}
            </Card>
          )}

          {report.grammarSuggestions?.length > 0 && (
            <Card>
              <h3>Grammar Suggestions</h3>
              {report.grammarSuggestions.map((g, i) => (
                <BeforeAfter key={i} before={g.before} after={g.after} />
              ))}
            </Card>
          )}

          <div className="resume-improvement-page__grid">
            <ImprovementSection title="Certification Suggestions" items={report.certificationSuggestions} />
            <ImprovementSection title="Technical Skill Improvements" items={report.technicalSkillImprovements} />
            <ImprovementSection title="Formatting Suggestions" items={report.formattingSuggestions} />
            <ImprovementSection title="ATS Optimization Tips" items={report.atsOptimizationTips} />
          </div>
        </div>
      )}
    </div>
  );
}

export default ResumeImprovement;
