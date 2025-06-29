import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { getNearestNode } from '../utils/geo';
import 'leaflet/dist/leaflet.css';

// Default marker icon fix for leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const SafetyMap = ({ userLocation, roads }) => {
  const [destination, setDestination] = useState(null);
  const [nodes, setNodes] = useState([]);

  useEffect(() => {
    // Extract all node coordinates from roads
    const uniqueNodes = new Set();
    roads.forEach((road) => {
      road.geometry.coordinates.forEach(([lng, lat]) => {
        uniqueNodes.add(`${lat},${lng}`);
      });
    });
    const nodeList = Array.from(uniqueNodes).map(str => str.split(',').map(Number));
    setNodes(nodeList);
  }, [roads]);

  // Component to handle map clicks
  const ClickHandler = () => {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        const nearest = getNearestNode(lat, lng, nodes);

        if (nearest) {
          setDestination({ lat: nearest[0], lng: nearest[1] });
        } else {
          alert('Please click near a known road');
        }
      }
    });
    return null;
  };

  return (
    <MapContainer center={userLocation} zoom={16} style={{ height: '100vh', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://osm.org/">OpenStreetMap</a> contributors'
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      />

      <ClickHandler />

      {/* Show user's location */}
      <Marker position={userLocation} />

      {/* Draw roads */}
      {roads.map((road, i) => (
        <Polyline
          key={i}
          positions={road.geometry.coordinates.map(([lng, lat]) => [lat, lng])}
          color={getColorByScore(road.safetyScore)}
        />
      ))}

      {/* Destination marker */}
      {destination && <Marker position={[destination.lat, destination.lng]} />}
    </MapContainer>
  );
};

// Utility: color based on safetyScore
function getColorByScore(score = 50) {
  if (score >= 80) return 'green';
  if (score >= 60) return 'orange';
  return 'red';
}

export default SafetyMap;
