// src/components/MapDashboard.jsx

import React from "react";

import { MapContainer, TileLayer, Circle, Popup, useMap } from "react-leaflet";

import "leaflet/dist/leaflet.css"; // Leaflet의 기본 CSS

// deviceListData, isDeviceListLoading, deviceListHasError 프롭스 추가

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
  } // 지도에 표시될 원의 기본 색상

  const defaultCircleColor = "#3b82f6"; // 파란색 // 로딩 중일 때 표시할 UI

  if (isDeviceListLoading) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "8px",
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",

          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.2em",
          color: "#666",
        }}
      >
                지도 데이터 로딩 중...      {" "}
      </div>
    );
  } // 데이터 로딩이 끝난 후 (성공, 실패, 데이터 없음 모두 포함) 항상 지도를 렌더링합니다.

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        borderRadius: "8px",
        overflow: "hidden",
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
      }}
    >
           {" "}
      <MapContainer // 데이터가 성공적으로 로드되면 첫 번째 디바이스 위치로, 아니면 대한민국 중심으로 지도를 엽니다.
        center={[36.6099760003, 127.754672]}
        zoom={8}
        scrollWheelZoom={true}
        wheelPxPerZoomLevel={120} // 기본값은 60, 클수록 더 많이 스크롤해야 줌됨
        style={{ height: "100%", width: "100%" }}
      >
                <ResizeMap />
               {" "}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
                       {" "}
        {/* deviceListData가 있을 때만 Circle을 렌더링합니다. 

          '옵셔널 체이닝(?.')을 사용하여 deviceListData가 null이나 undefined일 때 에러가 발생하는 것을 방지합니다.

        */}
               {" "}
        {deviceListData?.map((device, idx) => (
          <Circle
            key={idx}
            radius={1000}
            center={[device.lat, device.lon]} // lat과 lon 사용
            pathOptions={{
              color: defaultCircleColor,
              fillOpacity: 0.5,
              weight: 3,
            }}
            eventHandlers={{
              click: () => {
                if (onRegionClick)
                  onRegionClick({
                    deviceId: device.deviceId,
                    name: device.name,
                    lat: device.lat,
                    lng: device.lon,
                  });
              },
            }}
          >
                      {" "}
            <Popup>
                           {" "}
              <strong style={{ fontSize: "1.2em" }}>{device.name}</strong> (ID:{" "}
              {device.deviceId})               <br />             {" "}
              <span style={{ fontSize: "1.1em" }}>위도: {device.lat}</span>
                            <br />             {" "}
              <span style={{ fontSize: "1.1em" }}>경도: {device.lon}</span>     
                   {" "}
            </Popup>
                     {" "}
          </Circle>
        ))}
             {" "}
      </MapContainer>
         {" "}
    </div>
  );
}

export default MapDashboard;
