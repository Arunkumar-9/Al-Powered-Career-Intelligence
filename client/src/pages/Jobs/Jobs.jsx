import { useState } from "react";
import { toast } from "react-toastify";
import JobCard from "../../components/jobs/JobCard";
import JobFilters from "../../components/jobs/JobFilters";
import Card from "../../components/common/Card";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import { searchJobs } from "../../services/jobService";
import "./Jobs.css";

// Module 4: Job Recommendation. Searches live job listings (Adzuna)
// ranked by match % against the user's skills, with search, filters
// and sorting.
function Jobs() {
  const [filters, setFilters] = useState({
    query: "",
    location: "",
    jobType: "",
    sortBy: "relevance",
  });
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await searchJobs(filters);
      setJobs(res.data.jobs || []);
      setSearched(true);
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to fetch job recommendations";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="jobs-page">
      <div className="jobs-page__header">
        <h1>Job Recommendation</h1>
        <p>Find roles that match your skills, qualifications and experience.</p>
      </div>

      <Card>
        <JobFilters filters={filters} onChange={setFilters} onSearch={handleSearch} loading={loading} />
      </Card>

      {loading && <Loader label="Finding jobs that match your profile..." />}

      {!loading && error && (
        <Card>
          <div className="ui-error-state">{error}</div>
        </Card>
      )}

      {!loading && !error && searched && jobs.length === 0 && (
        <Card>
          <EmptyState title="No jobs found" description="Try a different role, location or filter." />
        </Card>
      )}

      {!loading && !searched && !error && (
        <Card>
          <EmptyState
            title="Search for jobs"
            description="Enter a role or keywords above and click Search to see matching jobs."
          />
        </Card>
      )}

      {!loading && jobs.length > 0 && (
        <div className="jobs-page__grid">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Jobs;
