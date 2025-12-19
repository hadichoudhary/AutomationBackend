const Excel = require("../models/Excel");
const logActivity = require("../utils/logActivity");

/**
 * Build scheduledAt from DD/MM/YYYY + HH:MM:SS
 */
const buildScheduledAt = (date, time) => {
  if (!date || !time) return null;

  try {
    const [day, month, year] = date.split("/").map(Number);
    if (!day || !month || !year) return null;

    const [hour = 0, minute = 0, second = 0] = time
      .split(":")
      .map(Number);

    const d = new Date(year, month - 1, day, hour, minute, second);
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
};

const cleanText = (t = "") =>
  Buffer.from(String(t), "latin1").toString("utf8");


const saveExcelData = async (req, res) => {
  try {
    const rows = req.body;
    const userId = req.userInfo.userId;

    // -----------------------------
    // 1. Validate payload
    // -----------------------------
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No data received",
      });
    }

    // -----------------------------
    // 2. Enforce monthly limit (31)
    // -----------------------------
    if (rows.length > 31) {
      return res.status(400).json({
        success: false,
        message: "Excel upload limit exceeded. Maximum 31 rows allowed per month.",
      });
    }

    // -----------------------------
    // 3. Check existing data
    // -----------------------------
    const existingCount = await Excel.countDocuments({ userId });

    if (existingCount > 0) {
      return res.status(409).json({
        success: false,
        message:
          "Existing posts found. Please download and delete old posts before uploading a new Excel.",
      });
    }

    // -----------------------------
    // 4. Format rows (whitelisted)
    // -----------------------------
    const formattedRows = rows.map((row) => {
      const {
        Id,
        date,
        time,
        contentTopic,
        theme,
        link,
        needImage,
      } = row;

      return {
        userId,
        Id,
        date,
        time,
        contentTopic: cleanText(contentTopic),
        theme,
        link,
        needImage: Boolean(needImage),
        status: "Scheduled",
      };
    });


    await Excel.insertMany(formattedRows);

    await logActivity({
      userId,
      type: "UPLOAD_EXCEL",
      title: `Excel uploaded (${formattedRows.length} rows)`,
      metadata: {
        rows: formattedRows.length,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Excel uploaded successfully",
      data: formattedRows.length,
    });
  } catch (error) {
    console.error("saveExcelData error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = saveExcelData;
