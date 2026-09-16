import test from "node:test";
import assert from "node:assert/strict";
import { computeProfileCompletion } from "../controllers/dashboardController.js";

test("profile completion is zero without a profile", () => {
  assert.equal(computeProfileCompletion(null), 0);
});

test("profile completion counts populated scalar and array fields", () => {
  const profile = {
    phone: "9999999999",
    college: "Career University",
    skills: ["React", "Node.js"],
    interests: [],
    cgpa: 8.4,
  };

  assert.equal(computeProfileCompletion(profile), 33);
});
