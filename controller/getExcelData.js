const Excel = require("../models/excel");

const getExcelData = async (req, res) => {
    try {
        const userId = req.userInfo.userId;

        const data = await Excel.find({ userId }).sort({ scheduledAt: 1 });

        return res.status(200).json({
            success: true,
            data,
            count: data.length
        });
    } catch (error) {
        console.error("getExcelData error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

module.exports = getExcelData;
