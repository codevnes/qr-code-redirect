const QRCode = require('../models/QRCode');

/**
 * Redirect to the destination URL
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.redirectToDestination = async (req, res) => {
  try {
    const shortId = req.params.shortId;
    
    // Find the QR code by short ID
    const qrCode = await QRCode.findOne({ shortId });
    
    if (!qrCode) {
      return res.status(404).send('QR code not found');
    }
    
    if (!qrCode.active) {
      return res.status(410).send('This QR code has been deactivated');
    }
    
    // Update visit count and last visited date
    await QRCode.findByIdAndUpdate(qrCode._id, {
      $inc: { visits: 1 },
      lastVisited: Date.now()
    });
    
    // Redirect to the destination URL
    res.redirect(qrCode.destinationUrl);
  } catch (error) {
    console.error('Error redirecting:', error);
    res.status(500).send('Server error');
  }
}; 