const express = require('express');
const redirectController = require('../controllers/redirectController');

const router = express.Router();

// Route for redirecting QR codes
router.get('/:shortId', redirectController.redirectToDestination);

module.exports = router; 