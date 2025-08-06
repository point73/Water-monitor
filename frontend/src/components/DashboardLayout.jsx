function App() {
  const [date, setDate] = useState(new Date());
  const [selectedRegion, setSelectedRegion] = useState(null);

  const handleRegionClick = (regionData) => {
    setSelectedRegion(regionData);
  };

  const predictionData = selectedRegion
    ? {
        labels: ['1일 후', '2일 후', '3일 후', '4일 후', '5일 후'],
        datasets: [
          {
            label: `${selectedRegion.name} 예측 오염도`,
            data: [
              selectedRegion.ph + 0.5,
              selectedRegion.do - 0.2,
              selectedRegion.bod + 0.1,
              selectedRegion.cod - 0.3,
              (selectedRegion.ph + selectedRegion.do) / 2
            ],
            borderColor: '#22c55e',
            backgroundColor: 'rgba(34,197,94,0.1)',
            tension: 0.4,
            fill: true,
          }
        ]
      }
    : null;

  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#f0f2f5',
      width: '100%',
    }}>
      {/* 사이드바 컴포넌트 */}
      <Sidebar date={date} setDate={setDate} />

      {/* 메인 콘텐츠 영역 */}
      <main style={{ flexGrow: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* 상단 센서 박스 컴포넌트 */}
        <SensorBoxes selectedRegion={selectedRegion} />

        {/* 본문 영역 (오염 지역 목록 및 그래프, 지도) */}
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', flexGrow: 1 }}>
          {/* 왼쪽 컬럼 (오염 주의 지역 및 5일 예측 그래프) */}
          <div style={{ flex: 2, minWidth: '350px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* 이상 감지 지역 컴포넌트 */}
            <AnomalyDetection />
            
            {/* 5일 예측 오염도 그래프 컴포넌트 */}
            <PredictionChart selectedRegion={selectedRegion} predictionData={predictionData} />
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
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px', color: '#333' }}>🗺 전국 오염 지도</h2>
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