const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import routes
const qrRoutes = require('./routes/qrRoutes');
const redirectRoutes = require('./routes/redirectRoutes');
const authRoutes = require('./routes/authRoutes');
const authMiddleware = require('./middleware/auth');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Các route công khai (không yêu cầu xác thực)-----------------------------------
// Trang đăng nhập
app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'login.html'));
});

// API đăng nhập
app.use('/api/auth', authRoutes);

// Route chuyển hướng
app.use('/r', redirectRoutes);

// Logo - cho phép truy cập công khai để hiển thị trên trang đăng nhập và các nơi khác
app.get('/logo.png', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/logo.png'));
});
app.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/favicon.ico'));
});

// Phục vụ các tệp tĩnh CSS, JS công khai khác nếu có
app.use(express.static(path.join(__dirname, '../public')));

// Middleware xác thực chung cho tất cả các route còn lại ----------------------
app.use(authMiddleware.authenticate);

// Các route yêu cầu xác thực ---------------------------------------------------
// API QR code (đã được bảo vệ bởi authMiddleware.authenticate ở trên)
app.use('/api/qr', qrRoutes);

// Serve frontend (index.html) cho các route đã xác thực
// Phải nằm sau middleware xác thực
app.get('*', (req, res) => {
  // Nếu người dùng đã xác thực, gửi index.html
  // Middleware `authMiddleware.authenticate` sẽ xử lý chuyển hướng nếu chưa xác thực
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Database connection
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/qr-code-manager')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 