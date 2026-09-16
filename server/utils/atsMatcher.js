// Requirement-aware ATS matching.  Scores are calculated from explicit job
// requirements rather than from every word in a job post, which keeps common
// prose ("team", "work", "candidate") from skewing a candidate's result.

const SKILL_CATALOG = [
  ["JavaScript", ["javascript", "js"]], ["TypeScript", ["typescript", "ts"]],
  ["React", ["react", "reactjs", "react.js"]], ["Angular", ["angular", "angularjs"]],
  ["Vue.js", ["vue", "vuejs", "vue.js"]], ["Next.js", ["next", "nextjs", "next.js"]],
  ["Node.js", ["node", "nodejs", "node.js"]], ["Express.js", ["express", "expressjs", "express.js"]],
  ["Python", ["python"]], ["Java", ["java"]], ["C++", ["c++", "cpp"]], ["C#", ["c#", "csharp"]],
  ["SQL", ["sql", "structured query language"]], ["PostgreSQL", ["postgresql", "postgres", "psql"]],
  ["MySQL", ["mysql"]], ["MongoDB", ["mongodb", "mongo"]], ["Redis", ["redis"]],
  ["HTML", ["html", "html5"]], ["CSS", ["css", "css3", "scss", "sass"]],
  ["REST APIs", ["rest api", "restful api", "rest apis", "restful apis"]], ["GraphQL", ["graphql"]],
  ["Git", ["git", "github", "gitlab", "bitbucket"]], ["Docker", ["docker", "containers"]],
  ["Kubernetes", ["kubernetes", "k8s"]], ["AWS", ["aws", "amazon web services"]],
  ["Azure", ["azure", "microsoft azure"]], ["GCP", ["gcp", "google cloud"]],
  ["CI/CD", ["ci/cd", "cicd", "continuous integration", "continuous deployment"]],
  ["Terraform", ["terraform"]], ["Linux", ["linux"]], ["Agile", ["agile", "scrum", "kanban"]],
  ["Machine Learning", ["machine learning", "ml"]], ["Artificial Intelligence", ["artificial intelligence", " ai "]],
  ["Deep Learning", ["deep learning"]], ["NLP", ["natural language processing", "nlp"]],
  ["TensorFlow", ["tensorflow"]], ["PyTorch", ["pytorch", "torch"]], ["scikit-learn", ["scikit-learn", "scikit learn", "sklearn"]],
  ["Pandas", ["pandas"]], ["NumPy", ["numpy"]], ["Power BI", ["power bi", "powerbi"]],
  ["Tableau", ["tableau"]], ["Excel", ["excel", "microsoft excel"]], ["Figma", ["figma"]],
  ["Selenium", ["selenium"]], ["Jest", ["jest"]], ["Jira", ["jira"]], ["Microservices", ["microservices", "microservice"]],
  ["System Design", ["system design"]], ["Data Structures", ["data structures", "dsa"]],
  ["Django", ["django"]], ["Flask", ["flask"]], ["Spring", ["spring", "spring boot"]],
  ["PHP", ["php"]], ["Ruby", ["ruby", "ruby on rails", "rails"]], ["DevOps", ["devops"]],
  ["Cybersecurity", ["cybersecurity", "cyber security", "information security"]], ["Data Analysis", ["data analysis", "data analytics"]],
];

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const cleanText = (value = "") => ` ${String(value).toLowerCase().replace(/[\u2010-\u2015]/g, "-").replace(/[^a-z0-9+#./\s-]/g, " ").replace(/\s+/g, " ").trim()} `;
const phrasePattern = (phrase) => {
  const value = phrase.trim();
  // Short abbreviations need word boundaries: otherwise `js` in `Node.js`
  // would incorrectly add JavaScript as a separate JD requirement.
  return value.length <= 2
    ? new RegExp(`(?<![a-z0-9.])${escapeRegex(value)}(?![a-z0-9.])`, "i")
    : new RegExp(`(^|[^a-z0-9+#])${escapeRegex(value)}(?=$|[^a-z0-9+#])`, "i");
};
const hasPhrase = (text, phrase) => phrasePattern(phrase).test(text);
const unique = (items) => [...new Set(items.filter(Boolean))];

const requirementWeight = (text, index) => {
  // A label following a skill ("Docker is preferred") belongs to that
  // skill, but labels farther ahead must not downgrade earlier requirements.
  const before = text.slice(Math.max(0, index - 120), index);
  const after = text.slice(index, index + 50).split(/[.;\n]/)[0];
  if (/\b(preferred|nice to have|bonus|plus|desired)\b/.test(before) || /\b(preferred|nice to have|bonus|plus|desired)\b/.test(after)) return 1;
  if (/\b(required|must have|minimum qualification|mandatory|essential)\b/.test(before)) return 3;
  return 2;
};

