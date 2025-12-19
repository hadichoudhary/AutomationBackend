const mongoose = require("mongoose");

const excelArchiveSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    archivedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    reason: {
      type: String, // e.g. "USER_REUPLOAD"
      default: "USER_REUPLOAD",
    },

    data: {
      type: Object, // full Excel row snapshot
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ExcelArchive", excelArchiveSchema);
