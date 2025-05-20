/**
 * Authentication middleware
 */

const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-very-strong-secret-key';

// Hardcoded admin credentials
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

/**
 * Basic authentication middleware
 */
exports.authenticate = (req, res, next) => {
  // Các đường dẫn không yêu cầu xác thực token
  const publicPaths = [
    '/login.html', 
    '/api/auth/login', 
    '/logo.png', 
    '/styles.css', 
    '/favicon.ico'
  ];
  // Các đường dẫn bắt đầu bằng /r/ (redirects) cũng không cần token
  if (publicPaths.includes(req.path) || req.path.startsWith('/r/') || req.path.startsWith('/js/') || req.path.startsWith('/css/')) {
    return next();
  }

  // Đối với các đường dẫn khác, yêu cầu xác thực bằng token
  return exports.authenticateToken(req, res, next);
};

/**
 * API Authentication middleware that allows redirect routes to pass through
 */
exports.apiAuthenticate = (req, res, next) => {
  // Allow redirect routes to pass through
  if (req.path.startsWith('/r/')) {
    return next();
  }
  
  // Use standard authentication for all other routes
  exports.authenticate(req, res, next);
};

/**
 * Login handler
 */
exports.login = (req, res) => {
  const { username, password } = req.body;
  
  // Check credentials
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    // Set authentication in session
    req.session.isAuthenticated = true;
    res.redirect('/');
  } else {
    res.render('login', { error: 'Invalid username or password' });
  }
};

/**
 * Logout handler
 */
exports.logout = (req, res) => {
  // Clear session
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
    }
    res.redirect('/login');
  });
};

// Middleware để xác thực token JWT
exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (token == null) {
    // Nếu là yêu cầu API, trả về lỗi JSON
    if (req.path.startsWith('/api/') || (req.headers.accept && req.headers.accept.includes('application/json'))) {
      return res.status(401).json({ success: false, message: 'Token không được cung cấp.' });
    }
    // Nếu là yêu cầu từ trình duyệt đến trang cần bảo vệ (không phải API), chuyển hướng đến trang đăng nhập
    return res.redirect('/login.html');
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error('Lỗi xác thực JWT:', err.message);
      // Token không hợp lệ hoặc hết hạn
      if (req.path.startsWith('/api/') || (req.headers.accept && req.headers.accept.includes('application/json'))) {
        return res.status(403).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn.' });
      }
      // Chuyển hướng đến đăng nhập nếu token lỗi khi truy cập trang
      return res.redirect('/login.html?sessionExpired=true'); 
    }
    req.user = user; // Gắn thông tin người dùng (payload của token) vào request
    next();
  });
}; 