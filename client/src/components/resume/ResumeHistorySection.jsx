import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  FaSearch,
  FaEye,
  FaDownload,
  FaTrash,
  FaFileAlt,
  FaHistory,
  FaCheckCircle,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

import Card from "../common/Card";
import Button from "../common/Button";
import Input from "../common/Input";
import Loader from "../common/Loader";
import EmptyState from "../common/EmptyState";

import {
  getResumeHistory,
  viewResumeVersion,
  downloadResumeVersion,
  deleteResumeVersion,
  activateResumeVersion,
  RESUME_UPLOADED_EVENT,
} from "../../services/resumeService";

import "./ResumeHistorySection.css";

const PAGE_SIZE = 5;

const formatFileSize = (bytes) => {
  if (bytes === undefined || bytes === null) return "--";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (value) => {
  if (!value) return "--";
  return new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const scoreTone = (score) => {
  if (score === null || score === undefined) return "rh-score--neutral";
  if (score >= 70) return "rh-score--good";
  if (score >= 40) return "rh-score--warn";
  return "rh-score--poor";
};

// Resume History section, embedded directly into the Resume page.
// Lists every version the user has ever uploaded (each upload creates
// a new version instead of overwriting the previous one — see
// server/controllers/resumeController.js) and lets the user pick any
// version as the "active" one used for ATS analysis, job
// applications, and profile usage everywhere else in the app.
//
// `onActiveChange` is called after upload / delete / set-active so the
// parent Resume page can refresh the main resume overview shown above
// this section.
function ResumeHistorySection({ onActiveChange }) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [busyAction, setBusyAction] = useState(null);

  const searchDebounceRef = useRef(null);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getResumeHistory({
        search,
        sort,
        page,
        limit: PAGE_SIZE,
      });

      setItems(res.data.items || []);
      setTotalPages(res.data.totalPages || 1);
      setTotal(res.data.total || 0);
    } catch (err) {
      setItems([]);
      setError(
        err.response?.data?.message || "Failed to load resume history. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [search, sort, page]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Refresh automatically after every successful upload from the
  // upload card above this section (same page, no navigation needed).
  useEffect(() => {
    const handleUploaded = () => {
      setPage(1);
      loadHistory();
    };

    window.addEventListener(RESUME_UPLOADED_EVENT, handleUploaded);
    return () => window.removeEventListener(RESUME_UPLOADED_EVENT, handleUploaded);
  }, [loadHistory]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);

    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setPage(1);
      setSearch(value.trim());
    }, 400);
  };

  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, []);

  const handleSortChange = (e) => {
    setSort(e.target.value);
    setPage(1);
  };

  const handleView = async (item) => {
    try {
      await viewResumeVersion(item._id);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to open resume");
    }
  };

  const handleDownload = async (item) => {
    try {
      await downloadResumeVersion(item._id, item.fileName);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to download resume");
    }
  };

  const handleSetActive = async (item) => {
    if (item.isActive) return;

    setBusyId(item._id);
    setBusyAction("activate");
    try {
      const res = await activateResumeVersion(item._id);
      toast.success(res.data.message || "Active resume updated.");
      await loadHistory();
      onActiveChange?.();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to set active resume");
    } finally {
      setBusyId(null);
      setBusyAction(null);
    }
  };

  const handleDelete = async (item) => {
    const confirmed = window.confirm(
      `Delete "${item.fileName}" (version ${item.version})? This cannot be undone.`
    );
    if (!confirmed) return;

    setBusyId(item._id);
    setBusyAction("delete");
    try {
      await deleteResumeVersion(item._id);
      toast.success("Resume version deleted successfully.");

      if (items.length === 1 && page > 1) {
        setPage((p) => p - 1);
      } else {
        await loadHistory();
      }

      // Deleting the active version promotes another one on the
      // backend, so refresh the main overview too.
      if (item.isActive) onActiveChange?.();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete resume");
    } finally {
      setBusyId(null);
      setBusyAction(null);
    }
  };

  const hasActiveSearch = search.trim().length > 0;

  return (
    <Card className="resume-history-section">
      <div className="resume-history-section__header">
        <h2>
          <FaHistory /> Resume History
        </h2>
        <p>Every version you've uploaded — pick any one to make it your active resume.</p>
      </div>

      <div className="resume-history-section__toolbar">
        <div className="resume-history-section__search">
          <FaSearch className="resume-history-section__search-icon" />
          <Input
            placeholder="Search by file name..."
            value={searchInput}
            onChange={handleSearchChange}
          />
        </div>

        <Input as="select" value={sort} onChange={handleSortChange}>
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="version">Version (highest first)</option>
        </Input>
      </div>

      {loading && <Loader label="Loading resume history..." />}

      {!loading && error && (
        <div>
          <div className="ui-error-state">{error}</div>
          <div style={{ marginTop: 14 }}>
            <Button variant="outline" size="sm" onClick={loadHistory}>
              Try again
            </Button>
          </div>
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <EmptyState
          title={hasActiveSearch ? "No matching resumes" : "No previous versions yet"}
          description={
            hasActiveSearch
              ? `Nothing matches "${search}". Try a different search.`
              : "Every resume you upload will appear here as its own version."
          }
        />
      )}

      {!loading && !error && items.length > 0 && (
        <>
          <div className="resume-history-section__list">
            {items.map((item) => (
              <div
                key={item._id}
                className={`resume-history-row ${item.isActive ? "resume-history-row--active" : ""}`}
              >
                <div className="resume-history-row__main">
                  <div className="resume-history-row__icon">
                    <FaFileAlt />
                  </div>

                  <div className="resume-history-row__info">
                    <div className="resume-history-row__title-row">
                      <h4>{item.fileName}</h4>
                      {item.isActive && (
                        <span className="rh-badge rh-badge--active">
                          <FaCheckCircle /> Active
                        </span>
                      )}
                    </div>
                    <div className="resume-history-row__meta">
                      <span>Uploaded {formatDate(item.uploadDate)}</span>
                      <span>•</span>
                      <span>Version {item.version}</span>
                      <span>•</span>
                      <span>{formatFileSize(item.fileSize)}</span>
                    </div>
                  </div>
                </div>

                <div className="resume-history-row__side">
                  <div className={`rh-score ${scoreTone(item.atsScore)}`}>
                    {item.atsScore !== null && item.atsScore !== undefined
                      ? `ATS ${item.atsScore}`
                      : "Not analyzed"}
                  </div>

                  <div className="resume-history-row__actions">
                    {!item.isActive && (
                      <Button
                        variant="primary"
                        size="sm"
                        loading={busyId === item._id && busyAction === "activate"}
                        onClick={() => handleSetActive(item)}
                      >
                        Set as Active
                      </Button>
                    )}

                    <Button variant="outline" size="sm" icon={<FaEye />} onClick={() => handleView(item)}>
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<FaDownload />}
                      onClick={() => handleDownload(item)}
                    >
                      Download
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<FaTrash />}
                      className="resume-history-row__delete"
                      loading={busyId === item._id && busyAction === "delete"}
                      onClick={() => handleDelete(item)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="resume-history-section__pagination">
            <span>
              Page {page} of {totalPages} · {total} version{total === 1 ? "" : "s"}
            </span>
            <div className="resume-history-section__pagination-controls">
              <Button
                variant="outline"
                size="sm"
                icon={<FaChevronLeft />}
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
              >
                Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              >
                Next
                <FaChevronRight />
              </Button>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}

export default ResumeHistorySection;
