const SafetyReport = require('../models/SafetyReport');
const RoadSegment = require('../models/RoadSegment');

// POST /api/report
// Create a new safety report
const createReport = async (req, res) => {
  try {
    const { roadSegmentId, type, description, location } = req.body;

    if (!roadSegmentId || !description || !location?.coordinates) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const report = await SafetyReport.create({
      user: req.user.id,
      roadSegment: roadSegmentId,
      type,
      description,
      location: {
        type: 'Point',
        coordinates: location.coordinates,
      },
    });

    // Optionally add report to RoadSegment's reports[]
    await RoadSegment.findByIdAndUpdate(roadSegmentId, {
      $push: { reports: report._id },
    });

    res.status(201).json({ success: true, report });
  } catch (error) {
    console.error('Report creation error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/report/nearby
// Get all reports near a lat/lng (within 2km)
const getNearbyReports = async (req, res) => {
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ message: 'Coordinates are required' });
  }

  try {
    const reports = await SafetyReport.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: 2000, // meters
        },
      },
    }).populate('user', 'username').populate('roadSegment', 'name');

    res.status(200).json({ success: true, reports });
  } catch (error) {
    console.error('Error fetching nearby reports:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports={getNearbyReports,createReport};
