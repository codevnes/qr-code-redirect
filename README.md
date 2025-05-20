# QR Code Manager

A complete system for creating and managing QR codes with URL redirection capabilities.

## Features

- Create QR codes with custom colors and a logo in the center
- Manage all your QR codes in one place
- Update destination URLs without changing the QR code image
- Track visits and usage statistics for each QR code
- Download QR codes as PNG images
- Enable/disable QR codes without deleting them
- Responsive UI that works on desktop and mobile
- Admin authentication for secure access

## Authentication

The system uses Basic Authentication with hardcoded admin credentials:
- Username: `admin`
- Password: `admin123`

## How It Works

This application uses a URL redirection system that allows you to change the destination URL of a QR code without having to regenerate the QR code itself. Here's how it works:

1. When you create a QR code, the system generates a unique short ID.
2. The QR code itself points to a URL like `https://yourdomain.com/r/{shortId}`.
3. When someone scans the QR code, they are directed to this URL, which then redirects them to the actual destination URL.
4. You can update the destination URL at any time without changing the QR code.

## Installation

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4 or higher)

### Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/qr-code-manager.git
   cd qr-code-manager
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/qr-code-manager
   BASE_URL=http://localhost:5000
   ```
   
   In production, set your actual domain as the BASE_URL:
   ```
   BASE_URL=https://yourdomain.com
   ```

4. Start the server:
   ```
   npm start
   ```

5. For development with auto-reload:
   ```
   npm run dev
   ```

6. Visit `http://localhost:5000` in your browser.

## Security Considerations

For production use, you should:
1. Change the hardcoded admin credentials in `src/middleware/auth.js` to more secure values
2. Implement a proper authentication system with database-stored credentials
3. Use HTTPS for all connections
4. Consider adding rate limiting for API requests

## Deployment

To deploy this application in production:

1. Update the `.env` file with your production settings.
2. Set up a process manager like PM2 to keep the application running.
3. Configure a reverse proxy like Nginx to handle HTTPS and forward requests to the Node.js application.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [QRCode.js](https://github.com/soldair/node-qrcode) - For QR code generation
- [Jimp](https://github.com/oliver-moran/jimp) - For image processing
- [Bootstrap](https://getbootstrap.com/) - For UI components 