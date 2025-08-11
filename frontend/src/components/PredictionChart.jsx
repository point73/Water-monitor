import React from 'react';
import { Line } from 'react-chartjs-2';

function PredictionChart({ regionName, predictionData }) { // props 이름 수정
  // 데이터 준비
  const chartData = predictionData
    ? {
        labels: predictionData.map(p => p.date),
        datasets: [
          {
            label: '예측 오염도',
            data: predictionData.map(p => p.value),
            fill: true,
            backgroundColor: 'rgba(75,192,192,0.2)',
            borderColor: 'rgba(75,192,192,1)',
            tension: 0.4
          }
        ]
      }
    : {
        labels: [],
        datasets: []
      };

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '10px',
      padding: '20px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
      flexGrow: 1,
      display: 'flex',
      flexDirection: 'column'
    }}>
      <h2 style={{ fontSize: '30px', fontWeight: 'bold', marginBottom: '15px', color: '#333' }}>📊 선택된 지역의 5일 예측 오염도</h2>
      {regionName ? (
        <>
          <p style={{ marginBottom: '10px', color: '#475569', fontSize: '1.5em' }}><strong>{regionName}</strong></p>
          <div style={{ flexGrow: 1, position: 'relative' }}>
            <Line data={chartData} options={{ maintainAspectRatio: false }} />
          </div>
        </>
      ) : (
        // --- 여기를 수정했습니다 (글자 크기 및 스타일) ---
        <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: '#666', fontSize: '1.5em' }}>아직 지역이 선택되지 않았습니다.</p>
        </div>
        // --- 수정 끝 ---
      )}
    </div>
  );
}

export default PredictionChart;
