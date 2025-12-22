const ScheduledJob = require("../models/ScheduledJob");
const cronToReadable = require("../utils/cronToReadable");

const isValidCron = (cron) => {
  if (!cron) return false;

  const parts = cron.split(" ");
  if (parts.length !== 5) return false;

  const [min, hour, dom, mon, dow] = parts;

  if (dom !== "*" || mon !== "*") return false;
  if (+min < 0 || +min > 59) return false;
  if (+hour < 0 || +hour > 23) return false;
  if (dow !== "*" && (+dow < 0 || +dow > 6)) return false;

  return true;
};

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
// UPDATE schedule (topic / cron / status)
const updateSchedule = async (req, res) => {
  try {
    const userId = req.userInfo.userId;
    const { id } = req.params;
    const { topic, schedule_cron, status } = req.body;

    const job = await ScheduledJob.findOne({
      _id: id,
      user_id: userId,
    });

    if (!job) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    // Update topic
    if (typeof topic === "string" && topic.trim()) {
      job.topic = topic.trim();
    }

    // Update cron
    if (schedule_cron) {
      if (!isValidCron(schedule_cron)) {
        return res.status(400).json({
          message: "Invalid schedule format",
        });
      }
      job.schedule_cron = schedule_cron;
    }

    // Update status
    if (status) {
      if (!["active", "paused"].includes(status)) {
        return res.status(400).json({
          message: "Invalid status value",
        });
      }
      job.status = status;
    }

    await job.save();

    return res.status(200).json({
      success: true,
      message: "Schedule updated successfully",
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
  updateSchedule,
  deleteSchedule,
};
