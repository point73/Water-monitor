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
const customIcon = L.icon({
  iconUrl: '/marker.svg',
  iconSize: [24, 24],
  iconAnchor: [12, 24],
  popupAnchor: [0, -24],
});

// 마커 클러스터링을 처리하는 컴포넌트
function MarkerClusterComponent({ deviceListData, onRegionClick }) {
  const map = useMap();
  const clusterGroupRef = useRef(null);

  useEffect(() => {
    if (!map || !deviceListData) return;

    // 기존 클러스터 그룹이 있으면 제거
    if (clusterGroupRef.current) {
      map.removeLayer(clusterGroupRef.current);
    }

    // 새로운 마커 클러스터 그룹 생성
    const markerClusterGroup = L.markerClusterGroup({
      // 클러스터링 옵션 (환경변수 사용)
      maxClusterRadius: CLUSTER_MAX_RADIUS, // 클러스터링 반경
      spiderfyOnMaxZoom: true, // 최대 줌에서 마커들을 펼쳐서 표시
      showCoverageOnHover: false, // 호버시 클러스터 범위 표시 안함
      zoomToBoundsOnClick: true, // 클러스터 클릭시 줌인
      disableClusteringAtZoom: CLUSTER_DISABLE_AT_ZOOM, // 줌 레벨에서 클러스터링 해제
      
      // 클러스터 아이콘 커스터마이징
      iconCreateFunction: function(cluster) {
        const count = cluster.getChildCount();
        let className = 'custom-cluster-icon';
        let size = 'medium';
        
        if (count < 10) {
          className += ' small';
          size = 'small';
        } else if (count < 100) {
          className += ' medium';
          size = 'medium';
        } else {
          className += ' large';
          size = 'large';
        }

        return L.divIcon({
          html: `<div class="cluster-inner"><span>${count}</span></div>`,
          className: className,
          iconSize: size === 'small' ? [30, 30] : size === 'medium' ? [40, 40] : [50, 50]
        });
      }
    });

    // 각 디바이스에 대해 마커 생성
    deviceListData.forEach(device => {
      const marker = L.marker([device.lat, device.lon], { icon: customIcon });
      
      // 팝업 추가
      marker.bindPopup(`
        <div>
          <strong style="font-size: 1.2em">${device.name}</strong> (ID: ${device.deviceId})<br/>
          <span style="font-size: 1.1em">위도: ${device.lat}</span><br/>
          <span style="font-size: 1.1em">경도: ${device.lon}</span>
        </div>
      `);
      
      // 클릭 이벤트 추가
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

      // 클러스터 그룹에 마커 추가
      markerClusterGroup.addLayer(marker);
    });

    // 지도에 클러스터 그룹 추가
    map.addLayer(markerClusterGroup);
    clusterGroupRef.current = markerClusterGroup;

    // 클린업 함수
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
  deviceListHasError,
}) {
  function ResizeMap() {
    const map = useMap();
    setTimeout(() => {
      map.invalidateSize();
    }, 0);
    return null;
  }

  // 로딩 중일 때 표시할 UI
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
        
        {/* 마커 클러스터링 컴포넌트 */}
        {deviceListData && (
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