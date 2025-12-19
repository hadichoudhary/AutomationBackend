const Activity = require("../models/Activity");

module.exports = async function logActivity({
  userId,
  type,
  title,
  metadata = {},
}) {
  try {
    await Activity.create({
      user: userId,
      type,
      title,
      metadata,
    });
  } catch (err) {
    console.error("Activity log failed:", err.message);
  }
};
