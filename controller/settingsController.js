const User = require('../models/User');
const bcrypt = require('bcrypt');
const logActivity = require("../utils/logActivity");


const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userInfo.userId).select("-password");

    return res.status(200).json({
      success: true,
      message: 'Profile fetched successfully',
      data: user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching profile'
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({
        success: false,
        message: 'Name is required'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.userInfo.userId,
      { name: name.trim() },
      { new: true, runValidators: true }
    ).select("-password");

    await logActivity({
      userId: req.userInfo.userId,
      type: "PROFILE_UPDATED",
      title: "Profile information updated",
      metadata: {
        updatedField: "name",
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating profile'
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate inputs
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Get user with password
    const user = await User.findById(req.userInfo.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    user.password = hashedPassword;
    await user.save();

    await logActivity({
      userId: req.userInfo.userId,
      type: "PASSWORD_CHANGED",
      title: "Password changed successfully",
    });

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while changing password'
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword
};