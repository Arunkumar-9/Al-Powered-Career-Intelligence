import { normalizeSkillList } from "../utils/skillSynonyms.js";
import { buildJobSkillMatch } from "../utils/atsMatcher.js";

// ============================================================
// Module 4: Job Recommendation
// Integrates the Adzuna job search API (https://developer.adzuna.com/).
// Requires ADZUNA_APP_ID and ADZUNA_APP_KEY in server/.env.
// Falls back to a clear error payload (handled by the controller) if
// credentials are not configured, rather than crashing the server.
// ============================================================

const ADZUNA_COUNTRY = process.env.ADZUNA_COUNTRY || "in";
const ADZUNA_BASE_URL = `https://api.adzuna.com/v1/api/jobs/${ADZUNA_COUNTRY}/search`;

// The .env template ships with literal placeholder values so the app
// boots without crashing. Treat those the same as "not set" so we
// show the actionable "not configured" message instead of silently
// calling Adzuna with fake credentials and getting a confusing 401.
const PLACEHOLDER_VALUES = new Set([
  "your_adzuna_app_id",
  "your_adzuna_app_key",
  "",
]);

export const isAdzunaConfigured = () => {
  const id = process.env.ADZUNA_APP_ID;
  const key = process.env.ADZUNA_APP_KEY;

  return Boolean(
    id &&
      key &&
      !PLACEHOLDER_VALUES.has(id.trim()) &&
      !PLACEHOLDER_VALUES.has(key.trim())
  );
};

/**
 * Search jobs via Adzuna and rank them by skill match against the
 * candidate's skills.
 *
 * @param {Object} params
 * @param {string[]} params.skills
 * @param {string} params.location
 * @param {string} params.jobType - full_time | part_time | contract | internship
 * @param {string} params.query - free text search (role/title)
 * @param {string} params.sortBy - relevance | date | salary
 * @param {number} params.page
 */
export const searchJobs = async ({
  skills = [],
  location = "",
  jobType = "",
  query = "",
  sortBy = "relevance",
  page = 1,
}) => {
  if (!isAdzunaConfigured()) {
    const err = new Error(
      "Job Recommendation is not configured. Set ADZUNA_APP_ID and ADZUNA_APP_KEY in server/.env."
    );
    err.code = "ADZUNA_NOT_CONFIGURED";
    throw err;
  }

  const searchTerms = query || skills.slice(0, 5).join(" ") || "developer";

  const url = new URL(`${ADZUNA_BASE_URL}/${page}`);
  url.searchParams.set("app_id", process.env.ADZUNA_APP_ID);
  url.searchParams.set("app_key", process.env.ADZUNA_APP_KEY);
  url.searchParams.set("what", searchTerms);
  url.searchParams.set("results_per_page", "20");
  url.searchParams.set("content-type", "application/json");

  if (location) url.searchParams.set("where", location);

  if (jobType === "full_time") url.searchParams.set("full_time", "1");
  if (jobType === "part_time") url.searchParams.set("part_time", "1");
  if (jobType === "contract") url.searchParams.set("contract", "1");

  if (sortBy === "date") url.searchParams.set("sort_by", "date");
  if (sortBy === "salary") url.searchParams.set("sort_by", "salary");

  const response = await fetch(url.toString());

  if (!response.ok) {
    // Surface *why* Adzuna rejected the request instead of a generic
    // 500 — this is what you'd hit if the credentials are present but
    // invalid/revoked, or the free-tier rate limit was exceeded.
    let detail = "";
    try {
      const body = await response.json();
      detail = body?.exception || body?.error || body?.display || "";
    } catch {
      // Adzuna didn't return JSON (e.g. plain text/HTML error page) — ignore.
    }

    const err = new Error(
      response.status === 401 || response.status === 403
        ? `Adzuna rejected the request (invalid or expired API credentials).${
            detail ? ` ${detail}` : ""
          }`
        : `Failed to fetch jobs from Adzuna (status ${response.status}).${
            detail ? ` ${detail}` : ""
          }`
    );
    err.code = "ADZUNA_REQUEST_FAILED";
    err.status = response.status;
    throw err;
  }

  const data = await response.json();
  const results = data.results || [];

  const jobs = results.map((job) => {
    const jobText = `${job.title || ""} ${job.description || ""}`;
    const match = buildJobSkillMatch(jobText, skills);
    return {
      id: job.id,
      title: job.title,
      company: job.company?.display_name || "Unknown Company",
      location: job.location?.display_name || "Not specified",
      description: job.description,
      requiredSkills: match.requiredSkills.length ? match.requiredSkills : extractLikelySkillsFromText(job.description || ""),
      matchPercentage: match.matchPercentage,
      matchingSkills: match.matchingSkills,
      matchAvailable: match.hasRequirements,
      salaryMin: job.salary_min || null,
      salaryMax: job.salary_max || null,
      applyUrl: job.redirect_url,
      postedAt: job.created,
      contractType: job.contract_time || job.contract_type || "Not specified",
    };
  });

  // Rank by match % (relevance mode); Adzuna already sorts for date/salary.
  if (sortBy === "relevance") {
    jobs.sort((a, b) => b.matchPercentage - a.matchPercentage);
  }

  return {
    count: data.count || jobs.length,
    page,
    jobs,
  };
};

// A provider-independent result set for development and provider outages.
// It lets users explore suitable role directions without fabricating a live
// vacancy or application link.
export const buildLocalJobSuggestions = ({ skills = [], location = "", query = "", jobType = "" }) => {
  const title = query.trim() || (skills[0] ? `${skills[0]} Developer` : "Software Developer");
  const normalizedSkills = normalizeSkillList(skills);
  const common = ["JavaScript", "React", "Node.js", "Python", "SQL", "Git"];
  const requiredSkills = [...new Set([...skills, ...common])].slice(0, 6);
  const roles = [title, "Junior Software Developer", "Full Stack Developer", "Software Engineer Intern"];
  return {
    count: roles.length,
    page: 1,
    source: "local-suggestions",
    jobs: roles.map((role, index) => ({
      id: `local-${index}-${role.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      title: role,
      company: "Career Guidance Match",
      location: location || "Location flexible",
      description: `Suggested ${role} direction based on your profile. Use this as a search target when browsing live vacancies.`,
      requiredSkills,
      matchPercentage: Math.max(35, Math.min(95, 50 + normalizedSkills.length * 7 - index * 5)),
      salaryMin: null,
      salaryMax: null,
      applyUrl: "",
      postedAt: null,
      contractType: jobType || "Not specified",
    })),
  };
};

// Lightweight keyword scan against the known skill/synonym dictionary
// to surface "required skills" chips on a job card without another
// AI call per job.
const COMMON_TECH_KEYWORDS = [
  "javascript", "typescript", "react", "node", "express", "mongodb",
  "sql", "python", "java", "c++", "aws", "azure", "gcp", "docker",
  "kubernetes", "git", "html", "css", "django", "flask", "spring",
  "machine learning", "ai", "nlp", "data analysis", "tensorflow",
  "pytorch", "devops", "ci/cd", "linux", "rest api", "graphql",
  "next.js", "vue", "angular", "cyber security", "cloud",
];

const extractLikelySkillsFromText = (text) => {
  const lower = text.toLowerCase();
  return COMMON_TECH_KEYWORDS.filter((kw) => lower.includes(kw)).slice(0, 10);
};

export default { searchJobs, isAdzunaConfigured };
