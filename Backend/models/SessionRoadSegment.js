const mongoose = require('mongoose');

const sessionRoadSegmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  geometry: {
    type: {
      type: String,
      enum: ['LineString'],
      required: true,
    },
    coordinates: {
      type: [[Number]], // array of [lng, lat]
      required: true,
    },
  },
  safetyScore: {
    type: Number,
    default: 50,
  },
  aiTag: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600, // auto-delete after 1 hour (optional)
  }
});

module.exports = mongoose.model('SessionRoadSegment', sessionRoadSegmentSchema);
