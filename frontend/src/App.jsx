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
import axios from 'axios';

// 컴포넌트
import MapDashboard from './components/MapDashboard';
import Sidebar from './components/Sidebar';
import SensorBoxes from './components/SensorBoxes';
import AnomalyDetection from './components/AnomalyDetection';
import PredictionChart from './components/PredictionChart';
import TimeRangePage from './components/TimeRangePage';

// 스타일
import './App.css';

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://192.168.111.114:8085/api/sensor/latest/all");
        const fetched = Array.isArray(res.data?.data) ? res.data.data : res.data;
        setDeviceListData(fetched);
      } catch (err) {
        console.error("전체 디바이스 목록 API 오류:", err);
        setDeviceListHasError(true);
      } finally {
        setIsDeviceListLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleRegionClick = async (deviceData) => {
    setSelectedRegion(deviceData);
    try {
      const sensorRes = await axios.get(`http://192.168.111.114:8085/api/sensor/${deviceData.deviceId}`);
      setSelectedSensorData(sensorRes.data?.data || sensorRes.data);
    } catch (err) {
      console.error("❌ 센서 데이터 호출 실패:", err);
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
                  <AnomalyDetection />
                  <PredictionChart
                    regionName={selectedRegion?.name}
                    predictionData={selectedPredictionData}
                  />
                </div>

                <div className="map-wrapper">
                  <div className="map-card">
                    <h2 className="map-title">🗺 전국 오염 지도</h2>
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
