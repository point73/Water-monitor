import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function getColorIcon(prediction) {
  const color = prediction === '정상' ? '00cc00' : prediction === '주의' ? 'ffaa00' : 'ff0000';
  return new L.Icon({
    iconUrl: `https://chart.googleapis.com/chart?chst=d_map_pin_icon&chld=warning|${color}`,
    iconSize: [40, 50], // 마커 크기 확대
    iconAnchor: [20, 50],
    popupAnchor: [0, -50],
  });
}


function MapDashboard() {
  const [sensorList, setSensorList] = useState([]);
  const prevSensorMap = useRef(new Map());

  useEffect(() => {
    const dummyDataList = [
      [
        { region: "서울", lat: 37.5665, lng: 126.9780, prediction: "정상" },
        { region: "부산", lat: 35.1796, lng: 129.0756, prediction: "정상" },
        { region: "광주", lat: 35.1595, lng: 126.8526, prediction: "주의" },
      ],
      [
        { region: "서울", lat: 37.5665, lng: 126.9780, prediction: "주의" },  // 변경
        { region: "부산", lat: 35.1796, lng: 129.0756, prediction: "정상" },
        { region: "광주", lat: 35.1595, lng: 126.8526, prediction: "위험" },  // 변경
      ],
    ];
    let index = 0;

    const fetchData = () => {
      const newData = dummyDataList[index % dummyDataList.length];

      newData.forEach((item) => {
        const prev = prevSensorMap.current.get(item.region);
        if (prev && prev !== item.prediction) {
          alert(`⚠️ ${item.region} 지역 예측이 '${prev}' → '${item.prediction}'로 변경되었습니다!`);
          console.log(`🔄 ${item.region} 변경 감지: ${prev} → ${item.prediction}`);
        }
        prevSensorMap.current.set(item.region, item.prediction);
      });

      setSensorList(newData);
      index++;
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ textAlign: 'center', color: '#00d5ff' }}>전국 수질 예측 지도</h2>
      <div style={{ height: '600px', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <MapContainer center={[36.5, 127.5]} zoom={7} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          {sensorList.map((item) => (
            <Marker
              key={item.region + item.prediction} // ← 여기만 변경
              position={[item.lat, item.lng]}
              icon={getColorIcon(item.prediction)}
            >
              <Popup>
                <b>{item.region}</b><br />
                예측: {item.prediction}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

export default MapDashboard;
