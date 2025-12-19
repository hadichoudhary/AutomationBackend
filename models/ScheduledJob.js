const mongoose = require("mongoose");

const scheduledJobSchema = new mongoose.Schema(
  {
    user_id: {
      type: String,
      required: true,
      index: true,
    },

    topic: {
      type: String,
      required: true,
    },

    schedule_cron: {
      type: String,
      required: true,
    },

    platforms: {
      type: Array,
      default: [],
    },

    confirmation_message: {
      type: String,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    day_of_week: {
      type: Number, // 0–6
    },

    is_recurring: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: "scheduled_jobs", // 🔴 IMPORTANT
  }
);

module.exports = mongoose.model("ScheduledJob", scheduledJobSchema);
