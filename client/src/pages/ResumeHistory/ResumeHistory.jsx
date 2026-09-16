import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  FaSearch,
  FaEye,
  FaDownload,
  FaTrash,
  FaFileAlt,
  FaHistory,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";

import {
  getResumeHistory,
  viewResumeVersion,
  downloadResumeVersion,
  deleteResumeVersion,
  RESUME_UPLOADED_EVENT,
} from "../../services/resumeService";

import "./ResumeHistory.css";

const PAGE_SIZE = 8;

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
  if (score === null || score === undefined) return "score-chip--neutral";
  if (score >= 70) return "score-chip--good";
  if (score >= 40) return "score-chip--warn";
  return "score-chip--poor";
};

// Module: Resume History. Lists every resume version the user has
// ever uploaded (each upload now creates a new version instead of
// overwriting the previous one — see server/controllers/resumeController.js).
// Does not touch the existing Resume page, its upload flow, or any
// other module; it only reads from the new /api/resume/history* routes.
function ResumeHistory() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

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

  // Automatically refresh after every successful upload, even if the
  // upload happened while this page was already open.
  useEffect(() => {
    const handleUploaded = () => {
      setPage(1);
      loadHistory();
    };

    window.addEventListener(RESUME_UPLOADED_EVENT, handleUploaded);
    return () => window.removeEventListener(RESUME_UPLOADED_EVENT, handleUploaded);
  }, [loadHistory]);

  // Debounce the search box so we don't fire a request per keystroke.
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

  const handleDelete = async (item) => {
    const confirmed = window.confirm(
      `Delete "${item.fileName}" (version ${item.version})? This cannot be undone.`
    );
    if (!confirmed) return;

    setDeletingId(item._id);
    try {
      await deleteResumeVersion(item._id);
      toast.success("Resume version deleted successfully.");

      // If we just deleted the last item on this page (and it's not
      // page 1), step back a page instead of showing an empty page.
      if (items.length === 1 && page > 1) {
        setPage((p) => p - 1);
      } else {
        loadHistory();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete resume");
    } finally {
      setDeletingId(null);
    }
  };

  const hasActiveSearch = search.trim().length > 0;

  return (
    <div className="resume-history-page">
      <div className="resume-history-page__header">
        <div>
          <h1>
            <FaHistory /> Resume History
          </h1>
          <p>Every resume you've uploaded, kept as its own version — nothing is ever overwritten.</p>
        </div>
      </div>

      <Card className="resume-history-toolbar">
        <div className="resume-history-toolbar__search">
          <FaSearch className="resume-history-toolbar__search-icon" />
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
      </Card>

      {loading && (
        <Card>
          <Loader label="Loading resume history..." />
        </Card>
      )}

      {!loading && error && (
        <Card>
          <div className="ui-error-state">{error}</div>
          <div style={{ marginTop: 14 }}>
            <Button variant="outline" size="sm" onClick={loadHistory}>
              Try again
            </Button>
          </div>
        </Card>
      )}

      {!loading && !error && items.length === 0 && (
        <Card>
          <EmptyState
            title={hasActiveSearch ? "No matching resumes" : "No resumes uploaded yet"}
            description={
              hasActiveSearch
                ? `Nothing matches "${search}". Try a different search.`
                : "Upload a resume from the Resume page to start building your history."
            }
          />
        </Card>
      )}

      {!loading && !error && items.length > 0 && (
        <>
          <div className="resume-history-list">
            {items.map((item) => (
              <Card key={item._id} className="resume-history-item">
                <div className="resume-history-item__main">
                  <div className="resume-history-item__icon">
                    <FaFileAlt />
                  </div>

                  <div className="resume-history-item__info">
                    <div className="resume-history-item__title-row">
                      <h4>{item.fileName}</h4>
                      {item.isLatest && <span className="ui-chip ui-chip--neutral">Current</span>}
                    </div>
                    <div className="resume-history-item__meta">
                      <span>Uploaded {formatDate(item.uploadDate)}</span>
                      <span>•</span>
                      <span>Version {item.version}</span>
                      <span>•</span>
                      <span>{formatFileSize(item.fileSize)}</span>
                    </div>
                  </div>
                </div>

                <div className="resume-history-item__side">
                  <div className={`score-chip ${scoreTone(item.atsScore)}`}>
                    {item.atsScore !== null && item.atsScore !== undefined
                      ? `ATS ${item.atsScore}`
                      : "Not analyzed"}
                  </div>

                  <div className="resume-history-item__actions">
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
                      className="resume-history-item__delete"
                      loading={deletingId === item._id}
                      onClick={() => handleDelete(item)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="resume-history-pagination">
            <span>
              Page {page} of {totalPages} · {total} total
            </span>
            <div className="resume-history-pagination__controls">
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
    </div>
  );
}

export default ResumeHistory;
