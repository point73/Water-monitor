// src/components/AnomalyDetection.jsx
import React, { useState, useEffect } from 'react';
import '../styles/components.css';

function AnomalyDetection({ deviceListData = [] }) {
  const [rankedStations, setRankedStations] = useState([]);

  useEffect(() => {
    let list = [];

    // 다양한 형태의 deviceListData를 배열로 일관되게 처리
    if (Array.isArray(deviceListData)) {
      list = deviceListData;
    } else if (deviceListData && typeof deviceListData === 'object') {
      list = Object.values(deviceListData);
    } else {
      setRankedStations([]);
      return;
    }

    if (list.length === 0) {
      setRankedStations([]);
      return;
    }

    // 각 측정소에 20~100 사이의 랜덤 WQI 점수 할당
    const stationsWithWqi = list.map((device) => ({
      ...device,
      wqi: Math.floor(Math.random() * 81) + 20,
    }));

    // WQI 점수가 낮은 순서(취약한 순서)대로 정렬
    const sortedStations = stationsWithWqi
      .slice()
      .sort((a, b) => a.wqi - b.wqi);

    // 상위 3개 측정소만 선택
    setRankedStations(sortedStations.slice(0, 3));
  }, [deviceListData]);

  // WQI 점수에 따라 색상을 반환하는 함수
  const getWqiColor = (wqi) => {
    if (wqi <= 50) return '#F56565'; // 나쁨 (빨간색)
    if (wqi <= 75) return '#F59E0B'; // 보통 (주황색)
    return '#48BB78'; // 좋음 (초록색)
  };

  return (
    <div className="anomaly-container">
      <h2 className="anomaly-title">수질 취약 지역</h2>

      {rankedStations.length > 0 ? (
        <ul className="anomaly-list">
          {rankedStations.map((station, index) => {
            const isDanger = station.wqi <= 50;

            return (
              <li
                key={station.deviceId || station.id || station.name || index}
                className={`anomaly-item ${isDanger ? 'blink-danger' : ''}`}
                aria-live={isDanger ? 'polite' : undefined}
              >
                <span className="anomaly-rank">{index + 1}.</span>
                <span className="anomaly-name">
                  {station.name || station.deviceName || `Station-${index + 1}`}
                </span>
                <span
                  className="anomaly-score"
                  style={{ color: getWqiColor(station.wqi) }}
                  aria-label={`WQI ${station.wqi}${isDanger ? ', 위험' : ''}`}
                >
                  {station.wqi}
                </span>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="anomaly-loading">
          <p className="anomaly-loading-text">측정소 데이터를 불러오는 중...</p>
        </div>
      )}
    </div>
  );
}

export default AnomalyDetection;