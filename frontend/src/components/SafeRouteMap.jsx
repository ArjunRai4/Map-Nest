import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function SafeRouteMap() {
  const [start] = useState([12.9716, 77.5946]); // Bangalore center
  const [end] = useState([12.9765, 77.5995]);
  const [segments, setSegments] = useState([]);

  useEffect(() => {
    const fetchRoute = async () => {
      try {
        const res = await axios.get('/api/route/safe', {
          params: {
            startLat: start[0],
            startLng: start[1],
            endLat: end[0],
            endLng: end[1],
          },
        });
        setSegments(res.data.recommended);
      } catch (err) {
        console.error('Route fetch error:', err.message);
      }
    };

    fetchRoute();
  }, []);

  return (
    <MapContainer center={start} zoom={15} style={{ height: '90vh', width: '100%' }}>
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      />

      <Marker position={start}><Popup>Start</Popup></Marker>
      <Marker position={end}><Popup>End</Popup></Marker>

      {Array.isArray(segments) && segments.map((seg, i) => (
        <Polyline
          key={i}
          positions={seg.geometry.coordinates.map(([lng, lat]) => [lat, lng])}
          color={getColor(seg.safetyScore)}
        >
          <Popup>
            <b>{seg.name}</b><br />
            Score: {seg.safetyScore}
          </Popup>
        </Polyline>
      ))}
    </MapContainer>
  );
}

// color based on score
function getColor(score) {
  if (score > 75) return 'green';
  if (score > 50) return 'orange';
  return 'red';
}
