// Haversine formula to calculate distance (in meters) between two lat/lng
export function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000; // Radius of Earth in meters
  const toRad = (x) => (x * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// Given a list of known nodes, return the nearest one to clicked point
export function getNearestNode(lat, lng, nodes, threshold = 50) {
  let minDist = Infinity;
  let nearest = null;

  for (const [nodeLat, nodeLng] of nodes) {
    const dist = getDistance(lat, lng, nodeLat, nodeLng);
    if (dist < minDist && dist <= threshold) {
      minDist = dist;
      nearest = [nodeLat, nodeLng];
    }
  }

  return nearest;
}