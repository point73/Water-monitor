// src/components/MapDashboard.jsx
import React from 'react';
import { MapContainer, TileLayer, Circle, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // Leaflet의 기본 CSS

// deviceListData, isDeviceListLoading, deviceListHasError 프롭스 추가
function MapDashboard({ onRegionClick, deviceListData, isDeviceListLoading, deviceListHasError }) {
  function ResizeMap() {
    const map = useMap();
    setTimeout(() => {
      map.invalidateSize();
    }, 0);
    return null;
  }

  // 지도에 표시될 원의 기본 색상 (데이터에 level 정보가 없으므로 통일)
  const defaultCircleColor = '#3b82f6'; // 파란색

  if (isDeviceListLoading) {
    return (
      <div style={{
        width: '100%', height: '100%', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2em', color: '#666'
      }}>
        지도 데이터 로딩 중...
      </div>
    );
  }

  if (deviceListHasError || !deviceListData || deviceListData.length === 0) {
    return (
      <div style={{
        width: '100%', height: '100%', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2em', color: 'red'
      }}>
        지도 데이터를 불러오는데 실패했거나 데이터가 없습니다.
      </div>
    );
  }

  // 유효한 디바이스 데이터가 있을 때만 지도를 렌더링합니다.
  return (
    <div style={{ width: '100%', height: '100%', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
      <MapContainer
        // 첫 번째 디바이스의 좌표를 기본 지도의 중심점으로 사용하거나, 기본값 설정
        center={deviceListData.length > 0 ? [deviceListData[0].lat, deviceListData[0].lon] : [36.5, 127.5]}
        zoom={7}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <ResizeMap />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* deviceListData를 사용하여 동적으로 원을 그립니다. */}
        {deviceListData.map((device, idx) => (
          <Circle
            key={idx}
            radius={1000} // 원의 크기를 10000에서 2000으로 많이 줄였습니다.
            center={[device.lat, device.lon]} // lat과 lon 사용
            pathOptions={{ color: defaultCircleColor, fillOpacity: 0.5, weight: 3 }}
            eventHandlers={{
              click: () => {
                // 클릭 시 해당 디바이스의 name, lat, lon을 전달합니다.
                if (onRegionClick) onRegionClick({deviceId: device.deviceId, name: device.name, lat: device.lat, lng: device.lon });
              }
            }}
          >
            <Popup>
              <strong style={{ fontSize: '1.2em' }}>{device.name}</strong> (ID: {device.deviceId})
              <br />
              <span style={{ fontSize: '1.1em' }}>위도: {device.lat}</span>
              <br />
              <span style={{ fontSize: '1.1em' }}>경도: {device.lon}</span>
            </Popup>
          </Circle>
        ))}
      </MapContainer>
    </div>
  );
}

export default MapDashboard;
