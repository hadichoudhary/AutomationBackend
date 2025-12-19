const Activity = require("../models/Activity");

/**
 * GET /api/activity/recent
 */
const getRecentActivity = async (req, res) => {
  try {
    // ✅ comes from your auth middleware
    const userId = req.userInfo.userId;

    const activities = await Activity.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return res.status(200).json({
      success: true,
      data: activities,
    });
  } catch (error) {
    console.error("Get activity error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch activity",
    });
  }
};

/**
 * GET /api/activity
 */
const getAllActivity = async (req, res) => {
  try {
    const userId = req.userInfo.userId;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [activities, total] = await Promise.all([
      Activity.find({ user: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Activity.countDocuments({ user: userId }),
    ]);

    return res.status(200).json({
      success: true,
      page,
      total,
      data: activities,
    });
  } catch (error) {
    console.error("Get activity error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch activity",
    });
  }
};

module.exports = {
  getRecentActivity,
  getAllActivity,
};
