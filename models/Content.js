const mongoose = require("mongoose");

const contentSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },

    schedulerId: {
      type: String,
      required: true,
    },

    content: {
      type: String,
      required: true,
    },

  },
  {
    timestamps: true,
  }
);

contentSchema.index(
  { userId: 1, schedulerId: 1, createdAt: 1 }
);

module.exports = mongoose.model("Content", contentSchema);
