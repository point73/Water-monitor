import React, { useState, useEffect } from 'react';
import '../styles/components.css';

// AnomalyDetection 컴포넌트는 이제 deviceListData를 props로 받습니다.
function AnomalyDetection({ deviceListData }) {
  // WQI 점수 순으로 정렬된 상위 지역 목록을 저장할 상태
  const [rankedStations, setRankedStations] = useState([]);

  useEffect(() => {
    // deviceListData가 유효할 때만 로직을 실행합니다.
    if (deviceListData && deviceListData.length > 0) {
      // 1. 각 측정소에 50 ~ 100 사이의 랜덤 WQI 점수 부여
      const stationsWithWqi = deviceListData.map(device => ({
        ...device,
        wqi: Math.floor(Math.random() * 51) + 50,
      }));

      // 2. WQI 점수가 높은 순서대로 내림차순 정렬
      const sortedStations = stationsWithWqi.sort((a, b) => b.wqi - a.wqi);

      // 3. 상위 5개 지역만 선택
      const topStations = sortedStations.slice(0, 5);

      setRankedStations(topStations);
    }
  }, [deviceListData]); // deviceListData가 변경될 때마다 이 효과를 다시 실행합니다.

  // WQI 점수에 따라 색상을 반환하는 함수
  const getWqiColor = (wqi) => {
    if (wqi >= 90) return '#F56565'; // 위험 (빨강)
    if (wqi >= 75) return '#F59E0B'; // 주의 (주황)
    return '#48BB78'; // 보통 (초록)
  };

  return (
    <div className="anomaly-container" style={{ paddingTop: '1px' }}>
      <h2 className="anomaly-title">
      🚨이상 감지 상위 지역 (WQI 기준)
      </h2>
      {rankedStations.length > 0 ? (
        <ul className="anomaly-list">
          {rankedStations.map((station, index) => (
            <li key={station.deviceId} className="anomaly-item">
              <span className="anomaly-rank">{index + 1}.</span>
              <span className="anomaly-name">{station.name}</span>
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
