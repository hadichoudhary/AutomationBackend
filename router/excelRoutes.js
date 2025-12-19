const express = require("express");
const excelRouter = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");

const saveExcelData = require("../controller/excelController");
const getExcelData = require("../controller/getExcelData");
const deleteExcelData = require("../controller/deleteExcelData");


excelRouter.post(
    "/saveExcelData",
    authMiddleware,
    saveExcelData
);


excelRouter.get(
    "/getExcelData",
    authMiddleware,
    getExcelData
);

excelRouter.delete(
    "/deleteExcelData",
    authMiddleware,
    deleteExcelData
);

module.exports = excelRouter;
