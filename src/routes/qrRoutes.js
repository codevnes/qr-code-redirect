const express = require('express');
const qrController = require('../controllers/qrController');

const router = express.Router();

// Routes for QR code operations
router.post('/', qrController.createQRCode);
router.get('/', qrController.getAllQRCodes);
router.get('/:id', qrController.getQRCodeById);
router.put('/:id', qrController.updateQRCode);
router.delete('/:id', qrController.deleteQRCode);
router.post('/delete-multiple', qrController.deleteMultipleQRCodes);
router.get('/:id/download', qrController.downloadQRCode);

module.exports = router; 