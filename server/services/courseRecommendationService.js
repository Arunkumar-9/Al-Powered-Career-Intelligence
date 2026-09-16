import { normalizeSkill } from "../utils/skillSynonyms.js";
import { buildLearningPath } from "./aiService.js";

// ============================================================
// Module 5: Course Recommendation
// Static curated catalog mapped by (normalized) skill, spanning the
// platforms required by the spec. No external course API is used —
// this keeps the module fully functional offline/without extra keys.
// Falls back to a generic search-style entry for any skill not in
// the curated map, so no missing skill is ever left without a
// suggestion.
// ============================================================

const CATALOG = {
  javascript: [
    { title: "JavaScript Algorithms and Data Structures", platform: "freeCodeCamp", difficulty: "Beginner", duration: "40 hours", rating: 4.7, url: "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/" },
    { title: "The Complete JavaScript Course", platform: "Udemy", difficulty: "Beginner-Advanced", duration: "69 hours", rating: 4.7, url: "https://www.udemy.com/course/the-complete-javascript-course/" },
  ],
  typescript: [
    { title: "Understanding TypeScript", platform: "Udemy", difficulty: "Intermediate", duration: "17 hours", rating: 4.6, url: "https://www.udemy.com/course/understanding-typescript/" },
  ],
  react: [
    { title: "React - The Complete Guide", platform: "Udemy", difficulty: "Beginner-Advanced", duration: "48 hours", rating: 4.6, url: "https://www.udemy.com/course/react-the-complete-guide-incl-redux/" },
    { title: "React Basics", platform: "Coursera", difficulty: "Beginner", duration: "17 hours", rating: 4.7, url: "https://www.coursera.org/learn/react-basics" },
  ],
  nodejs: [
    { title: "Node.js, Express, MongoDB & More", platform: "Udemy", difficulty: "Intermediate", duration: "42 hours", rating: 4.7, url: "https://www.udemy.com/course/nodejs-express-mongodb-bootcamp/" },
  ],
  python: [
    { title: "Python for Everybody", platform: "Coursera", difficulty: "Beginner", duration: "8 months", rating: 4.8, url: "https://www.coursera.org/specializations/python" },
    { title: "Scientific Computing with Python", platform: "freeCodeCamp", difficulty: "Beginner", duration: "300 hours", rating: 4.6, url: "https://www.freecodecamp.org/learn/scientific-computing-with-python/" },
  ],
  java: [
    { title: "Java Programming Masterclass", platform: "Udemy", difficulty: "Beginner-Advanced", duration: "80 hours", rating: 4.6, url: "https://www.udemy.com/course/java-the-complete-java-developer-course/" },
  ],
  sql: [
    { title: "SQL for Data Science", platform: "Coursera", difficulty: "Beginner", duration: "20 hours", rating: 4.7, url: "https://www.coursera.org/learn/sql-for-data-science" },
    { title: "Introduction to Databases", platform: "NPTEL", difficulty: "Intermediate", duration: "12 weeks", rating: 4.5, url: "https://nptel.ac.in/courses" },
  ],
  mongodb: [
    { title: "MongoDB Basics", platform: "YouTube", difficulty: "Beginner", duration: "3 hours", rating: 4.5, url: "https://www.youtube.com/results?search_query=mongodb+crash+course" },
  ],
  "amazon web services": [
    { title: "AWS Certified Cloud Practitioner", platform: "Udemy", difficulty: "Beginner", duration: "14 hours", rating: 4.7, url: "https://www.udemy.com/course/aws-certified-cloud-practitioner-new/" },
  ],
  "microsoft azure": [
    { title: "AZ-900: Azure Fundamentals", platform: "Microsoft Learn", difficulty: "Beginner", duration: "10 hours", rating: 4.7, url: "https://learn.microsoft.com/en-us/training/paths/azure-fundamentals/" },
  ],
  "google cloud platform": [
    { title: "Google Cloud Fundamentals", platform: "Google", difficulty: "Beginner", duration: "8 hours", rating: 4.6, url: "https://www.cloudskillsboost.google/" },
  ],
  docker: [
    { title: "Docker & Kubernetes: The Practical Guide", platform: "Udemy", difficulty: "Intermediate", duration: "22 hours", rating: 4.7, url: "https://www.udemy.com/course/docker-kubernetes-the-practical-guide/" },
  ],
  kubernetes: [
    { title: "Kubernetes for the Absolute Beginners", platform: "Udemy", difficulty: "Beginner", duration: "6 hours", rating: 4.6, url: "https://www.udemy.com/course/learn-kubernetes/" },
  ],
  "machine learning": [
    { title: "Machine Learning Specialization", platform: "Coursera", difficulty: "Intermediate", duration: "3 months", rating: 4.9, url: "https://www.coursera.org/specializations/machine-learning-introduction" },
    { title: "Machine Learning with Python", platform: "IBM SkillsBuild", difficulty: "Beginner", duration: "10 hours", rating: 4.5, url: "https://skillsbuild.org/" },
  ],
  "deep learning": [
    { title: "Deep Learning Specialization", platform: "Coursera", difficulty: "Advanced", duration: "5 months", rating: 4.9, url: "https://www.coursera.org/specializations/deep-learning" },
  ],
  "natural language processing": [
    { title: "NLP Specialization", platform: "Coursera", difficulty: "Advanced", duration: "4 months", rating: 4.6, url: "https://www.coursera.org/specializations/natural-language-processing" },
  ],
  "artificial intelligence": [
    { title: "AI For Everyone", platform: "Coursera", difficulty: "Beginner", duration: "6 hours", rating: 4.8, url: "https://www.coursera.org/learn/ai-for-everyone" },
  ],
  devops: [
    { title: "DevOps Beginners to Advanced", platform: "Udemy", difficulty: "Beginner-Advanced", duration: "35 hours", rating: 4.5, url: "https://www.udemy.com/course/devops-beginners-to-advanced-with-projects/" },
  ],
  git: [
    { title: "Git & GitHub Crash Course", platform: "YouTube", difficulty: "Beginner", duration: "1 hour", rating: 4.7, url: "https://www.youtube.com/results?search_query=git+github+crash+course" },
  ],
  html5: [
    { title: "Responsive Web Design", platform: "freeCodeCamp", difficulty: "Beginner", duration: "300 hours", rating: 4.7, url: "https://www.freecodecamp.org/learn/2022/responsive-web-design/" },
  ],
  css3: [
    { title: "CSS - The Complete Guide", platform: "Udemy", difficulty: "Beginner-Intermediate", duration: "24 hours", rating: 4.7, url: "https://www.udemy.com/course/css-the-complete-guide-incl-flexbox-grid-sass/" },
  ],
  "cyber security": [
    { title: "Google Cybersecurity Professional Certificate", platform: "Coursera", difficulty: "Beginner", duration: "6 months", rating: 4.8, url: "https://www.coursera.org/professional-certificates/google-cybersecurity" },
  ],
  "data structures and algorithms": [
    { title: "DSA Self Paced", platform: "NPTEL", difficulty: "Intermediate", duration: "8 weeks", rating: 4.5, url: "https://nptel.ac.in/courses" },
  ],
};

// Generic fallback so any skill not in the curated map still returns
// a usable suggestion (points the learner to a search on a reputable
// platform rather than showing nothing).
const genericSuggestion = (skill) => ({
  title: `Learn ${skill}`,
  platform: "YouTube",
  difficulty: "Beginner",
  duration: "Self-paced",
  rating: 4.3,
  url: `https://www.youtube.com/results?search_query=${encodeURIComponent(skill + " tutorial")}`,
});

/**
 * Build course recommendations + a short AI-generated learning path
 * for a given list of missing skills.
 */
export const recommendCoursesForSkills = async (missingSkills = []) => {
  const courses = [];

  missingSkills.forEach((rawSkill) => {
    const normalized = normalizeSkill(rawSkill);
    const matches = CATALOG[normalized];

    if (matches && matches.length) {
      matches.forEach((c) => courses.push({ ...c, skill: rawSkill }));
    } else {
      courses.push({ ...genericSuggestion(rawSkill), skill: rawSkill });
    }
  });

  const { learningPath } = await buildLearningPath(missingSkills);

  return { courses, learningPath: learningPath || [] };
};

export default { recommendCoursesForSkills };
