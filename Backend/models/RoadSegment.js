const mongoose = require('mongoose');

const roadSegmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  geometry: {
    type: {
      type: String,
      enum: ['LineString'],
      required: true,
    },
    coordinates: {
      type: [[Number]], // Array of [lng, lat] points
      required: true,
    },
  },
  roadCondition: {
    type: String,
    enum: ['good', 'average', 'bad'],
    default: 'average',
  },
  safetyScore: {
    type: Number, // calculated by AI or users
    default: 50, // 0 (very unsafe) → 100 (very safe)
  },
  reports: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SafetyReport',
    },
  ],
}, { timestamps: true });

// Geospatial index
roadSegmentSchema.index({ geometry: '2dsphere' });

module.exports = mongoose.model('RoadSegment', roadSegmentSchema);
