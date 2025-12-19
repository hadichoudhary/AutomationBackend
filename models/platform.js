const mongoose = require("mongoose");

const platformAccountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    platform: {
      type: String,
      enum: ["linkedin", "facebook", "instagram", "twitter", "x"],
      required: true,
      lowercase: true,
      index: true,
    },

    accountId: { type: String, required: true },
    accountName: String,
    profileUrl: String,

    accessToken: { type: String, required: true, select: false },
    refreshToken: { type: String, select: false,default:null },
    tokenExpiresAt: Date,

    scope: [String],

    status: {
      type: String,
      enum: ["connected", "expired", "revoked", "error"],
      default: "connected",
    },

    meta: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

platformAccountSchema.index(
  { userId: 1, platform: 1, accountId: 1 },
  { unique: true }
);

/**
 * ✅ SAFE EXPORT
 */
module.exports =
  mongoose.models.PlatformAccount ||
  mongoose.model("PlatformAccount", platformAccountSchema);
