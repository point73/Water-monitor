// src/components/MapDashboard.jsx

import React, { useEffect, useRef } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from 'leaflet';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import "leaflet/dist/leaflet.css";
import '../styles/components.css';

// 환경변수에서 지도 설정 가져오기
const MAP_CENTER_LAT = parseFloat(import.meta.env.VITE_MAP_CENTER_LAT) || 36.6099760003;
const MAP_CENTER_LNG = parseFloat(import.meta.env.VITE_MAP_CENTER_LNG) || 127.754672;
const MAP_DEFAULT_ZOOM = parseInt(import.meta.env.VITE_MAP_DEFAULT_ZOOM) || 8;
const CLUSTER_MAX_RADIUS = parseInt(import.meta.env.VITE_CLUSTER_MAX_RADIUS) || 50;
const CLUSTER_DISABLE_AT_ZOOM = parseInt(import.meta.env.VITE_CLUSTER_DISABLE_AT_ZOOM) || 15;

// WQI 점수에 따라 아이콘 색상을 반환하는 함수
const getIconColor = (wqi) => {
  if (wqi <= 50) return '#F56565'; // 나쁨 (빨강)
  if (wqi <= 75) return '#F59E0B'; // 보통 (주황)
  return '#3498db'; // 좋음 (파랑)
};

// WQI 점수에 따라 동적으로 SVG 아이콘을 생성하는 함수
const createCustomIcon = (wqi) => {
  const color = getIconColor(wqi);
  const iconHtml = `
    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <path fill="${color}" d="M16 0c-5.523 0-10 4.477-10 10 0 7.086 8.188 16.223 9.375 17.625.328.38.922.38 1.25 0C17.812 26.223 26 17.086 26 10c0-5.523-4.477-10-10-10zm0 15c-2.761 0-5-2.239-5-5s2.239-5 5-5 5 2.239 5 5-2.239 5-5 5z"/>
      <circle fill="white" cx="16" cy="10" r="3"/>
    </svg>
  `;
  return L.divIcon({
    html: iconHtml,
    className: 'custom-svg-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};


// 마커 클러스터링을 처리하는 컴포넌트
function MarkerClusterComponent({ deviceListData, onRegionClick }) {
  const map = useMap();
  const clusterGroupRef = useRef(null);

  useEffect(() => {
    if (!map || !Array.isArray(deviceListData)) return;

    if (clusterGroupRef.current) {
      map.removeLayer(clusterGroupRef.current);
    }

    const markerClusterGroup = L.markerClusterGroup({
      maxClusterRadius: CLUSTER_MAX_RADIUS,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      disableClusteringAtZoom: CLUSTER_DISABLE_AT_ZOOM,
      iconCreateFunction: function(cluster) {
        const count = cluster.getChildCount();
        let className = 'custom-cluster-icon';
        if (count < 10) className += ' small green-cluster';
        else if (count < 100) className += ' medium';
        else className += ' large';

        return L.divIcon({
          html: `<div class="cluster-inner"><span>${count}</span></div>`,
          className: className,
          iconSize: count < 10 ? [30, 30] : count < 100 ? [40, 40] : [50, 50]
        });
      }
    });

    // 각 디바이스에 대해 WQI 점수에 맞는 아이콘으로 마커 생성
    deviceListData.forEach(device => {
      // WQI 점수가 없다면 임의의 값을 부여 (테스트용)
      const wqi = device.wqi || Math.floor(Math.random() * 81) + 20;
      const customIcon = createCustomIcon(wqi);
      
      const marker = L.marker([device.lat, device.lon], { icon: customIcon });
      
      marker.bindPopup(`
        <div>
          <strong style="font-size: 1.2em">${device.name}</strong> (WQI: ${wqi})<br/>
          <span style="font-size: 1.1em">위도: ${device.lat}</span><br/>
          <span style="font-size: 1.1em">경도: ${device.lon}</span>
        </div>
      `);
      
      marker.on('click', () => {
        if (onRegionClick) {
          onRegionClick({
            deviceId: device.deviceId,
            name: device.name,
            lat: device.lat,
            lng: device.lon,
          });
        }
      });

      markerClusterGroup.addLayer(marker);
    });

    map.addLayer(markerClusterGroup);
    clusterGroupRef.current = markerClusterGroup;

    return () => {
      if (clusterGroupRef.current) {
        map.removeLayer(clusterGroupRef.current);
      }
    };
  }, [map, deviceListData, onRegionClick]);

  return null;
}

function MapDashboard({
  onRegionClick,
  deviceListData,
  isDeviceListLoading,
}) {
  function ResizeMap() {
    const map = useMap();
    setTimeout(() => {
      map.invalidateSize();
    }, 0);
    return null;
  }

  if (isDeviceListLoading) {
    return (
      <div className="map-loading-container">
        지도 데이터 로딩 중...
      </div>
    );
  }

  return (
    <div className="map-dashboard-container">
      <MapContainer
        center={[MAP_CENTER_LAT, MAP_CENTER_LNG]}
        zoom={MAP_DEFAULT_ZOOM}
        scrollWheelZoom={true}
        wheelPxPerZoomLevel={120}
        style={{ height: "100%", width: "100%" }}
        className="custom-map-container"
        preferCanvas={true}
        renderer={L.canvas()}
      >
        <ResizeMap />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {Array.isArray(deviceListData) && (
          <MarkerClusterComponent 
            deviceListData={deviceListData} 
            onRegionClick={onRegionClick}
          />
        )}
      </MapContainer>
    </div>
  );
}

export default MapDashboard;
