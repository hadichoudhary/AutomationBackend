const ScheduledJob = require("../models/ScheduledJob");
const cronToReadable = require("../utils/cronToReadable");

// GET all schedules for logged-in user
const getUserSchedules = async (req, res) => {
  try {
    const userId = req.userInfo.userId;

    const schedules = await ScheduledJob.find({ user_id: userId }).sort({
      createdAt: -1,
    });

    const formatted = schedules.map((job) => {
      const { day, time } = cronToReadable(job.schedule_cron);

      return {
        id: job._id,
        topic: job.topic,
        day,
        time,
        status: job.status,
        is_recurring: job.is_recurring,
      };
    });

    return res.status(200).json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    console.error("Get schedules error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch schedules",
    });
  }
};

// UPDATE topic
const updateScheduleTopic = async (req, res) => {
  try {
    const userId = req.userInfo.userId;
    const { id } = req.params;
    const { topic } = req.body;

    if (!topic) {
      return res.status(400).json({ message: "Topic is required" });
    }

    const job = await ScheduledJob.findOne({
      _id: id,
      user_id: userId,
    });

    if (!job) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    job.topic = topic;
    await job.save();

    return res.status(200).json({
      success: true,
      message: "Topic updated successfully",
    });
  } catch (error) {
    console.error("Update schedule error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update schedule",
    });
  }
};

// DELETE schedule
const deleteSchedule = async (req, res) => {
  try {
    const userId = req.userInfo.userId;
    const { id } = req.params;

    const deleted = await ScheduledJob.findOneAndDelete({
      _id: id,
      user_id: userId,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Schedule deleted successfully",
    });
  } catch (error) {
    console.error("Delete schedule error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete schedule",
    });
  }
};

module.exports = {
  getUserSchedules,
  updateScheduleTopic,
  deleteSchedule,
};
