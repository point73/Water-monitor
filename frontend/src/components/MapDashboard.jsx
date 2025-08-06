// src/components/MapDashboard.jsx
import React from 'react';
import { MapContainer, TileLayer, Circle, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // Leaflet의 기본 CSS

function MapDashboard({ onRegionClick }) {
  function ResizeMap() {
    const map = useMap();
    setTimeout(() => {
      map.invalidateSize();
    }, 0);
    return null;
  }

  const positions = [
    {
      lat: 35.1595, lng: 126.8526, level: '위험', name: '광주',
      ph: 6.8, do: 3.2, bod: 4.5, cod: 5.1
    },
    {
      lat: 37.5665, lng: 126.9780, level: '주의', name: '서울',
      ph: 7.1, do: 5.0, bod: 3.1, cod: 3.8
    },
    {
      lat: 35.1796, lng: 129.0756, level: '정상', name: '부산',
      ph: 7.4, do: 6.5, bod: 2.2, cod: 2.7
    }
  ];

  const getColor = (level) => {
    switch (level) {
      case '위험': return 'red';
      case '주의': return 'orange';
      case '정상': return 'green';
      default: return 'gray';
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
      <MapContainer
        center={[36.5, 127.5]}
        zoom={7}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <ResizeMap />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {positions.map((pos, idx) => (
          <Circle
            key={idx}
            center={[pos.lat, pos.lng]}
            radius={5000}
            pathOptions={{ color: getColor(pos.level), fillOpacity: 0.3, weight: 2 }}
            eventHandlers={{
              click: () => {
                if (onRegionClick) onRegionClick(pos);
              }
            }}
          >
            <Popup>
              <strong>{pos.name}</strong> - {pos.level}
              <br />
              pH: {pos.ph}
              <br />
              DO: {pos.do}
            </Popup>
          </Circle>
        ))}
      </MapContainer>
    </div>
  );
}

export default MapDashboard;