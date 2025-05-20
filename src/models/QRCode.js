const mongoose = require('mongoose');

const QRCodeSchema = new mongoose.Schema({
  shortId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  destinationUrl: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  visits: {
    type: Number,
    default: 0
  },
  active: {
    type: Boolean,
    default: true
  },
  lastVisited: {
    type: Date
  },
  customQrOptions: {
    logo: {
      type: Boolean,
      default: true
    },
    color: {
      type: String,
      default: '#000000'
    },
    backgroundColor: {
      type: String,
      default: '#FFFFFF'
    }
  }
});

module.exports = mongoose.model('QRCode', QRCodeSchema); 