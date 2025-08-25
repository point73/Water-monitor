import React, { useState, useEffect } from 'react';
import '../styles/components.css';

// ✅ 기본값을 []로 설정해서 최초 렌더 에러 방지
function AnomalyDetection({ deviceListData = [] }) {
  const [rankedStations, setRankedStations] = useState([]);

  useEffect(() => {
    // 1) 어떤 형태로 넘어와도 배열로 변환
    let list = [];

    if (Array.isArray(deviceListData)) {
      list = deviceListData;
    } else if (deviceListData && typeof deviceListData === 'object') {
      // API가 객체로 주는 경우(Object keyed by id)
      list = Object.values(deviceListData);
    } else {
      setRankedStations([]);
      return;
    }

    if (list.length === 0) {
      setRankedStations([]);
      return;
    }

    // 2) 랜덤 WQI 부여 (원본 불변 유지)
    const stationsWithWqi = list.map((device) => ({
      ...device,
      wqi: Math.floor(Math.random() * 81) + 20, // 20~100
    }));

    // 3) 정렬 시 원본 변형 방지: slice() 후 sort()
    const sortedStations = stationsWithWqi
      .slice()
      .sort((a, b) => a.wqi - b.wqi);

    // 4) 상위 3개
    setRankedStations(sortedStations.slice(0, 3));
  }, [deviceListData]);

  const getWqiColor = (wqi) => {
    if (wqi <= 50) return '#F56565'; // 나쁨
    if (wqi <= 75) return '#F59E0B'; // 보통
    return '#48BB78'; // 좋음
  };

  return (
    <div className="anomaly-container" style={{ paddingTop: '1px' }}>
      <h2 className="anomaly-title">🚨이상 감지 상위 지역 (WQI 기준)</h2>

      {rankedStations.length > 0 ? (
        <ul className="anomaly-list">
          {rankedStations.map((station, index) => (
            <li
              key={station.deviceId || station.id || station.name || index}
              className="anomaly-item"
            >
              <span className="anomaly-rank">{index + 1}.</span>
              <span className="anomaly-name">
                {station.name || station.deviceName || `Station-${index + 1}`}
              </span>
              <span
                className="anomaly-score"
                style={{ color: getWqiColor(station.wqi) }}
              >
                {station.wqi}
              </span>
            </li>
          ))}
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
