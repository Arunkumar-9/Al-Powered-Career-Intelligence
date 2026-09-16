import ActivityLog from "../models/ActivityLog.js";

export const logActivity = (data) => {
  ActivityLog.create(data).catch((error) => {
    // Activity logging must never break a user-facing request.
    console.error("Activity log error:", error.message);
  });
};
