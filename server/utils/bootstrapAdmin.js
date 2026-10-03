import bcrypt from "bcrypt";
import User from "../models/User.js";

// Creates the first administrator from deployment secrets. Existing accounts
// are never overwritten; a standard account with this email is only promoted.
export const bootstrapAdmin = async () => {
  const name = process.env.ADMIN_NAME?.trim();
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!name || !email || !password) return;

  if (password.length < 12) {
    throw new Error("ADMIN_PASSWORD must be at least 12 characters long");
  }

  const existing = await User.findOne({ email });

  if (existing) {
    if (existing.role !== "admin") {
      existing.role = "admin";
      existing.isActive = true;
      await existing.save();
      console.log(`Existing account ${email} promoted to admin.`);
    }
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await User.create({ name, email, password: hashedPassword, role: "admin" });
  console.log(`Bootstrap admin ${email} created.`);
};
