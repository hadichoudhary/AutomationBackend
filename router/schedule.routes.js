const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const {
  getUserSchedules,
  updateScheduleTopic,
  deleteSchedule,
} = require("../controller/schedule.controller");

router.get("/", authMiddleware, getUserSchedules);
router.put("/:id", authMiddleware, updateScheduleTopic);
router.delete("/:id", authMiddleware, deleteSchedule);

module.exports = router;
