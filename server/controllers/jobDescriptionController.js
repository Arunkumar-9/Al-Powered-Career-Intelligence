import JobDescription from "../models/JobDescription.js";

// Module 1/2 input: save & manage a small library of Job Descriptions
// so the user can reuse them across analyses instead of re-pasting.

export const addJobDescription = async (req, res) => {
  try {
    const { title, company, text } = req.body;

    if (!title || !text) {
      return res.status(400).json({ message: "Title and JD text are required" });
    }

    const jd = await JobDescription.create({
      userId: req.user.id,
      title,
      company: company || "",
      text,
    });

    res.status(201).json(jd);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const listJobDescriptions = async (req, res) => {
  try {
    const jds = await JobDescription.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });

    res.status(200).json(jds);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getJobDescription = async (req, res) => {
  try {
    const jd = await JobDescription.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!jd) return res.status(404).json({ message: "Job description not found" });

    res.status(200).json(jd);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteJobDescription = async (req, res) => {
  try {
    const jd = await JobDescription.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!jd) return res.status(404).json({ message: "Job description not found" });

    res.status(200).json({ message: "Job description deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
