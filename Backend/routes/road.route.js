const express = require('express');
const router = express.Router();
const RoadSegment = require('../models/RoadSegment');

// Temporary route to insert dummy roads
router.post('/add-dummy', async (req, res) => {
  try {
    const segments = [
      {
        name: 'Main Street A-B',
        geometry: {
          type: 'LineString',
          coordinates: [
            [77.5946, 12.9716], // Start: [lng, lat]
            [77.5960, 12.9722], // End
          ],
        },
        roadCondition: 'average',
      },
      {
        name: 'Central Avenue C-D',
        geometry: {
          type: 'LineString',
          coordinates: [
            [77.5970, 12.9740],
            [77.5995, 12.9765],
          ],
        },
        roadCondition: 'good',
      },
    ];

    const created = await RoadSegment.insertMany(segments);
    res.status(201).json({ success: true, created });
  } catch (error) {
    console.error('Dummy road insert error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
