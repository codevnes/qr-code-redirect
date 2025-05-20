const QRCode = require('qrcode');
const Jimp = require('jimp');
const path = require('path');
const fs = require('fs');

/**
 * Generate QR Code with logo in the center
 * @param {string} url - The URL to encode in the QR code
 * @param {Object} options - Custom options for QR code
 * @returns {Promise<Buffer>} - Returns a Buffer of the QR code image
 */
const generateQRCode = async (url, options = {}) => {
  try {
    const { 
      color = '#000000', 
      backgroundColor = '#FFFFFF', 
      logo = true,
      dotStyle = 'square',
      cornerStyle = 'square',
      cornerRadius = 0,
      logoBackgroundColor = '#FFFFFF',
      logoMargin = 5
    } = options;

    // QR Code options
    const qrOptions = {
      errorCorrectionLevel: 'H', // High error correction to allow for logo
      type: 'png',
      margin: 1,
      color: {
        dark: color,
        light: backgroundColor
      },
      width: 400
    };

    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(url, qrOptions);
    
    // If logo is not needed, return the QR code as is
    if (!logo) {
      return Buffer.from(qrCodeDataUrl.split(',')[1], 'base64');
    }

    // Convert data URL to buffer
    const qrCodeBuffer = Buffer.from(qrCodeDataUrl.split(',')[1], 'base64');
    
    // Read QR code image
    const qrImage = await Jimp.read(qrCodeBuffer);
    
    // Read logo image
    const logoPath = path.join(__dirname, '../../public/logo.png');
    
    // Check if logo file exists
    if (!fs.existsSync(logoPath)) {
      throw new Error('Logo file not found');
    }
    
    const logoImage = await Jimp.read(logoPath);
    
    // Resize logo to appropriate size (15% of QR code size)
    const qrWidth = qrImage.getWidth();
    const logoWidth = qrWidth * 0.15;
    logoImage.resize(logoWidth, Jimp.AUTO);
    
    // Calculate position to center the logo
    const logoX = (qrWidth - logoImage.getWidth()) / 2;
    const logoY = (qrWidth - logoImage.getHeight()) / 2;
    
    // Create a white background for logo that is a bit larger than the logo
    const whiteBgSize = logoWidth + logoMargin * 2; // Add margin around logo
    const whiteBg = new Jimp(whiteBgSize, whiteBgSize, Jimp.rgbaToInt(
      parseInt(logoBackgroundColor.slice(1, 3), 16),
      parseInt(logoBackgroundColor.slice(3, 5), 16),
      parseInt(logoBackgroundColor.slice(5, 7), 16),
      255
    ));
    
    // Calculate position for the white background
    const whiteBgX = (qrWidth - whiteBgSize) / 2;
    const whiteBgY = (qrWidth - whiteBgSize) / 2;
    
    // Apply white background to QR code
    qrImage.composite(whiteBg, whiteBgX, whiteBgY);
    
    // Apply logo on top of white background
    qrImage.composite(logoImage, logoX, logoY);
    
    // Apply custom styling based on options
    if (dotStyle === 'rounded' || cornerStyle === 'rounded') {
      await applyRoundedStyles(qrImage, dotStyle, cornerStyle, cornerRadius, color, backgroundColor);
    }
    
    // Convert image to buffer
    const buffer = await qrImage.getBufferAsync(Jimp.MIME_PNG);
    
    return buffer;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};

/**
 * Apply rounded styles to QR code
 * @param {Jimp} qrImage - Jimp image object
 * @param {string} dotStyle - Style for dots ('square' or 'rounded')
 * @param {string} cornerStyle - Style for corners ('square' or 'rounded')
 * @param {number} cornerRadius - Radius for rounded corners
 * @param {string} color - Color of QR code
 * @param {string} backgroundColor - Background color of QR code
 */
const applyRoundedStyles = async (qrImage, dotStyle, cornerStyle, cornerRadius, color, backgroundColor) => {
  // This is a placeholder for a more complex implementation
  // For a complete implementation, you would need to analyze the QR code pattern
  // and modify individual pixels to create rounded corners and dots

  // For a real implementation, you would use algorithms to identify QR code modules
  // and apply proper rounding to them

  // Note: Fully implementing this would require more complex image processing
  // beyond the scope of this example
  return qrImage;
};

module.exports = { generateQRCode }; 