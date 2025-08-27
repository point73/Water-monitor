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

// 스타일
import './styles/layout.css';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend, Filler);

function App() {
  // =================================================================
  // 상태 관리 (State Management)
  // =================================================================
  const [activePage, setActivePage] = useState('dashboard');
  const [date, setDate] = useState(new Date());
  
  // 데이터 관련 상태
  const [deviceList, setDeviceList] = useState([]); // API로 받은 원본 데이터
  const [mapDisplayData, setMapDisplayData] = useState([]); // 지도에 실제 표시될 데이터
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

  // 1. 초기 데이터 로드 (전체 보기) - 컴포넌트 마운트 시 한 번만 실행
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsDeviceListLoading(true);
      setDeviceListHasError(false);
      try {
        const data = await sensorApi.getAllLatestSensorData();
        const dataWithWqi = data.map(d => ({ ...d, wqi: d.wqi ?? 100 }));

        setDeviceList(dataWithWqi);
        setMapDisplayData(dataWithWqi); // 지도 표시용 데이터도 전체로 설정
        setIsTop5Mode(false);
      } catch (error) {
        console.error("초기 디바이스 목록 API 오류:", error);
        setDeviceListHasError(true);
      } finally {
        setIsDeviceListLoading(false);
      }
    };
    fetchInitialData();
  }, []); // 빈 의존성 배열: 마운트 시에만 실행

  // 2. 날짜 변경 핸들러 (사용자 클릭 시에만 실행)
  const handleDateChange = useCallback(async (newDate) => {
    setDate(newDate); // 날짜 상태 업데이트
    
    setIsDeviceListLoading(true);
    setDeviceListHasError(false);
    try {
      // 실제로는 날짜에 맞는 데이터를 가져오는 API를 호출해야 합니다.
      const data = await sensorApi.getAllLatestSensorData();
      const dataWithWqi = data.map(d => ({ ...d, wqi: d.wqi ?? 100 }));

      setDeviceList(dataWithWqi); // 새 날짜의 원본 데이터로 업데이트

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
  }, []); // 이 함수는 재생성될 필요가 거의 없으므로 빈 의존성 배열 사용

  // 지도 마커 클릭 시 특정 센서 데이터 로드
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

  // '전체 보기' 버튼 클릭 핸들러
  const showAllDevices = () => {
    setMapDisplayData(deviceList);
    setIsTop5Mode(false);
  };


  // =================================================================
  // 렌더링 (Rendering)
  // =================================================================
  return (
    <div className="app-container">
      <div className="app-layout">
        {/* setDate prop에 handleDateChange 함수를 전달 */}
        <Sidebar date={date} setDate={handleDateChange} setActivePage={setActivePage} />
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
