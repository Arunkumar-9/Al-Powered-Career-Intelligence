import Profile from "../models/Profile.js";
import { logActivity } from "../utils/logActivity.js";

export const createProfile = async (req, res) => {
  try {
    const existingProfile = await Profile.findOne({
      userId: req.user.id,
    });

    if (existingProfile) {
      return res.status(400).json({
        message: "Profile already exists",
      });
    }

    const profile = await Profile.create({
      userId: req.user.id,
      ...req.body,
    });

    logActivity({ userId: req.user.id, type: "profile_update", message: "Profile created" });
    res.status(201).json(profile);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({
      userId: req.user.id,
    });

    if (!profile) {
      return res.status(404).json({
        message: "Profile not found",
      });
    }

    logActivity({ userId: req.user.id, type: "profile_update", message: "Profile updated" });
    res.json(profile);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const profile = await Profile.findOneAndUpdate(
      { userId: req.user.id },
      req.body,
      { new: true }
    );

    res.json(profile);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};