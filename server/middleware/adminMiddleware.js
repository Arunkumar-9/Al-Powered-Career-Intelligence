// Admin Dashboard: role-based access control.
// Must run AFTER authMiddleware, which populates req.user from the JWT.
// This does not replace authMiddleware — it adds a role check on top,
// so admin routes require BOTH a valid token AND role === "admin".
// This is enforced on the backend (not just hidden in the UI), so a
// normal user's token can never reach an admin controller even if they
// call the API directly.

import User from "../models/User.js";

const adminMiddleware = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Re-check the role against the database rather than trusting the
    // JWT payload alone — this way, if an admin's role is revoked or
    // the account is deactivated after a token was issued, access is
    // cut off immediately instead of waiting for the token to expire.
    const user = await User.findById(req.user.id).select("role isActive");

    if (!user || user.isActive === false) {
      return res.status(403).json({ message: "Account is not active" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default adminMiddleware;
