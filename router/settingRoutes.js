const express = require('express');
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");

const {
  getProfile,
  updateProfile,
  changePassword
} = require('../controller/settingsController');


router.get('/profile', authMiddleware, getProfile);


router.put('/profile', authMiddleware, updateProfile);

router.put('/change-password', authMiddleware, changePassword);

module.exports = router;