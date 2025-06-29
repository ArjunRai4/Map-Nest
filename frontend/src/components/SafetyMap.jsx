import React, { useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axiosInstance from '../api/axiosInstance';
import { getDistance } from '../utils/geo';

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
});

function SafetyMap({ userLocation, roads }) {
  const [destination, setDestination] = useState(null);
  const [routePath, setRoutePath] = useState([]);
  const [totalCost, setTotalCost] = useState(null);

//   const [nodes, setNodes] = useState([]);

//   useEffect(() => {
//     // Extract all node coordinates from roads
//     const uniqueNodes = new Set();
//     roads.forEach((road) => {
//       road.geometry.coordinates.forEach(([lng, lat]) => {
//         uniqueNodes.add(`${lat},${lng}`);
//       });
//     });
//     const nodeList = Array.from(uniqueNodes).map(str => str.split(',').map(Number));
//     setNodes(nodeList);
//   }, [roads]);

//   // Component to handle map clicks
//   const ClickHandler = () => {
//     useMapEvents({
//       click(e) {
//         const { lat, lng } = e.latlng;
//         const nearest = getNearestNode(lat, lng, nodes);

//         if (nearest) {
//           setDestination({ lat: nearest[0], lng: nearest[1] });
//         } else {
//           alert('Please click near a known road');
//         }
//       }
//     });
//     return null;
//   };

  const handleMapClick = async (e) => {
    const { lat, lng } = e.latlng;

    // Snap to closest node on known road segments
    let nearest = null;
    let minDist = Infinity;

    roads.forEach(road => {
      road.geometry.coordinates.forEach(([lng2, lat2]) => {
        const dist = getDistance(lat, lng, lat2, lng2);
        if (dist < minDist && dist <= 100) { // 100 meters max snap distance
          minDist = dist;
          nearest = [lat2, lng2];
        }
      });
    });

    if (!nearest) {
      alert("Please click near a known road segment.");
      return;
    }

    setDestination(nearest);
    setRoutePath([]);
    setTotalCost(null);

    try {
      const res = await axiosInstance.get('/map/safest-path', {
        params: {
          userLat: userLocation[0],
          userLng: userLocation[1],
          destLat: nearest[0],
          destLng: nearest[1],
        },
      });

      setRoutePath(res.data.path);
      setTotalCost(res.data.totalCost);
    } catch (err) {
      console.error("Error fetching safest path:", err.message);
      alert("Could not fetch route. Please try again.");
    }
  };

  return (
    <MapContainer
      center={userLocation}
      zoom={16}
      style={{ height: '100vh', width: '100%' }}
      onClick={handleMapClick}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* User location marker */}
      <Marker position={userLocation}>
        <Popup>Your Location</Popup>
      </Marker>

      {/* Destination marker */}
      {destination && (
        <Marker position={destination}>
          <Popup>Destination</Popup>
        </Marker>
      )}

      {/* Road segments with safety colors */}
      {roads.map((road, idx) => (
        <Polyline
          key={idx}
          positions={road.geometry.coordinates.map(([lng, lat]) => [lat, lng])}
          color={
            road.safetyScore >= 75 ? 'green'
            : road.safetyScore >= 50 ? 'orange'
            : 'red'
          }
          weight={4}
        />
      ))}

      {/* Safest path polyline */}
      {routePath.length > 1 && (
        <Polyline
          positions={routePath}
          color="blue"
          weight={6}
        />
      )}

      {/* Route cost info (optional popup or UI section) */}
      {totalCost !== null && (
        <div style={{
          position: 'absolute',
          top: 10,
          left: 10,
          backgroundColor: 'white',
          padding: '8px 12px',
          borderRadius: '8px',
          boxShadow: '0 0 5px rgba(0,0,0,0.2)',
          zIndex: 1000
        }}>
          <strong>Safest Route Score:</strong> {100 - totalCost}
        </div>
      )}
    </MapContainer>
  );
}

export default SafetyMap;
