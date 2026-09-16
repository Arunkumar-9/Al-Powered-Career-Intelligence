import Groq from "groq-sdk";
import { buildAtsResult } from "../utils/atsMatcher.js";

const normalizeText = (text = "") =>
  String(text)
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

const buildFallbackAtsResult = buildAtsResult;

export const analyzeResume = async (resumeText) => {
  const groq = getGroqClient();
  if (!groq) {
    return {
      profile: {
        name: "",
        email: "",
        phone: "",
        degree: "",
        college: "",
        cgpa: "",
        skills: [],
        projects: [],
        certifications: [],
        experience: [],
      },
      resumeScore: 0,
      strengths: ["AI analysis unavailable because no valid Groq API key is configured."],
      weaknesses: ["Add a valid GROQ_API_KEY to enable automated resume analysis."],
      missingSkills: [],
      careerRecommendations: [],
      learningRoadmap: [],
      interviewQuestions: [],
    };
  }

  const prompt = `
You are an expert AI Career Counselor, ATS Resume Analyzer, and Technical Recruiter.

Analyze the resume below carefully.

Return ONLY valid JSON.
Do not include markdown.
Do not include explanations.
Do not include \`\`\`json.

Return this exact structure:

{
  "profile": {
    "name": "",
    "email": "",
    "phone": "",
    "degree": "",
    "college": "",
    "cgpa": "",
    "skills": [],
    "projects": [],
    "certifications": [],
    "experience": []
  },

  "resumeScore": 0,

  "strengths": [],

  "weaknesses": [],

  "missingSkills": [],

  "careerRecommendations": [],

  "learningRoadmap": [
    {
      "week": 1,
      "topic": "",
      "description": ""
    }
  ],

  "interviewQuestions": []
}

Resume:

${resumeText}
`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",

      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],

      temperature: 0.2,

      response_format: {
        type: "json_object",
      },
    });

    const content = completion.choices[0].message.content;

    return JSON.parse(content);

  } catch (error) {
    console.error("Groq AI Error:", error);
    throw new Error("Failed to analyze resume");
  }
};

// ============================================================
// Milestone 3 additions below. These reuse the same Groq client
// pattern as analyzeResume() above and do not modify it.
// ============================================================

const getGroqClient = () => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || !apiKey.trim()) return null;

  try {
    return new Groq({ apiKey });
  } catch (error) {
    console.error("Groq client init failed:", error);
    return null;
  }
};

const fallbackCareerChat = ({ message, profile }) => {
  const text = String(message || "").toLowerCase();
  const skills = profile?.skills?.length ? profile.skills.slice(0, 5).join(", ") : "your current skills";
  if (/interview|question|prepare/.test(text)) return `For interview preparation, choose one target role and practise: a 60-second introduction, two project stories using STAR, and role-specific technical questions. Based on your profile, lead with ${skills}. Which role are you preparing for?`;
  if (/resume|cv|ats/.test(text)) return "Tailor your resume to the job description: mirror relevant skill names truthfully, put the strongest matching projects near the top, and quantify outcomes. You can use ATS Resume Analysis for a detailed keyword comparison.";
  if (/skill|learn|roadmap|course/.test(text)) return `Start with the skill most often required by your target roles, then build one small demonstrable project. Your listed skills are ${skills}; tell me the role you want and I can suggest a focused next three steps.`;
  if (/job|role|career/.test(text)) return "A useful job-search plan is to pick one target role, review ten job descriptions for recurring requirements, tailor your resume to those requirements, and apply consistently. Tell me your target role or the skills you enjoy most.";
  return "I can help with career direction, job-search strategy, resume improvements, skills, and interview preparation. Tell me the role you are aiming for or ask a specific career question.";
};

