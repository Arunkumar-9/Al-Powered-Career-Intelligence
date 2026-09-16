import Profile from "../models/Profile.js";
import User from "../models/User.js";

// Module 4: Profile Management. Read-only for admins — the existing
// user-facing profile functionality (client/src/pages/Profile) is
// untouched; this just surfaces the same Profile collection to admins.

// Rough, transparent completion score: how many of the "meaningful"
// profile fields are filled in. Mirrors the fields users actually see
// on their own Profile page (Personal/Academic/Professional sections).
const PROFILE_FIELDS = [
  "phone",
  "college",
  "degree",
  "branch",
  "graduationYear",
  "cgpa",
  "skills",
  "interests",
  "careerGoal",
  "preferredRole",
  "experience",
  "location",
];

const computeCompletion = (profile) => {
  if (!profile) return 0;
  const filled = PROFILE_FIELDS.filter((field) => {
    const value = profile[field];
    if (Array.isArray(value)) return value.length > 0;
    return value !== undefined && value !== null && value !== "";
  }).length;
  return Math.round((filled / PROFILE_FIELDS.length) * 100);
};

// GET /api/admin/profiles?search=&page=&limit=
// Search matches against the owning user's name/email since Profile
// itself has no name/email field.
export const listProfiles = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);
    const { search } = req.query;

    let userFilter = {};
    if (search) {
      const regex = new RegExp(search.trim(), "i");
      const matchingUsers = await User.find({ $or: [{ name: regex }, { email: regex }] }).select("_id");
      userFilter = { userId: { $in: matchingUsers.map((u) => u._id) } };
    }

    const [profiles, total] = await Promise.all([
      Profile.find(userFilter)
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("userId", "name email role isActive createdAt"),
      Profile.countDocuments(userFilter),
    ]);

    res.status(200).json({
      profiles: profiles
        .filter((p) => p.userId) // guard against orphaned profiles
        .map((p) => ({
          _id: p._id,
          user: { id: p.userId._id, name: p.userId.name, email: p.userId.email },
          college: p.college,
          degree: p.degree,
          branch: p.branch,
          graduationYear: p.graduationYear,
          skillsCount: (p.skills || []).length,
          completion: computeCompletion(p),
          updatedAt: p.updatedAt,
        })),
      pagination: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/admin/profiles/:userId
export const getProfileDetail = async (req, res) => {
  try {
    const { userId } = req.params;

    const [user, profile] = await Promise.all([
      User.findById(userId).select("name email role isActive lastLoginAt createdAt"),
      Profile.findOne({ userId }),
    ]);

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({
      user,
      profile: profile || null,
      completion: computeCompletion(profile),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
