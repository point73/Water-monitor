// src/components/PredictionChart.jsx
import React from 'react';
import { Line } from 'react-chartjs-2';

function PredictionChart({ selectedRegion, predictionData }) {
  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '10px',
      padding: '20px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
      flexGrow: 1,
    }}>
      <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px', color: '#333' }}>📊 선택된 지역의 5일 예측 오염도</h2>
      {selectedRegion ? (
        <>
          <p style={{ marginBottom: '10px', color: '#475569' }}><strong>{selectedRegion.name}</strong></p>
          <Line data={predictionData} />
        </>
      ) : (
        <p style={{ color: '#666' }}>아직 지역이 선택되지 않았습니다.</p>
      )}
    </div>
  );
}

export default PredictionChart;
