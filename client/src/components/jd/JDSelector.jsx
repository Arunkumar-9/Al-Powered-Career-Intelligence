import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FaSave, FaTrash } from "react-icons/fa";
import Card from "../common/Card";
import Button from "../common/Button";
import Input from "../common/Input";
import {
  listJobDescriptions,
  addJobDescription,
  deleteJobDescription,
} from "../../services/jdService";
import "./JDSelector.css";

// Reusable Job Description picker used by ATS Analysis, Skill Gap and
// Resume Improvement pages. Supports quick-paste (not saved) as well
// as an optional saved JD library, per the requested "both" behaviour.
function JDSelector({ onChange }) {
  const [savedJDs, setSavedJDs] = useState([]);
  const [mode, setMode] = useState("paste"); // "paste" | "saved"
  const [selectedId, setSelectedId] = useState("");
  const [pastedText, setPastedText] = useState("");
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);

  const loadJDs = async () => {
    try {
      const res = await listJobDescriptions();
      setSavedJDs(res.data);
    } catch {
      // Non-fatal: saved JD library is optional
    }
  };

  useEffect(() => {
    loadJDs();
  }, []);

  useEffect(() => {
    if (mode === "saved" && selectedId) {
      onChange({ jobDescriptionId: selectedId });
    } else if (mode === "paste") {
      onChange({ jdText: pastedText, jdTitle: title || "Pasted Job Description" });
    }
  }, [mode, selectedId, pastedText, title]);

  const handleSave = async () => {
    if (!title.trim() || !pastedText.trim()) {
      toast.error("Add a title and paste the JD text before saving");
      return;
    }
    setLoading(true);
    try {
      await addJobDescription({ title, company, text: pastedText });
      toast.success("Job description saved");
      await loadJDs();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save job description");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteJobDescription(id);
      toast.success("Job description removed");
      if (selectedId === id) setSelectedId("");
      await loadJDs();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete");
    }
  };

  return (
    <Card className="jd-selector">
      <div className="jd-selector__tabs">
        <button
          className={`jd-tab ${mode === "paste" ? "jd-tab--active" : ""}`}
          onClick={() => setMode("paste")}
          type="button"
        >
          Paste JD
        </button>
        <button
          className={`jd-tab ${mode === "saved" ? "jd-tab--active" : ""}`}
          onClick={() => setMode("saved")}
          type="button"
        >
          Saved JDs ({savedJDs.length})
        </button>
      </div>

      {mode === "paste" ? (
        <div className="jd-selector__paste">
          <Input
            placeholder="Job title (e.g. Frontend Developer)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Input
            placeholder="Company (optional)"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            style={{ marginTop: 10 }}
          />
          <Input
            as="textarea"
            placeholder="Paste the full job description here..."
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            style={{ marginTop: 10 }}
          />
          <div className="jd-selector__actions">
            <Button
              variant="outline"
              size="sm"
              icon={<FaSave />}
              loading={loading}
              onClick={handleSave}
              type="button"
            >
              Save for later
            </Button>
          </div>
        </div>
      ) : (
        <div className="jd-selector__saved">
          {savedJDs.length === 0 ? (
            <p className="jd-selector__empty">
              No saved job descriptions yet. Paste one and hit "Save for later".
            </p>
          ) : (
            <div className="jd-selector__list">
              {savedJDs.map((jd) => (
                <div
                  key={jd._id}
                  className={`jd-item ${selectedId === jd._id ? "jd-item--active" : ""}`}
                  onClick={() => setSelectedId(jd._id)}
                >
                  <div>
                    <strong>{jd.title}</strong>
                    {jd.company && <span className="jd-item__company"> · {jd.company}</span>}
                  </div>
                  <button
                    type="button"
                    className="jd-item__delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(jd._id);
                    }}
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

export default JDSelector;
