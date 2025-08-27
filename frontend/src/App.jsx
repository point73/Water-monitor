import React, { useState, useEffect, useCallback } from 'react';
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
import WaterQualityStandards from './components/WaterQualityStandards'; 
import AlarmPanel from './components/AlarmPanel'; // 알람 패널 컴포넌트 import

// 스타일
import './styles/layout.css';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend, Filler);

function App() {
  // =================================================================
  // 상태 관리 (State Management)
  // =================================================================
  const [activePage, setActivePage] = useState('dashboard');
  const [date, setDate] = useState(new Date());
  const [isAlarmPanelOpen, setAlarmPanelOpen] = useState(false); // 알람 패널 상태 추가
  
  // 데이터 관련 상태
  const [deviceList, setDeviceList] = useState([]);
  const [mapDisplayData, setMapDisplayData] = useState([]);
  const [isDeviceListLoading, setIsDeviceListLoading] = useState(true);
  const [deviceListHasError, setDeviceListHasError] = useState(false);
  
  // 선택된 지역/센서 관련 상태
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedSensorData, setSelectedSensorData] = useState(null);
  const [selectedPredictionData, setSelectedPredictionData] = useState(null);

  // Top 5 모드 관련 상태
  const [isTop5Mode, setIsTop5Mode] = useState(false);


  // =================================================================
  // 데이터 Fetch 및 처리 로직
  // =================================================================

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsDeviceListLoading(true);
      setDeviceListHasError(false);
      try {
        const data = await sensorApi.getAllLatestSensorData();
        const dataWithWqi = data.map(d => ({ ...d, wqi: d.wqi ?? 100 }));

        setDeviceList(dataWithWqi);
        setMapDisplayData(dataWithWqi);
        setIsTop5Mode(false);
      } catch (error) {
        console.error("초기 디바이스 목록 API 오류:", error);
        setDeviceListHasError(true);
      } finally {
        setIsDeviceListLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const handleDateChange = useCallback(async (newDate) => {
    setDate(newDate);
    setIsDeviceListLoading(true);
    setDeviceListHasError(false);
    try {
      const data = await sensorApi.getAllLatestSensorData();
      const dataWithWqi = data.map(d => ({ ...d, wqi: d.wqi ?? 100 }));

      setDeviceList(dataWithWqi);

      const sorted = [...dataWithWqi].sort((a, b) => a.wqi - b.wqi);
      const top5 = sorted.slice(0, 5);

      setMapDisplayData(top5);
      setIsTop5Mode(true);
    } catch (error) {
      console.error("날짜별 디바이스 목록 API 오류:", error);
      setDeviceListHasError(true);
    } finally {
      setIsDeviceListLoading(false);
    }
  }, []);

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

  const showAllDevices = () => {
    setMapDisplayData(deviceList);
    setIsTop5Mode(false);
  };

  // 알람 패널을 열고 닫는 함수
  const toggleAlarmPanel = () => {
    setAlarmPanelOpen(!isAlarmPanelOpen);
  };

  // deviceList 데이터 기반으로 알람 목록 생성
  // WQI 50 이하는 '위험', 75 이하는 '경고'로 분류
  const alarms = deviceList
    .filter(d => d.wqi <= 75) // 경고 기준치 이하만 필터링
    .sort((a, b) => a.wqi - b.wqi) // 오염도 높은 순 정렬
    .map(device => ({
      id: device.deviceId,
      level: device.wqi <= 50 ? 'danger' : 'warning',
      name: device.name,
      value: device.wqi,
    }));


  // =================================================================
  // 렌더링 (Rendering)
  // =================================================================
  return (
    <div className="app-container">
      <div className="app-layout">
        <Sidebar 
          date={date} 
          setDate={handleDateChange} 
          setActivePage={setActivePage} 
          onToggleAlarms={toggleAlarmPanel} // Sidebar에 prop 전달
        />

        {/* isAlarmPanelOpen이 true일 때만 AlarmPanel 렌더링 */}
        {isAlarmPanelOpen && (
          <AlarmPanel 
            alarms={alarms} 
            onClose={toggleAlarmPanel} 
          />
        )}

        <main className="main-content">
          {activePage === 'dashboard' && (
            <>
              <SensorBoxes selectedSensorData={selectedSensorData} />

              <div className="dashboard-row">
                <div className="left-column">
                  <div className="anomaly-detection-wrapper" style={{ flex: 4 }}>
                    <AnomalyDetection deviceListData={deviceList} />
                  </div>
                  <div className="prediction-chart-wrapper" style={{ flex: 6 }}>
                    <PredictionChart
                      regionName={selectedRegion?.name}
                      predictionData={selectedPredictionData}
                    />
                  </div>
                </div>

                <div className="map-wrapper">
                  <MapDashboard
                    onRegionClick={handleRegionClick}
                    deviceListData={mapDisplayData}
                    isDeviceListLoading={isDeviceListLoading}
                    deviceListHasError={deviceListHasError}
                    isTop5Mode={isTop5Mode}
                    onShowAll={showAllDevices}
                    selectedDate={date}
                  />
                </div>
              </div>
            </>
          )}
          {activePage === 'timeRange' && <TimeRangePage />}
          {activePage === 'qualityStandards' && <WaterQualityStandards />}
        </main>
      </div>
    </div>
  );
}

export default App;
