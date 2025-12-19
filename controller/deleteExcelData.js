const Excel = require("../models/Excel");
const ExcelArchive = require("../models/excelArchive");
const logActivity = require("../utils/logActivity");

const deleteExcelData = async (req, res) => {
    try {
        const userId = req.userInfo.userId;

        const existingRows = await Excel.find({ userId });

        if (existingRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No existing data found"
            });
        }

        // Archive first
        const archiveDocs = existingRows.map(row => ({
            userId,
            reason: "USER_REUPLOAD",
            data: row.toObject()
        }));

        await ExcelArchive.insertMany(archiveDocs);

        // Delete active data
        await Excel.deleteMany({ userId });

        await logActivity({
            userId,
            type: "DELETE_EXCEL",
            title: "Old Excel data deleted and archived",
            metadata: {
                rowsDeleted: existingRows.length
            }
        });

        return res.status(200).json({
            success: true,
            message: "Old data deleted successfully",
            deletedCount: existingRows.length
        });
    } catch (error) {
        console.error("deleteExcelData error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

module.exports = deleteExcelData;
