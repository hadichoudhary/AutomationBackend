const express = require("express");
const router = express.Router();
const { sendPrompt } = require("../controller/promptController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/send", authMiddleware, sendPrompt);

module.exports = router;
