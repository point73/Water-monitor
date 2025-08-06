// src/App.jsx
import React, { useState, useEffect } from 'react'; // useEffect 추가
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import axios from 'axios'; // axios 추가

// 분리된 컴포넌트들을 import 합니다.
import MapDashboard from './components/MapDashboard';
import Sidebar from './components/Sidebar';
import SensorBoxes from './components/SensorBoxes';
import AnomalyDetection from './components/AnomalyDetection';
import PredictionChart from './components/PredictionChart';

// Chart.js 필수 요소 등록 (메인 App 컴포넌트에서 한 번만 등록)
ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// 메인 대시보드 레이아웃 컴포넌트
function App() {
  const [date, setDate] = useState(new Date());
  // 선택된 지역 정보 (MapDashboard에서 클릭 시 업데이트)
  const [selectedRegion, setSelectedRegion] = useState(null);

  // 전체 센서 데이터를 저장할 상태 (App.jsx에서 관리)
  const [overallSensorData, setOverallSensorData] = useState(null);
  const [isOverallLoading, setIsOverallLoading] = useState(true);
  const [overallHasError, setOverallHasError] = useState(false);

  // MapDashboard에서 지역이 클릭되었을 때 호출될 함수
  const handleRegionClick = (regionData) => {
    setSelectedRegion(regionData);
  };

  // 컴포넌트가 처음 렌더링될 때 전체 센서 데이터를 불러옵니다.
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 백엔드 서버의 전체 센서 데이터를 제공하는 엔드포인트 URL을 변경했습니다.
        const res = await axios.get("http://192.168.111.114:8085/api/sensor/latest/all");
        console.log(res); // 응답 데이터를 콘솔에 출력
        
        setOverallSensorData(res.data);
      } catch (err) {
        console.error("API 호출 오류 (전체 센서 데이터):", err);
        setOverallHasError(true);
      } finally {
        setIsOverallLoading(false);
      }
    };

    fetchData();
  }, []); // <- 빈 배열이면 최초 1회만 실행

  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      display: 'flex',
      minHeight: '100vh',
      // 바탕화면 색상을 더 자연스러운 색상으로 변경했습니다.
      backgroundColor: '#e8f5e9', // 매우 밝은 녹색 계열 (자연 친화적인 느낌)
      width: '100%',
    }}>
      {/* 사이드바 컴포넌트 */}
      <Sidebar date={date} setDate={setDate} />

      {/* 메인 콘텐츠 영역 */}
      <main style={{ flexGrow: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* 상단 센서 박스 컴포넌트 - 이제 App.jsx에서 가져온 전체 데이터 또는 선택된 지역 데이터 사용 */}
        <SensorBoxes
          selectedRegion={selectedRegion}
          overallData={overallSensorData}
          isOverallLoading={isOverallLoading}
          overallHasError={overallHasError}
        />

        {/* 본문 영역 (오염 지역 목록 및 그래프, 지도) */}
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', flexGrow: 1 }}>
          {/* 왼쪽 컬럼 (이상 감지 지역 및 5일 예측 그래프) */}
          <div style={{ flex: 2, minWidth: '350px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* 이상 감지 지역 컴포넌트 */}
            <AnomalyDetection />
            
            {/* 5일 예측 오염도 그래프 컴포넌트 - 이제 selectedRegion의 이름을 기반으로 자체 데이터 가져옴 */}
            <PredictionChart selectedRegion={selectedRegion} />
          </div>

          {/* 전국 오염 지도 */}
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
                <MapDashboard onRegionClick={handleRegionClick} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
