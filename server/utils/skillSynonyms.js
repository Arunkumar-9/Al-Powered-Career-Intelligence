// ============================================================
// Skill Synonym Dictionary
// Used to normalize skill/keyword names before comparison so
// that semantically identical skills written differently are
// treated as a match (e.g. "NodeJS" === "Node.js").
// ============================================================

const SYNONYM_GROUPS = [
  ["javascript", "js", "java script"],
  ["typescript", "ts"],
  ["nodejs", "node.js", "node js", "node"],
  ["reactjs", "react.js", "react js", "react"],
  ["nextjs", "next.js", "next js", "next"],
  ["vuejs", "vue.js", "vue js", "vue"],
  ["angularjs", "angular.js", "angular js", "angular"],
  ["expressjs", "express.js", "express js", "express"],
  ["mongodb", "mongo"],
  ["mysql", "my sql"],
  ["postgresql", "postgres", "psql"],
  ["artificial intelligence", "ai"],
  ["machine learning", "ml"],
  ["deep learning", "dl"],
  ["natural language processing", "nlp"],
  ["computer vision", "cv"],
  ["restful api", "rest api", "rest", "restful"],
  ["amazon web services", "aws"],
  ["google cloud platform", "gcp", "google cloud"],
  ["microsoft azure", "azure"],
  ["continuous integration continuous deployment", "ci/cd", "ci cd", "cicd"],
  ["object oriented programming", "oop"],
  ["structured query language", "sql"],
  ["user interface", "ui"],
  ["user experience", "ux"],
  ["application programming interface", "api"],
  ["docker container", "docker"],
  ["kubernetes", "k8s"],
  ["tensorflow", "tf"],
  ["pytorch", "torch"],
  ["scikit-learn", "sklearn", "scikit learn"],
  ["data structures and algorithms", "dsa"],
  ["c plus plus", "c++", "cpp"],
  ["c sharp", "c#", "csharp"],
  ["html5", "html"],
  ["css3", "css"],
  ["version control", "git", "github", "vcs"],
];

// Build a lookup map: variant -> canonical (first item of each group)
const LOOKUP = new Map();
SYNONYM_GROUPS.forEach((group) => {
  const canonical = group[0];
  group.forEach((variant) => LOOKUP.set(variant, canonical));
});

/**
 * Normalize a single skill/keyword string for comparison purposes.
 * Lowercases, trims, strips punctuation noise, and maps known
 * synonyms to a canonical form.
 */
export const normalizeSkill = (raw = "") => {
  const cleaned = String(raw)
    .toLowerCase()
    .trim()
    .replace(/[_]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/[().,]/g, "")
    .trim();

  return LOOKUP.get(cleaned) || cleaned;
};

/**
 * Normalize an array of skills, de-duplicating after normalization.
 */
export const normalizeSkillList = (skills = []) => {
  const seen = new Set();
  const result = [];

  skills.forEach((skill) => {
    if (!skill) return;
    const normalized = normalizeSkill(skill);
    if (normalized && !seen.has(normalized)) {
      seen.add(normalized);
      result.push(normalized);
    }
  });

  return result;
};

/**
 * Compare two skill lists (semantic-aware via synonym normalization)
 * and return matching / missing skills relative to the "required" list.
 */
export const compareSkillLists = (resumeSkills = [], requiredSkills = []) => {
  const normalizedResume = new Set(normalizeSkillList(resumeSkills));
  const normalizedRequired = normalizeSkillList(requiredSkills);

  const matching = [];
  const missing = [];

  normalizedRequired.forEach((skill) => {
    if (normalizedResume.has(skill)) {
      matching.push(skill);
    } else {
      missing.push(skill);
    }
  });

  return { matching, missing };
};

export default {
  normalizeSkill,
  normalizeSkillList,
  compareSkillLists,
};
