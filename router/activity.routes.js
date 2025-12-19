const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const {
  getRecentActivity,
  getAllActivity,
} = require("../controller/activity.controller");

router.get("/recent", authMiddleware, getRecentActivity);
router.get("/", authMiddleware, getAllActivity);

module.exports = router;
