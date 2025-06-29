const haversine = require('haversine-distance');

// Converts GeoJSON LineString to a bidirectional graph
function buildRoadGraph(segments) {
  const graph = {};

  for (const seg of segments) {
    const coords = seg.geometry.coordinates;
    if (coords.length !== 2) continue; // only 2-point segments supported for now

    const [lng1, lat1] = coords[0];
    const [lng2, lat2] = coords[1];

    const pointA = `${lat1.toFixed(6)},${lng1.toFixed(6)}`;
    const pointB = `${lat2.toFixed(6)},${lng2.toFixed(6)}`;

    const distance = haversine([lat1, lng1], [lat2, lng2]) / 1000; // in km
    const score = seg.safetyScore ?? 50;
    const dangerPenalty = (100 - score) / 100;
    const cost = distance + dangerPenalty;

    if (!graph[pointA]) graph[pointA] = [];
    if (!graph[pointB]) graph[pointB] = [];

    graph[pointA].push({ to: pointB, cost });
    graph[pointB].push({ to: pointA, cost }); // undirected

    console.log("Added edge from", pointA, "to", pointB, "with cost", cost);
  }

  return graph;
}

module.exports = { buildRoadGraph };
