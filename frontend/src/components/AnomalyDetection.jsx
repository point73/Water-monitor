// src/components/AnomalyDetection.jsx
import React, { useState, useEffect } from 'react';
import '../styles/components.css';

function AnomalyDetection({ deviceListData = [] }) {
  const [rankedStations, setRankedStations] = useState([]);

  useEffect(() => {
    let list = [];

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

    const stationsWithWqi = list.map((device) => ({
      ...device,
      wqi: Math.floor(Math.random() * 81) + 20,
    }));

    const sortedStations = stationsWithWqi
      .slice()
      .sort((a, b) => a.wqi - b.wqi);

    setRankedStations(sortedStations.slice(0, 3));
  }, [deviceListData]);

  const getWqiColor = (wqi) => {
    if (wqi <= 50) return '#F56565'; // 나쁨
    if (wqi <= 75) return '#F59E0B'; // 보통
    return '#48BB78'; // 좋음
  };

  return (
    <div className="anomaly-container" style={{ paddingTop: '1px' }}>
      <h2 className="anomaly-title">이상 감지 상위 지역 (WQI 기준)</h2>

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
