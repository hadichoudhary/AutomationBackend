const Excel = require("../models/Excel");

const getExcelData = async (req, res) => {
  try {
    const userId = req.userInfo.userId;

    const rows = await Excel.find({ userId }).sort({ scheduledAt: 1 });

    // ✅ SHAPE DATA FOR EXCEL (WHITELIST)
    const exportData = rows.map((row) => ({
      // keep safe business fields
      Id: row.Id,
      date: row.date,
      time: row.time,
      contentTopic: row.contentTopic,

      // ✅ output column reused as LinkedIn output
      linkdlnOutput: row.output,

      // keep other outputs
      facebookOutPut: row.facebookOutPut,

      status: row.status,
      linkdlnStatus: row.linkdlnStatus,
      facebookStatus: row.facebookStatus,
      needImage: row.needImage,
    }));

    return res.status(200).json({
      success: true,
      data: exportData,
      count: exportData.length,
    });
  } catch (error) {
    console.error("getExcelData error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = getExcelData;
