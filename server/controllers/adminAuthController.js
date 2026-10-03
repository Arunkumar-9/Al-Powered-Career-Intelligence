import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { logActivity } from "../utils/logActivity.js";

// POST /api/admin/auth/login
// Dedicated admin login. Reuses the same credential-check pattern as
// the normal user login (server/controllers/authcontroller.js), but
// additionally requires role === "admin" — a normal user's correct
// email/password will NOT get them an admin session.
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    const user = await User.findOne({ email });

    if (!user || user.role !== "admin") {
      // Same generic message whether the account doesn't exist or
      // isn't an admin, so this endpoint can't be used to fish for
      // which emails have admin access.
      return res.status(401).json({ message: "Invalid admin credentials" });
    }

    if (user.isActive === false) {
      return res.status(403).json({ message: "This admin account has been deactivated" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid admin credentials" });
    }

    user.lastLoginAt = new Date();
    await user.save();
    logActivity({ userId: user._id, type: "admin_login", message: `${user.name} signed in to admin dashboard` });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "12h" } // shorter-lived than the regular 7d user session
    );

    res.status(200).json({
      message: "Admin login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/admin/auth/me
// Lets the admin frontend validate an existing token on page load/
// refresh without re-sending credentials, and refresh the displayed
// admin profile. Protected by authMiddleware + adminMiddleware.
export const getAdminSession = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("name email role isActive lastLoginAt");

    if (!user) {
      return res.status(404).json({ message: "Admin account not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
