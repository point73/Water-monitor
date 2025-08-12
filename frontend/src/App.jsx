import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// API import
import { sensorApi } from './api';

// 컴포넌트
import MapDashboard from './components/MapDashboard';
import Sidebar from './components/Sidebar';
import SensorBoxes from './components/SensorBoxes';
import AnomalyDetection from './components/AnomalyDetection';
import PredictionChart from './components/PredictionChart';
import TimeRangePage from './components/TimeRangePage';

// 스타일
import './styles/layout.css'; // 경로 변경

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend, Filler);

function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [date, setDate] = useState(new Date());
  const [deviceListData, setDeviceListData] = useState(null);
  const [isDeviceListLoading, setIsDeviceListLoading] = useState(true);
  const [deviceListHasError, setDeviceListHasError] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedSensorData, setSelectedSensorData] = useState(null);
  const [selectedPredictionData, setSelectedPredictionData] = useState(null);

  // 전체 센서 데이터 로드
  useEffect(() => {
    const fetchDeviceData = async () => {
      try {
        setIsDeviceListLoading(true);
        setDeviceListHasError(false);

        const data = await sensorApi.getAllLatestSensorData();
        setDeviceListData(data);
      } catch (error) {
        console.error("전체 디바이스 목록 API 오류:", error);
        setDeviceListHasError(true);
      } finally {
        setIsDeviceListLoading(false);
      }
    };

    fetchDeviceData();
  }, []);

  // 지역 클릭 핸들러 (특정 센서 데이터 로드)
  const handleRegionClick = async (deviceData) => {
    setSelectedRegion(deviceData);

    try {
      const sensorData = await sensorApi.getSensorDataByDeviceId(deviceData.deviceId);
      setSelectedSensorData(sensorData);
    } catch (error) {
      console.error("❌ 센서 데이터 호출 실패:", error);
      setSelectedSensorData(null);
    }
  };

  return (
      <div className="app-container">
        <div className="app-layout">
          <Sidebar date={date} setDate={setDate} setActivePage={setActivePage} />
          <main className="main-content">
            {activePage === 'dashboard' && (
              <>
                <SensorBoxes selectedSensorData={selectedSensorData} />

                <div className="dashboard-row">
                  <div className="left-column">
                    {/* ▼▼▼ 이 부분에 style 속성을 추가했습니다 (flex: 4) ▼▼▼ */}
                    <div className="anomaly-detection-wrapper" style={{ flex: 4 }}>
                      <AnomalyDetection deviceListData={deviceListData} />
                    </div>
                    {/* ▼▼▼ 이 부분에 style 속성을 추가했습니다 (flex: 6) ▼▼▼ */}
                    <div className="prediction-chart-wrapper" style={{ flex: 6 }}>
                      <PredictionChart
                        regionName={selectedRegion?.name}
                        predictionData={selectedPredictionData}
                      />
                    </div>
                  </div>

                  <div className="map-wrapper">
                    <div className="map-card">
                      <h2 className="map-title" style={{ fontSize: '25px' }}>🌐 전국 오염 지도</h2>
                      <div className="map-container">
                        <MapDashboard
                          onRegionClick={handleRegionClick}
                          deviceListData={deviceListData}
                          isDeviceListLoading={isDeviceListLoading}
                          deviceListHasError={deviceListHasError}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
            {activePage === 'timeRange' && <TimeRangePage />}
          </main>
        </div>
      </div>
  );
}

export default App;
