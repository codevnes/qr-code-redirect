const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth'); // Sẽ cập nhật middleware này sau

const router = express.Router();

// @route   POST /api/auth/login
// @desc    Đăng nhập người dùng và trả về token
// @access  Public
router.post('/login', authController.login);

// @route   POST /api/auth/change-password
// @desc    Thay đổi mật khẩu người dùng
// @access  Private (yêu cầu xác thực bằng token)
router.post('/change-password', authMiddleware.authenticateToken, authController.changePassword);

module.exports = router; 