export const extractJobRequirements = (jdText = "") => {
  const text = cleanText(jdText);
  const requirements = SKILL_CATALOG.flatMap(([name, aliases]) => {
    const positions = aliases.map((alias) => {
      const match = phrasePattern(alias).exec(text);
      return match ? match.index : -1;
    }).filter((position) => position >= 0);
    if (!positions.length) return [];
    return [{ name, aliases, weight: Math.max(...positions.map((position) => requirementWeight(text, position))), position: Math.min(...positions) }];
  }).sort((a, b) => b.weight - a.weight || a.position - b.position);

  const years = [...String(jdText).matchAll(/(?:minimum|at least|over|more than)?\s*(\d+)\+?\s*(?:years?|yrs?)(?:\s+of)?\s+(?:relevant\s+)?experience/gi)]
    .map((match) => Number(match[1]));

  return { requirements, requiredYears: years.length ? Math.max(...years) : null };
};

const estimateResumeYears = (resumeText = "") => {
  const direct = [...String(resumeText).matchAll(/(\d+)\+?\s*(?:years?|yrs?)(?:\s+of)?\s+(?:professional|relevant|work)?\s*experience/gi)]
    .map((match) => Number(match[1]));
  return direct.length ? Math.max(...direct) : null;
};

const resumeQuality = (resumeText) => {
  const text = String(resumeText || "");
  let score = 0;
  if (/\b(experience|employment|work history)\b/i.test(text)) score += 5;
  if (/\b(education|university|college|bachelor|master)\b/i.test(text)) score += 4;
  if (/\b(skills|technologies|technical skills)\b/i.test(text)) score += 4;
  if (/\b(projects?|portfolio)\b/i.test(text)) score += 3;
  if (/\b\d+(?:\.\d+)?%\b|\b\d+\s*(?:users|clients|hours|days|ms|x)\b/i.test(text)) score += 4;
  return Math.min(20, score);
};

export const buildAtsResult = (resumeText = "", jdText = "") => {
  const { requirements, requiredYears } = extractJobRequirements(jdText);
  const normalizedResume = cleanText(resumeText);
  const matched = requirements.filter((item) => item.aliases.some((alias) => hasPhrase(normalizedResume, alias)));
  const missing = requirements.filter((item) => !matched.includes(item));
  const totalWeight = requirements.reduce((sum, item) => sum + item.weight, 0);
  const matchedWeight = matched.reduce((sum, item) => sum + item.weight, 0);
  const keywordMatchPercentage = totalWeight ? Math.round((matchedWeight / totalWeight) * 100) : 0;
  const resumeYears = estimateResumeYears(resumeText);
  const experienceScore = requiredYears === null ? 100 : resumeYears === null ? 50 : Math.min(100, Math.round((resumeYears / requiredYears) * 100));
  const matchPercentage = Math.round(keywordMatchPercentage * 0.85 + experienceScore * 0.15);
  const atsScore = Math.round(Math.min(100, matchPercentage * 0.8 + resumeQuality(resumeText)));
  const status = atsScore >= 85 ? "Excellent Match" : atsScore >= 65 ? "Good Match" : atsScore >= 40 ? "Average Match" : "Poor Match";
  const matchingSkills = matched.map((item) => item.name);
  const missingSkills = missing.map((item) => item.name);
  const importantMissingTechnologies = missing.filter((item) => item.weight === 3).map((item) => item.name).slice(0, 6);

  return {
    atsScore, matchPercentage, keywordMatchPercentage, overallStatus: status,
    matchingKeywords: matchingSkills.slice(0, 15), missingKeywords: missingSkills.slice(0, 15),
    importantMissingTechnologies, matchingSkills, missingSkills,
    recommendedSkills: unique([...importantMissingTechnologies, ...missingSkills]).slice(0, 8),
    skillMatchPercentage: keywordMatchPercentage,
    strengths: matchingSkills.length ? [`Matches ${matchingSkills.slice(0, 4).join(", ")}${matchingSkills.length > 4 ? ", and other job requirements." : "."}`] : ["No catalogued job requirements were found in the resume."],
    weaknesses: missingSkills.length ? [`Add evidence of ${missingSkills.slice(0, 4).join(", ")}${missingSkills.length > 4 ? ", and other missing requirements." : "."}`] : ["No catalogued technical requirements are missing from the resume."],
    extractedRequirements: requirements.map(({ name, weight }) => ({ name, priority: weight === 3 ? "required" : weight === 1 ? "preferred" : "relevant" })),
  };
};

// Job cards use a skills-only score.  The denominator is the job's own
// extracted requirements, never the full candidate profile; otherwise adding
// a useful extra skill would incorrectly reduce every job-match percentage.
export const buildJobSkillMatch = (jobText = "", userSkills = []) => {
  const { requirements } = extractJobRequirements(jobText);
  const profileText = cleanText(unique(userSkills).join(" "));
  const matching = requirements.filter((item) => item.aliases.some((alias) => hasPhrase(profileText, alias)));
  const totalWeight = requirements.reduce((sum, item) => sum + item.weight, 0);
  const matchedWeight = matching.reduce((sum, item) => sum + item.weight, 0);

  return {
    matchPercentage: totalWeight ? Math.round((matchedWeight / totalWeight) * 100) : 0,
    requiredSkills: requirements.map((item) => item.name),
    matchingSkills: matching.map((item) => item.name),
    hasRequirements: requirements.length > 0,
  };
};
