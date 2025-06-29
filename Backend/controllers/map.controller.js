// This function takes an array of road segments and returns a unique list of nodes

const { getDistance } = require("../utils/geo");
const SessionRoadSegment = require('../models/SessionRoadSegment');
const { getSeverityFromAI } = require('../utils/aiSafetyEngine');

// TEMP: Static road data for now (replace later with OSM or geospatial fetch)
const mockRoads = [
  {
    name: "Main Street A-B",
    geometry: {
      type: "LineString",
      coordinates: [
        [77.5946, 12.9716],
        [77.5960, 12.9722],
      ]
    },
    roadCondition: "average"
  },
  {
    name: "MG Road",
    geometry: {
      type: "LineString",
      coordinates: [
        [77.5970, 12.9740],
        [77.5995, 12.9765],
      ]
    },
    roadCondition: "bad"
  }
];

const initMapSession = async (req, res) => {
  try {
    const { lat, lng } = req.body;

    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    // Clear old session data
    await SessionRoadSegment.deleteMany({ user: req.user.id });

    const toSave = [];

    for (const road of mockRoads) {
      const roadText = `${road.name} road, condition: ${road.roadCondition}`;
      const { aiTag, scoreImpact } = await getSeverityFromAI(roadText);

      const baseScore = 50; // base safety
      const safetyScore = Math.min(Math.max(baseScore + scoreImpact, 0), 100);

      toSave.push({
        user: req.user.id,
        geometry: road.geometry,
        safetyScore,
        aiTag,
      });
    }

    await SessionRoadSegment.insertMany(toSave);

    res.status(200).json({ success: true, message: 'Map initialized with AI scores' });

  } catch (err) {
    console.error('Map init error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Each node is represented as an array [lat, lng]
function extractGraphNodes(segments){
    const set=new Set();
    segments.forEach(seg=>{
        seg.geometry.coordinates.forEach(([lng, lat])=>{
            set.add(`${lat},${lng}`);
        });
    });
    return Array.from(set).map(str => str.split(',').map(Number));
}

//snap latt/lng to nearest node
function snapToNearestNode(lat, lng, nodes,threshold=0.001) {
    let nearest = null;
    let minDist = Infinity;

    for(const [nodeLat, nodeLng] of nodes) {
        const dist=getDistance(lat, lng, nodeLat, nodeLng);
        if (dist < minDist && dist <= threshold) {
            minDist = dist;
            nearest = [nodeLat, nodeLng];
        }
    }
    return nearest;
}

//Main controller
const getSafestPath=async(req,res)=>{
    try {
        const {destLat,destLng,userLat,userLng} = req.query;

        if (!destLat || !destLng || !userLat || !userLng) {
            return res.status(400).json({ message: 'Missing required coordinates' });
        }
        const segments=await SessionRoadSegment.find({user:req.user.id});

        if (!segments.length) {
      return res.status(404).json({ message: 'No map data for user' });
    }

    // Extract and build graph
    const nodes = extractGraphNodes(segments);

    const start = snapToNearestNode(parseFloat(userLat), parseFloat(userLng), nodes);
    const end = snapToNearestNode(parseFloat(destLat), parseFloat(destLng), nodes);

    if (!start || !end) {
      return res.status(400).json({ message: 'Destination or source is too far from known roads' });
    }

    const graph = {}; // adjacency list
    segments.forEach(seg => {
      const coords = seg.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
      for (let i = 0; i < coords.length - 1; i++) {
        const [lat1, lng1] = coords[i];
        const [lat2, lng2] = coords[i + 1];
        const key1 = `${lat1},${lng1}`;
        const key2 = `${lat2},${lng2}`;
        const cost = 100 - (seg.safetyScore || 50); // safer = lower cost
        if (!graph[key1]) graph[key1] = [];
        if (!graph[key2]) graph[key2] = [];
        graph[key1].push({ to: key2, cost });
        graph[key2].push({ to: key1, cost }); // bidirectional
      }
    });

    const { path, totalCost } = dijkstra(graph, `${start[0]},${start[1]}`, `${end[0]},${end[1]}`);

    const latLngPath = path.map(str => str.split(',').map(Number));

    res.status(200).json({
      success: true,
      path: latLngPath,
      totalCost,
    });
    
    } catch (error) {
        console.error('Error occurred while getting safest path:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = { getSafestPath, initMapSession };