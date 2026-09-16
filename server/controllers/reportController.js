import AIReport from "../models/AIReport.js";

export const getReport = async (req, res) => {
  try {
    const report = await AIReport.findOne({
      userId: req.user.id,
    }).sort({ createdAt: -1 });

    if (!report) {
      return res.status(404).json({
        message: "No AI report found",
      });
    }

    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};