const QRCode = require('../models/QRCode');
const { generateQRCode } = require('../utils/qrGenerator');
const { generateShortId } = require('../utils/shortIdGenerator');

/**
 * Create a new QR code
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createQRCode = async (req, res) => {
  try {
    const { destinationUrl, title, customQrOptions } = req.body;
    
    if (!destinationUrl || !title) {
      return res.status(400).json({ success: false, message: 'Destination URL and title are required' });
    }
    
    // Generate a unique short ID
    let shortId = generateShortId();
    let existingQRCode = await QRCode.findOne({ shortId });
    
    // Keep generating until we find a unique one
    while (existingQRCode) {
      shortId = generateShortId();
      existingQRCode = await QRCode.findOne({ shortId });
    }
    
    // Create the QR code in the database
    const newQRCode = new QRCode({
      shortId,
      destinationUrl,
      title,
      ...(customQrOptions && { customQrOptions })
    });
    
    await newQRCode.save();
    
    // Generate the actual QR code image that points to our redirect URL
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    const qrUrl = `${baseUrl}/r/${shortId}`;
    
    const qrCodeOptions = customQrOptions || {};
    const qrCodeBuffer = await generateQRCode(qrUrl, qrCodeOptions);
    
    res.status(201).json({
      success: true,
      data: {
        qrCode: newQRCode,
        qrCodeImage: `data:image/png;base64,${qrCodeBuffer.toString('base64')}`,
        redirectUrl: qrUrl
      }
    });
  } catch (error) {
    console.error('Error creating QR code:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * Get all QR codes
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAllQRCodes = async (req, res) => {
  try {
    const qrCodes = await QRCode.find().sort({ createdAt: -1 });
    
    // Generate the QR code images for each QR code
    const qrCodesWithImages = await Promise.all(
      qrCodes.map(async (qrCode) => {
        const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
        const qrUrl = `${baseUrl}/r/${qrCode.shortId}`;
        
        const qrCodeBuffer = await generateQRCode(qrUrl, qrCode.customQrOptions);
        
        return {
          ...qrCode.toObject(),
          qrCodeImage: `data:image/png;base64,${qrCodeBuffer.toString('base64')}`,
          redirectUrl: qrUrl
        };
      })
    );
    
    res.status(200).json({ success: true, data: qrCodesWithImages });
  } catch (error) {
    console.error('Error getting QR codes:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * Get a single QR code by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getQRCodeById = async (req, res) => {
  try {
    const qrCode = await QRCode.findById(req.params.id);
    
    if (!qrCode) {
      return res.status(404).json({ success: false, message: 'QR code not found' });
    }
    
    // Generate the QR code image
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    const qrUrl = `${baseUrl}/r/${qrCode.shortId}`;
    
    const qrCodeBuffer = await generateQRCode(qrUrl, qrCode.customQrOptions);
    
    res.status(200).json({
      success: true,
      data: {
        ...qrCode.toObject(),
        qrCodeImage: `data:image/png;base64,${qrCodeBuffer.toString('base64')}`,
        redirectUrl: qrUrl
      }
    });
  } catch (error) {
    console.error('Error getting QR code:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * Update a QR code
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateQRCode = async (req, res) => {
  try {
    const { destinationUrl, title, active, customQrOptions } = req.body;
    
    // Update the QR code
    const updatedQRCode = await QRCode.findByIdAndUpdate(
      req.params.id,
      {
        ...(destinationUrl && { destinationUrl }),
        ...(title && { title }),
        ...(active !== undefined && { active }),
        ...(customQrOptions && { customQrOptions })
      },
      { new: true, runValidators: true }
    );
    
    if (!updatedQRCode) {
      return res.status(404).json({ success: false, message: 'QR code not found' });
    }
    
    // Generate the updated QR code image
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    const qrUrl = `${baseUrl}/r/${updatedQRCode.shortId}`;
    
    const qrCodeBuffer = await generateQRCode(qrUrl, updatedQRCode.customQrOptions);
    
    res.status(200).json({
      success: true,
      data: {
        ...updatedQRCode.toObject(),
        qrCodeImage: `data:image/png;base64,${qrCodeBuffer.toString('base64')}`,
        redirectUrl: qrUrl
      }
    });
  } catch (error) {
    console.error('Error updating QR code:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * Delete a QR code
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deleteQRCode = async (req, res) => {
  try {
    const deletedQRCode = await QRCode.findByIdAndDelete(req.params.id);
    
    if (!deletedQRCode) {
      return res.status(404).json({ success: false, message: 'QR code not found' });
    }
    
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    console.error('Error deleting QR code:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * Delete multiple QR codes
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deleteMultipleQRCodes = async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'No IDs provided' });
    }
    
    const result = await QRCode.deleteMany({ _id: { $in: ids } });
    
    res.status(200).json({ 
      success: true, 
      data: {
        deletedCount: result.deletedCount
      } 
    });
  } catch (error) {
    console.error('Error deleting multiple QR codes:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * Download QR code as image
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.downloadQRCode = async (req, res) => {
  try {
    const qrCode = await QRCode.findById(req.params.id);
    
    if (!qrCode) {
      return res.status(404).json({ success: false, message: 'QR code not found' });
    }
    
    // Generate the QR code image
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    const qrUrl = `${baseUrl}/r/${qrCode.shortId}`;
    
    const qrCodeBuffer = await generateQRCode(qrUrl, qrCode.customQrOptions);
    
    // Set response headers for file download
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename=qr-code-${qrCode.shortId}.png`);
    
    // Send the QR code image
    res.send(qrCodeBuffer);
  } catch (error) {
    console.error('Error downloading QR code:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
}; 