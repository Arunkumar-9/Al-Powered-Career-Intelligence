import User from "../models/User.js";
import Profile from "../models/Profile.js";
import Resume from "../models/Resume.js";
import AnalysisReport from "../models/AnalysisReport.js";

// GET /api/admin/users?search=&role=&status=&page=&limit=
export const listUsers = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);
    const { search, role, status } = req.query;

    const filter = {};

    if (search) {
      const regex = new RegExp(search.trim(), "i");
      filter.$or = [{ name: regex }, { email: regex }];
    }

    if (role && ["user", "admin"].includes(role)) {
      filter.role = role;
    }

    if (status === "active") filter.isActive = { $ne: false };
    if (status === "inactive") filter.isActive = false;

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("name email role isActive lastLoginAt createdAt")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    res.status(200).json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(Math.ceil(total / limit), 1),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/admin/users/:id
export const getUserDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const [user, profile, resumeCount, latestAnalysis] = await Promise.all([
      User.findById(id).select("name email role isActive lastLoginAt createdAt"),
      Profile.findOne({ userId: id }),
      Resume.countDocuments({ userId: id }),
      AnalysisReport.findOne({ userId: id }).sort({ createdAt: -1 }).select("atsScore createdAt"),
    ]);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      user,
      profile: profile || null,
      activity: {
        resumeCount,
        latestAtsScore: latestAnalysis?.atsScore ?? null,
        lastAnalysisAt: latestAnalysis?.createdAt ?? null,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/admin/users/:id/status  { isActive: boolean }
export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({ message: "isActive (boolean) is required" });
    }

    // An admin can't accidentally lock themselves out.
    if (id === req.user.id && isActive === false) {
      return res.status(400).json({ message: "You cannot deactivate your own account" });
    }

    const user = await User.findByIdAndUpdate(id, { isActive }, { new: true }).select(
      "name email role isActive lastLoginAt createdAt"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: `User ${isActive ? "activated" : "deactivated"}`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/admin/users/:id/role  { role: "user" | "admin" }
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "role must be 'user' or 'admin'" });
    }

    if (id === req.user.id && role !== "admin") {
      return res.status(400).json({ message: "You cannot remove your own admin role" });
    }

    const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select(
      "name email role isActive lastLoginAt createdAt"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Role updated", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/admin/users/:id
// Deletes the user account and their profile. Resumes and analysis
// reports are intentionally left in place (orphaned by userId) rather
// than cascade-deleted, so historical platform analytics/reports
// aren't silently destroyed by a user-management action. See the
// delivery notes for why this trade-off was made.
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (id === req.user.id) {
      return res.status(400).json({ message: "You cannot delete your own account" });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await Promise.all([User.findByIdAndDelete(id), Profile.findOneAndDelete({ userId: id })]);

    res.status(200).json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
