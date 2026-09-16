// One-off CLI script to create (or promote) an admin user.
// There is deliberately no public "register as admin" API endpoint —
// admin accounts must be provisioned by whoever controls the server.
//
// Usage:
//   node scripts/createAdmin.js "Admin Name" admin@example.com "StrongPassword123"
//
// If a user with that email already exists, it promotes them to
// role: "admin" instead of creating a duplicate account.

import dotenv from "dotenv";
import bcrypt from "bcrypt";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import mongoose from "mongoose";

dotenv.config();

const run = async () => {
  const [, , name, email, password] = process.argv;

  if (!name || !email || !password) {
    console.error("Usage: node scripts/createAdmin.js <name> <email> <password>");
    process.exit(1);
  }

  await connectDB();

  const existing = await User.findOne({ email });

  if (existing) {
    existing.role = "admin";
    existing.isActive = true;
    await existing.save();
    console.log(`Existing user ${email} promoted to admin.`);
  } else {
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ name, email, password: hashedPassword, role: "admin" });
    console.log(`Admin user ${email} created.`);
  }

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
