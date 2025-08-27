import React, { useEffect, useRef, useState, useMemo } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";
import "leaflet/dist/leaflet.css";
import "../styles/components.css";

// ====== 환경변수 ======
const MAP_CENTER_LAT =
  parseFloat(import.meta.env.VITE_MAP_CENTER_LAT) || 36.6099760003;
const MAP_CENTER_LNG =
  parseFloat(import.meta.env.VITE_MAP_CENTER_LNG) || 127.754672;
const MAP_DEFAULT_ZOOM =
  parseInt(import.meta.env.VITE_MAP_DEFAULT_ZOOM) || 8;
const CLUSTER_MAX_RADIUS =
  parseInt(import.meta.env.VITE_CLUSTER_MAX_RADIUS) || 50;
const CLUSTER_DISABLE_AT_ZOOM =
  parseInt(import.meta.env.VITE_CLUSTER_DISABLE_AT_ZOOM) || 15;
const API_BASE = import.meta.env.VITE_API_BASE || "";

// ====== 유틸 ======
const getIconColor = (wqi) => {
  if (wqi <= 50) return "#F56565"; // 나쁨
  if (wqi <= 75) return "#F59E0B"; // 보통
  return "#3498db"; // 좋음
};

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
    className: "custom-svg-icon",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

// ====== 클러스터 컴포넌트 ======
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
      iconCreateFunction: function (cluster) {
        const count = cluster.getChildCount();
        let className = "custom-cluster-icon";
        if (count < 10) className += " small green-cluster";
        else if (count < 100) className += " medium";
        else className += " large";

        return L.divIcon({
          html: `<div class="cluster-inner"><span>${count}</span></div>`,
          className: className,
          iconSize:
            count < 10 ? [30, 30] : count < 100 ? [40, 40] : [50, 50],
        });
      },
    });

    deviceListData.forEach((device) => {
      const wqi = device.wqi ?? Math.floor(Math.random() * 81) + 20;
      const customIcon = createCustomIcon(wqi);
      const marker = L.marker([device.lat, device.lon], { 
        icon: customIcon,
        deviceData: device 
      });

      // 클릭 시 나타나는 팝업
      marker.bindPopup(`
        <div>
          <strong style="font-size: 1.2em">${device.name}</strong> (WQI: ${wqi})<br/>
          <span style="font-size: 1.1em">하천: ${device.riverName ?? "-"}</span><br/>
          <span style="font-size: 1.1em">위도: ${device.lat}</span><br/>
          <span style="font-size: 1.1em">경도: ${device.lon}</span>
        </div>
      `);

      // 마우스 호버 시 나타나는 툴팁 추가
      marker.bindTooltip(device.name, {
        direction: 'top',
        sticky: true,
        offset: [0, -32],
        className: 'custom-marker-tooltip'
      });

      marker.on("click", () => {
        onRegionClick?.({
          deviceId: device.deviceId,
          name: device.name,
          lat: device.lat,
          lng: device.lon,
        });
      });

      markerClusterGroup.addLayer(marker);
    });

    // 클러스터 호버 기능
    markerClusterGroup.on('clustermouseover', (e) => {
      const markers = e.layer.getAllChildMarkers();
      const riverNameCounts = markers.reduce((acc, marker) => {
        const name = marker.options.deviceData?.riverName || '정보 없음';
        acc[name] = (acc[name] || 0) + 1;
        return acc;
      }, {});

      const sortedNames = Object.entries(riverNameCounts).sort((a, b) => b[1] - a[1]);
      
      let tooltipContent = '<div class="cluster-tooltip-content">';
      tooltipContent += '<strong>포함된 주요 하천</strong>';
      
      const topN = sortedNames.slice(0, 3);
      topN.forEach(([name, count]) => {
        tooltipContent += `<div>${name} (${count}개소)</div>`;
      });

      if (sortedNames.length > 3) {
        tooltipContent += `<div>... 외 ${sortedNames.length - 3}개</div>`;
      }
      tooltipContent += '</div>';
      
      e.layer.bindTooltip(tooltipContent, {
        direction: 'top',
        sticky: true,
        offset: [10, 0],
        className: 'custom-cluster-tooltip'
      }).openTooltip();
    });

    markerClusterGroup.on('clustermouseout', (e) => {
      e.layer.unbindTooltip();
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

// ====== 지도 리사이즈 ======
function ResizeMap() {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 0);
    return () => clearTimeout(t);
  }, [map]);
  return null;
}

// ====== 메인 컴포넌트 ======
function MapDashboard({
  onRegionClick,
  deviceListData = [],
  isDeviceListLoading,
  isTop5Mode,
  onShowAll,
  selectedDate,
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const abortRef = useRef(null);

  const filteredList = useMemo(() => {
    if (results && Array.isArray(results)) return results;
    if (!query.trim()) return deviceListData;
    const q = query.trim().toLowerCase();
    return deviceListData.filter((d) =>
      String(d.riverName ?? d.name ?? "").toLowerCase().includes(q)
    );
  }, [results, deviceListData, query]);
  
  if (isDeviceListLoading) {
    return <div className="map-loading-container">지도 데이터 로딩 중...</div>;
  }

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}년 ${month}월 ${day}일`;
  };

  return (
    <div className="map-card">
      <div className="map-header">
        <div className="map-title-section">
          <h2 className="map-title">
            {isTop5Mode
              ? `${formatDate(selectedDate)} 오염도 TOP 5`
              : "전국 오염 지도"}
          </h2>
          {isTop5Mode && (
            <button onClick={onShowAll} className="show-all-btn">
              전체 보기
            </button>
          )}
        </div>
        <div className="map-search">
          <input
            type="text"
            placeholder="하천 이름으로 검색..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="map-search-input"
          />
          <button disabled={isSearching} className="map-search-btn">
            {isSearching ? "검색중…" : "검색"}
          </button>
        </div>
      </div>
      <div className="map-container">
        <MapContainer
          center={[MAP_CENTER_LAT, MAP_CENTER_LNG]}
          zoom={MAP_DEFAULT_ZOOM}
          scrollWheelZoom={true}
          wheelPxPerZoomLevel={120}
          className="custom-map-container"
          preferCanvas={true}
          renderer={L.canvas()}
        >
          <ResizeMap />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {Array.isArray(filteredList) && (
            <MarkerClusterComponent
              deviceListData={filteredList}
              onRegionClick={onRegionClick}
            />
          )}
        </MapContainer>
      </div>
    </div>
  );
}

export default MapDashboard;
