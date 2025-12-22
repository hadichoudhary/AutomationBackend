const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const {
  getUserSchedules,
  updateSchedule,
  deleteSchedule,
} = require("../controller/schedule.controller");

router.get("/", authMiddleware, getUserSchedules);
router.put("/:id", authMiddleware, updateSchedule);
router.delete("/:id", authMiddleware, deleteSchedule);

module.exports = router;
