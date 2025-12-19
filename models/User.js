const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },

    platforms: [
      {
        platform: {
          type: String, 
          required: true,
        },
        platformAccountId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "PlatformAccount",
        },
        status: {
          type: String,
          enum: ["connected", "disconnected"],
          default: "disconnected",
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.User || mongoose.model("User", userSchema);
