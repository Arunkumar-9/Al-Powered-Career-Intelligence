import test from "node:test";
import assert from "node:assert/strict";
import { compareResumeToJD } from "../services/aiService.js";
import { buildAtsResult, buildJobSkillMatch, extractJobRequirements } from "../utils/atsMatcher.js";

test("compareResumeToJD falls back when Groq API key is missing or invalid", async () => {
  const previousKey = process.env.GROQ_API_KEY;
  delete process.env.GROQ_API_KEY;

  try {
    const result = await compareResumeToJD(
      "Frontend developer with React, JavaScript, HTML, CSS, MongoDB",
      "Senior Frontend Developer with React, TypeScript, REST APIs"
    );

    assert.equal(typeof result.atsScore, "number");
    assert.ok(result.overallStatus);
    assert.ok(Array.isArray(result.matchingKeywords) || Array.isArray(result.missingKeywords));
  } finally {
    if (previousKey) {
      process.env.GROQ_API_KEY = previousKey;
    } else {
      delete process.env.GROQ_API_KEY;
    }
  }
});

test("extracts technical JD requirements and weights required skills above preferred ones", () => {
  const { requirements, requiredYears } = extractJobRequirements(`
    Required: React, TypeScript, Node.js, REST APIs, and AWS.
    At least 3 years of experience. Docker is nice to have.
  `);

  const byName = new Map(requirements.map((item) => [item.name, item]));
  assert.equal(requiredYears, 3);
  assert.equal(byName.get("React").weight, 3);
  assert.equal(byName.get("Docker").weight, 1);
});

test("scores only extracted requirements and recognizes technology aliases", () => {
  const result = buildAtsResult(
    "Frontend engineer with ReactJS, TS, NodeJS, RESTful APIs and Amazon Web Services. 4 years of experience.",
    "Required: React, TypeScript, Node.js, REST APIs and AWS. At least 3 years of experience. Kubernetes is preferred."
  );

  assert.ok(result.matchingKeywords.includes("React"));
  assert.ok(result.matchingKeywords.includes("TypeScript"));
  assert.ok(result.matchingKeywords.includes("Node.js"));
  assert.ok(result.missingKeywords.includes("Kubernetes"));
  assert.ok(result.keywordMatchPercentage >= 85);
  assert.ok(result.atsScore <= 100);
});

test("job match uses the job requirements rather than penalizing extra profile skills", () => {
  const result = buildJobSkillMatch(
    "Frontend role. Required: React, TypeScript and CSS. Docker is preferred.",
    ["ReactJS", "TS", "CSS", "Python", "AWS", "MongoDB", "Git"]
  );

  assert.equal(result.matchPercentage, 90);
  assert.deepEqual(result.matchingSkills, ["React", "TypeScript", "CSS"]);
});
