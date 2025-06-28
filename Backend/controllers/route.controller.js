const RoadSegment = require('../models/RoadSegment');
const { buildRoadGraph } = require('../utils/graphBuilder');
const { dijkstra } = require('../utils/dijkstra');


// GET /api/route/safest-path?startLat=...&startLng=...&endLat=...&endLng=...
const getSafestRoute = async (req, res) => {
  const { startLat, startLng, endLat, endLng } = req.query;

  if (!startLat || !startLng || !endLat || !endLng) {
    return res.status(400).json({ message: 'Missing coordinates' });
  }

  const start = `${parseFloat(startLat).toFixed(6)},${parseFloat(startLng).toFixed(6)}`;
  const end = `${parseFloat(endLat).toFixed(6)},${parseFloat(endLng).toFixed(6)}`;

  try {
    const segments = await RoadSegment.find({});
    const graph = buildRoadGraph(segments);
    const { path, totalCost } = dijkstra(graph, start, end);

    const pathCoords = path.map(p => {
      const [lat, lng] = p.split(',').map(Number);
      return [lat, lng];
    });

    res.status(200).json({ success: true, path: pathCoords, totalCost });
  } catch (err) {
    console.error('Routing error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};


// GET /api/route/safe?startLat=12.97&startLng=77.59&endLat=12.99&endLng=77.60
const suggestSafeRoute = async (req, res) => {
  const { startLat, startLng, endLat, endLng } = req.query;

  if (!startLat || !startLng || !endLat || !endLng) {
    return res.status(400).json({ message: 'Start and end coordinates are required' });
  }

  try {
    // Find nearby segments around start and end (within 500m)
    const nearbyStart = await RoadSegment.find({
      geometry: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(startLng), parseFloat(startLat)] },
          $maxDistance: 500,
        },
      },
    }).limit(5);

    const nearbyEnd = await RoadSegment.find({
      geometry: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(endLng), parseFloat(endLat)] },
          $maxDistance: 500,
        },
      },
    }).limit(5);

    // Collect all road segments and sort by safetyScore descending
    const all = await RoadSegment.find().sort({ safetyScore: -1 }).limit(20);

    if (!Array.isArray(all)) {
      console.warn('Expected "all" to be an array, but got:', all);
    }

    res.status(200).json({
      success: true,
      startMatches: nearbyStart || [],
      endMatches: nearbyEnd || [],
      recommended: all || [],
    });
  } catch (error) {
    console.error('Route suggestion error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { suggestSafeRoute,getSafestRoute };
