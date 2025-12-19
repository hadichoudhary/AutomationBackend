const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");

const verifyRouter = express.Router();

verifyRouter.get("/verify-token", authMiddleware, (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Token is valid",
    user: req.user
  });
});

module.exports = verifyRouter;
