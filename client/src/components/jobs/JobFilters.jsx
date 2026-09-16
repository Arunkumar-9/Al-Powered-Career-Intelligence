import Input from "../common/Input";
import Button from "../common/Button";
import { FaSearch } from "react-icons/fa";
import "./JobFilters.css";

function JobFilters({ filters, onChange, onSearch, loading }) {
  const update = (key) => (e) => onChange({ ...filters, [key]: e.target.value });

  return (
    <div className="job-filters">
      <Input
        placeholder="Role / keywords (e.g. React Developer)"
        value={filters.query}
        onChange={update("query")}
      />
      <Input
        placeholder="Location"
        value={filters.location}
        onChange={update("location")}
      />
      <Input as="select" value={filters.jobType} onChange={update("jobType")}>
        <option value="">All Job Types</option>
        <option value="full_time">Full-time</option>
        <option value="part_time">Part-time</option>
        <option value="contract">Contract</option>
      </Input>
      <Input as="select" value={filters.sortBy} onChange={update("sortBy")}>
        <option value="relevance">Sort: Best Match</option>
        <option value="date">Sort: Most Recent</option>
        <option value="salary">Sort: Salary</option>
      </Input>
      <Button icon={<FaSearch />} onClick={onSearch} loading={loading}>
        Search
      </Button>
    </div>
  );
}

export default JobFilters;