export const askCareerAssistant = async ({ message, profile, history = [] }) => {
  const groq = getGroqClient();
  if (!groq) return fallbackCareerChat({ message, profile });
  const profileSummary = profile ? `Preferred role: ${profile.preferredRole || "not set"}. Career goal: ${profile.careerGoal || "not set"}. Skills: ${(profile.skills || []).join(", ") || "not set"}. Experience: ${profile.experience || "not set"}.` : "No profile has been completed yet.";
  const messages = history.filter((item) => item.content).map((item) => ({ role: item.role, content: item.content }));
  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile", temperature: 0.4,
      messages: [
        { role: "system", content: `You are a supportive AI career coach. Give practical, accurate career guidance, not guarantees. Keep answers concise and use bullets only when helpful. Candidate profile: ${profileSummary}` },
        ...messages,
        ...(messages.at(-1)?.content === message ? [] : [{ role: "user", content: message }]),
      ],
    });
    return String(completion.choices?.[0]?.message?.content || fallbackCareerChat({ message, profile })).trim();
  } catch (error) {
    console.error("Groq AI Error (career chat):", error.message);
    return fallbackCareerChat({ message, profile });
  }
};

// Strips accidental markdown fences and parses JSON safely.
const safeParseJSON = (content) => {
  const cleaned = content
    .replace(/^```json/i, "")
    .replace(/^```/, "")
    .replace(/```$/, "")
    .trim();

  return JSON.parse(cleaned);
};

// ---------------- Module 1 & 2: ATS + Skill Gap ----------------
// One AI call compares the resume against a specific Job Description
// and returns both the ATS analysis and the skill gap analysis,
// using semantic/synonym-aware matching rather than plain string
// matching (e.g. "NodeJS" recognized as "Node.js").
export const compareResumeToJD = async (resumeText, jdText) => {
  // Requirement extraction and all numeric scores are local and reproducible.
  // The model may only improve the wording of feedback; it must never invent
  // keywords or alter the match score.
  const scoredResult = buildAtsResult(resumeText, jdText);
  const groq = getGroqClient();
  if (!groq) {
    return scoredResult;
  }

  const prompt = `
You are an expert ATS (Applicant Tracking System) engine and Technical Recruiter.

Compare the RESUME against the JOB DESCRIPTION below.

Use SEMANTIC comparison, not plain string matching. Treat synonymous
skills/technologies as equivalent, for example:
NodeJS == Node.js, ReactJS == React, Mongo == MongoDB, JavaScript == JS,
Artificial Intelligence == AI, Machine Learning == ML,
Natural Language Processing == NLP.

The following requirements were extracted deterministically from the JD:
${scoredResult.extractedRequirements.map((item) => `${item.name} (${item.priority})`).join(", ") || "No catalogued technical requirements"}

Return ONLY valid JSON, no markdown, no explanations, matching exactly this structure:

{
  "atsScore": 0,
  "matchPercentage": 0,
  "keywordMatchPercentage": 0,
  "overallStatus": "Excellent Match | Good Match | Average Match | Poor Match",
  "matchingKeywords": [],
  "missingKeywords": [],
  "importantMissingTechnologies": [],
  "strengths": [],
  "weaknesses": [],
  "matchingSkills": [],
  "missingSkills": [],
  "recommendedSkills": [],
  "skillMatchPercentage": 0
}

RESUME:
${resumeText}

JOB DESCRIPTION:
${jdText}
`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      response_format: { type: "json_object" },
    });

    const aiResult = safeParseJSON(completion.choices[0].message.content);
    return {
      ...scoredResult,
      strengths: Array.isArray(aiResult.strengths) && aiResult.strengths.length ? aiResult.strengths.slice(0, 4) : scoredResult.strengths,
      weaknesses: Array.isArray(aiResult.weaknesses) && aiResult.weaknesses.length ? aiResult.weaknesses.slice(0, 4) : scoredResult.weaknesses,
    };
  } catch (error) {
    console.error("Groq AI Error (compareResumeToJD):", error);
    return buildFallbackAtsResult(resumeText, jdText);
  }
};

// ---------------- Module 3: Career Recommendation ----------------
const CAREER_ROLE_OPTIONS = [
  "Software Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Java Developer",
  "Python Developer",
  "AI Engineer",
  "ML Engineer",
  "Data Analyst",
  "Cloud Engineer",
  "Cyber Security",
  "DevOps Engineer",
];

// Keep the career pages useful when the external model is rate-limited or
// temporarily unavailable. This is deliberately conservative: it returns
// transparent, skill-based guidance rather than pretending an AI response
// was received.
const fallbackCareerRecommendations = (profileSummary) => {
  const text = String(profileSummary || "").toLowerCase();
  const roleSignals = [
    { role: "Frontend Developer", skills: ["javascript", "react", "html", "css"], roadmap: ["Strengthen modern JavaScript", "Build responsive React projects", "Publish a portfolio"] },
    { role: "Backend Developer", skills: ["node", "express", "java", "python", "sql", "mongodb"], roadmap: ["Learn REST API design", "Build a database-backed service", "Add authentication and tests"] },
    { role: "Full Stack Developer", skills: ["react", "node", "javascript", "mongodb", "sql"], roadmap: ["Connect a frontend to an API", "Build and deploy a complete project", "Practice system fundamentals"] },
    { role: "Data Analyst", skills: ["python", "sql", "excel", "data", "power bi"], roadmap: ["Practice SQL queries", "Analyze a public dataset", "Create a dashboard portfolio"] },
    { role: "AI Engineer", skills: ["python", "machine learning", "ai", "tensorflow", "pytorch"], roadmap: ["Refresh Python and statistics", "Complete ML projects", "Deploy a small AI application"] },
  ];

  return {
    recommendations: roleSignals
      .map((candidate) => {
        const matched = candidate.skills.filter((skill) => text.includes(skill));
        return {
          role: candidate.role,
          compatibility: Math.min(95, 45 + matched.length * 12),
          reason: matched.length
            ? `Your profile mentions ${matched.slice(0, 3).join(", ")}, which are relevant to this path.`
            : "This is a broadly compatible path; add related projects and skills to improve your match.",
          requiredSkills: candidate.skills,
          roadmap: candidate.roadmap,
        };
      })
      .sort((a, b) => b.compatibility - a.compatibility)
      .slice(0, 4),
  };
};

export const recommendCareers = async (profileSummary) => {
  const groq = getGroqClient();
  if (!groq) return fallbackCareerRecommendations(profileSummary);

  const prompt = `
You are an expert career counselor.

Analyze the candidate profile below (education, projects, technical skills,
experience, certifications) and recommend suitable careers ONLY from this list:
${CAREER_ROLE_OPTIONS.join(", ")}.

Return the top 4-6 most compatible roles, ranked by compatibility percentage
descending.

Return ONLY valid JSON, no markdown, matching exactly this structure:

{
  "recommendations": [
    {
      "role": "",
      "compatibility": 0,
      "reason": "",
      "requiredSkills": [],
      "roadmap": []
    }
  ]
}

CANDIDATE PROFILE:
${profileSummary}
`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    return safeParseJSON(completion.choices[0].message.content);
  } catch (error) {
    console.error("Groq AI Error (recommendCareers):", error);
    return fallbackCareerRecommendations(profileSummary);
  }
};

// ---------------- Module 5: Course learning path ----------------
// Given missing skills, ask the AI to sequence them into a short
// learning path. Actual course catalog data comes from
// courseRecommendationService (static curated catalog), this only
// produces the ordering/reasoning.
export const buildLearningPath = async (missingSkills = []) => {
  if (!missingSkills.length) return { learningPath: [] };

  const groq = getGroqClient();
  if (!groq) {
    return {
      learningPath: missingSkills.map((skill, i) => ({
        step: i + 1,
        skill,
        description: `Learn the fundamentals of ${skill}.`,
      })),
    };
  }

  const prompt = `
You are a technical learning path designer.

Given this list of missing skills: ${missingSkills.join(", ")}

Create a short, logically ordered learning path (max ${missingSkills.length} steps,
one per skill) explaining the order and why. Return ONLY valid JSON:

{
  "learningPath": [
    { "step": 1, "skill": "", "description": "" }
  ]
}
`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    return safeParseJSON(completion.choices[0].message.content);
  } catch (error) {
    console.error("Groq AI Error (buildLearningPath):", error);
    return {
      learningPath: missingSkills.map((skill, i) => ({
        step: i + 1,
        skill,
        description: `Learn the fundamentals of ${skill}.`,
      })),
    };
  }
};

// ---------------- Module 6: Resume Improvement ----------------
export const generateResumeImprovements = async (resumeText, jdText = "") => {
  const groq = getGroqClient();
  if (!groq) {
    const hasJD = Boolean(jdText.trim());
    return {
      summary: {
        before: "Resume content may be difficult for recruiters and ATS systems to scan quickly.",
        after: "Use a concise professional summary, measurable achievements, and a skills section tailored to the target role.",
      },
      missingKeywords: hasJD
        ? [...new Set((jdText.match(/\b(?:React|Node(?:\.js)?|JavaScript|TypeScript|Python|SQL|AWS|Docker|Kubernetes|Git)\b/gi) || []).map((item) => item.trim()))].slice(0, 8)
        : [],
      projectImprovements: [{
        before: "Project descriptions focus mainly on responsibilities or technologies.",
        after: "Start each bullet with an action verb and quantify the result, for example: Built a React dashboard that reduced report preparation time by 40%.",
      }],
      certificationSuggestions: ["Add certifications only when they support your target role and include the completion year."],
      technicalSkillImprovements: ["Group skills by category (Languages, Frameworks, Tools) and list only skills you can discuss confidently."],
      formattingSuggestions: ["Keep headings consistent, use reverse-chronological order, and avoid tables, columns, and graphics that ATS systems may not parse."],
      grammarSuggestions: [{
        before: "Used passive or responsibility-only statements.",
        after: "Use concise action-led statements such as 'Developed', 'Improved', and 'Automated'.",
      }],
      atsOptimizationTips: ["Tailor keywords to each job description.", "Keep the resume to one or two pages and use a standard PDF or DOCX format."],
    };
  }

  const prompt = `
You are an expert resume writer and ATS optimization specialist.

Review the resume below${jdText ? " against the provided job description" : ""}
and provide concrete, actionable improvement suggestions. Wherever possible,
give a "before" (as currently written) and "after" (improved) version.

Return ONLY valid JSON, no markdown, matching exactly this structure:

{
  "summary": { "before": "", "after": "" },
  "missingKeywords": [],
  "projectImprovements": [ { "before": "", "after": "" } ],
  "certificationSuggestions": [],
  "technicalSkillImprovements": [],
  "formattingSuggestions": [],
  "grammarSuggestions": [ { "before": "", "after": "" } ],
  "atsOptimizationTips": []
}

RESUME:
${resumeText}

${jdText ? `JOB DESCRIPTION:\n${jdText}` : ""}
`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    return safeParseJSON(completion.choices[0].message.content);
  } catch (error) {
    console.error("Groq AI Error (generateResumeImprovements):", error);
    const hasJD = Boolean(jdText.trim());
    return {
      summary: {
        before: "Resume content may be difficult for recruiters and ATS systems to scan quickly.",
        after: "Use a concise professional summary, measurable achievements, and a skills section tailored to the target role.",
      },
      missingKeywords: hasJD
        ? [...new Set((jdText.match(/\b(?:React|Node(?:\.js)?|JavaScript|TypeScript|Python|SQL|AWS|Docker|Kubernetes|Git)\b/gi) || []).map((item) => item.trim()))].slice(0, 8)
        : [],
      projectImprovements: [{
        before: "Project descriptions focus mainly on responsibilities or technologies.",
        after: "Start each bullet with an action verb and quantify the result, for example: Built a React dashboard that reduced report preparation time by 40%.",
      }],
      certificationSuggestions: ["Add certifications only when they support your target role and include the completion year."],
      technicalSkillImprovements: ["Group skills by category (Languages, Frameworks, Tools) and list only skills you can discuss confidently."],
      formattingSuggestions: ["Keep headings consistent, use reverse-chronological order, and avoid tables, columns, and graphics that ATS systems may not parse."],
      grammarSuggestions: [{
        before: "Used passive or responsibility-only statements.",
        after: "Use concise action-led statements such as 'Developed', 'Improved', and 'Automated'.",
      }],
      atsOptimizationTips: ["Tailor keywords to each job description.", "Keep the resume to one or two pages and use a standard PDF or DOCX format."],
    };
  }
};
