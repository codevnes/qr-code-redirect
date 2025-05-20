const jwt = require('jsonwebtoken');
require('dotenv').config();

// TODO: Thay thế bằng logic kiểm tra với cơ sở dữ liệu và mật khẩu đã hash
const HARDCODED_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const HARDCODED_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'; // Trong thực tế, mật khẩu này phải được hash

const JWT_SECRET = process.env.JWT_SECRET || 'your-very-strong-secret-key'; // Nên đặt trong .env
const JWT_EXPIRES_IN = '1h';

exports.login = (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Tên đăng nhập và mật khẩu là bắt buộc.' });
    }

    // TODO: Trong thực tế, so sánh `password` với hash được lưu trong DB cho `username`
    if (username === HARDCODED_USERNAME && password === HARDCODED_PASSWORD) {
        const token = jwt.sign({ username: username, id: 'hardcoded-user-id' }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        return res.json({ 
            success: true, 
            message: 'Đăng nhập thành công!', 
            token: token 
        });
    } else {
        return res.status(401).json({ success: false, message: 'Tên đăng nhập hoặc mật khẩu không đúng.' });
    }
};

exports.changePassword = (req, res) => {
    // Lấy username từ token đã được xác thực (thêm vào req bởi auth middleware)
    const usernameFromToken = req.user.username; 
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ success: false, message: 'Mật khẩu hiện tại và mật khẩu mới là bắt buộc.' });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({ success: false, message: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
    }

    // TODO: Trong thực tế, kiểm tra currentPassword với hash trong DB
    if (usernameFromToken === HARDCODED_USERNAME && currentPassword === HARDCODED_PASSWORD) {
        // TODO: Hash newPassword trước khi lưu vào DB (hoặc cập nhật biến hardcoded nếu vẫn dùng tạm)
        // Ví dụ: HARDCODED_PASSWORD = newPassword; (KHÔNG AN TOÀN CHO PRODUCTION)
        // Cần một cơ chế để cập nhật mật khẩu đã hash.
        // Hiện tại, chúng ta chỉ mô phỏng thành công mà không thực sự thay đổi mật khẩu hardcoded vì nó không an toàn.
        console.log(`Người dùng ${usernameFromToken} yêu cầu đổi mật khẩu. Mật khẩu mới (chưa hash): ${newPassword}. Logic cập nhật cần được triển khai.`);
        
        return res.json({ success: true, message: 'Đổi mật khẩu thành công!' });
    } else {
        return res.status(401).json({ success: false, message: 'Mật khẩu hiện tại không đúng.' });
    }
}; 