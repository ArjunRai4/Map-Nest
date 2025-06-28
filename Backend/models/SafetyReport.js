const mongoose = require('mongoose');

const safetyReportSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  roadSegment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RoadSegment',
    required: true,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
    },
    coordinates: {
      type: [Number], // [lng, lat]
      required: true,
    },
  },
  type: {
    type: String,
    enum: ['accident', 'crime', 'road-damage', 'visibility', 'other'],
    default: 'other',
  },
  description: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    default: '',
  },
  aiTag: {
    type: String,
    default: '', // optional: populated by AI later (e.g., "critical", "minor", "safe")
  }
}, { timestamps: true });

// 2dsphere index for geospatial queries
safetyReportSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('SafetyReport', safetyReportSchema);
