// src/App.jsx
import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import axios from 'axios';

// 컴포넌트 import
import MapDashboard from './components/MapDashboard';
import Sidebar from './components/Sidebar';
import SensorBoxes from './components/SensorBoxes';
import AnomalyDetection from './components/AnomalyDetection';
import PredictionChart from './components/PredictionChart';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend, Filler);

function App() {
  const [date, setDate] = useState(new Date());
  const [deviceListData, setDeviceListData] = useState(null);
  const [isDeviceListLoading, setIsDeviceListLoading] = useState(true);
  const [deviceListHasError, setDeviceListHasError] = useState(false);

  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedSensorData, setSelectedSensorData] = useState(null);
  const [selectedPredictionData, setSelectedPredictionData] = useState(null);

  // 초기 전체 디바이스 목록 불러오기
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

  // 지도에서 지역 클릭 시 호출
  // const handleRegionClick = async (deviceData) => {
  //   setSelectedRegion(deviceData);
  //   console.log(deviceData.deviceId);

  //   try {
  //     const sensorRes = await axios.get(`http://192.168.111.114:8085/api/sensor/${deviceData.deviceId}`);
  //     setSelectedSensorData(sensorRes.data?.data || sensorRes.data);

  //     // const predRes = await axios.get(`http://192.168.111.114:8085/api/predict/${deviceData.id}`);
  //     // setSelectedPredictionData(predRes.data?.data || predRes.data);
  //   } catch (err) {
  //     console.error("선택 지역 데이터 호출 실패:", err);
  //   }
  // };

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
    <div style={{
      fontFamily: 'Arial, sans-serif',
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#e8f5e9',
      width: '100%',
    }}>
      <Sidebar date={date} setDate={setDate} />

      <main style={{ flexGrow: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <SensorBoxes selectedSensorData={selectedSensorData} />

        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', flexGrow: 1 }}>
          <div style={{ flex: 2, minWidth: '350px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <AnomalyDetection />
            <PredictionChart
              regionName={selectedRegion?.name}
              predictionData={selectedPredictionData}
            />
          </div>

          <div style={{ flex: 1, minWidth: '400px', flexBasis: '50%', minHeight: '500px' }}>
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '10px',
              padding: '20px',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '15px', color: '#333' }}>🗺 전국 오염 지도</h2>
              <div style={{ flexGrow: 1, minHeight: '400px' }}>
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
      </main>
    </div>
  );
}

export default App;
