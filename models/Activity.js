const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        type: {
            type: String,
            enum: [
                "PLATFORM_CONNECTED",
                "PLATFORM_DISCONNECTED",
                "POST_CREATED",
                "POST_SCHEDULED",
                "POST_PUBLISHED",
                "POST_FAILED",
                "PROMPT_GENERATED",
                "UPLOAD_EXCEL",
                "PROFILE_UPDATED",
                "PASSWORD_CHANGED"

            ],
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        metadata: {
            type: Object,
            default: {},
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Activity", activitySchema);
