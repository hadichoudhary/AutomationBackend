const Excel = require("../models/excel");

const postUpdate = async (req, res) => {
    try {
        const { sheetId, linkdlnoutput } = req.body;

        if (!sheetId || !linkdlnoutput) {
            return res.status(400).json({
                success: false,
                message: "please fill all data"
            })
        }
        const checkExcel = await Excel.findById(sheetId)
        if (!checkExcel) {
            return res.status(400).json({
                success: false,
                message: "this sheet is not present "
            })
        }

        await Excel.findByIdAndUpdate(
            sheetId,
            { output: linkdlnoutput },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: "output update successfully",

        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'server error'
        })
    }


}

const postUpdateForfacebook = async (req, res) => {
    try {
        const { sheetId, Facebookoutput } = req.body;

        if (!sheetId || !Facebookoutput) {
            return res.status(400).json({
                success: false,
                message: "please fill all data"
            })
        }
        const checkExcel = await Excel.findById(sheetId)
        if (!checkExcel) {
            return res.status(400).json({
                success: false,
                message: "this sheet is not present "
            })
        }

        await Excel.findByIdAndUpdate(
            sheetId,
            { facebookOutPut: Facebookoutput },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: "output update successfully",

        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'server error'
        })
    }


}

const Approve = async (req, res) => {
    try {
        const { platform, excelId } = req.body;

        if (!platform || !excelId) {
            return res.status(400).json({
                success: false,
                message: "please fill all data"
            })
        }
        const checkExcel = await Excel.findById(excelId)
        if (!checkExcel) {
            return res.status(400).json({
                success: false,
                message: "this sheet is not present "
            })
        }
        if (platform == 'linkedin') {
            await Excel.findByIdAndUpdate(
                excelId,
                { linkdlnStatus: "Approved" },
                { new: true }
            );
        }

        if (platform == 'facebook') {
            await Excel.findByIdAndUpdate(
                excelId,
                { facebookStatus: "Approved" },
                { new: true }
            );
        }

        return res.status(200).json({
            success: true,
            message: "status update successfully",

        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'server error'
        })
    }


}
const draftPost = async (req, res) => {
    const { excelId,status } = req.body;

    if (!excelId || !status) {
        return res.status(400).json({
            success: false,
            message: "please provide excelId",
        });
    }

    const excel = await Excel.findByIdAndUpdate(
        excelId,
        { $set: { status: status } },
        { new: true }
    );

    if (!excel) {
        return res.status(400).json({
            success: false,
            message: "no excel present based on this id",
        });
    }

    return res.status(200).json({
        success: true,
        message: "post status updated successfully",
        data: excel,
    });
};

module.exports = { postUpdate, postUpdateForfacebook, Approve,draftPost }