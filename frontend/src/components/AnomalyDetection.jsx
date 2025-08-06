// src/components/AnomalyDetection.jsx
import React from 'react';

function AnomalyDetection() {
  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '10px',
      padding: '20px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
      flexGrow: 1,
    }}>
      <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px', color: '#333' }}>이상 감지 지역</h2>
      <ul style={{ listStyleType: 'none', padding: '0' }}>
        <li style={{ marginBottom: '8px', color: '#475569' }}>광주 – <span style={{ color: 'red', fontWeight: 'bold' }}>위험</span></li>
        <li style={{ marginBottom: '8px', color: '#475569' }}>서울 – <span style={{ color: 'orange', fontWeight: 'bold' }}>주의</span></li>
        <li style={{ marginBottom: '8px', color: '#475569' }}>부산 – <span style={{ color: 'green', fontWeight: 'bold' }}>정상</span></li>
      </ul>
    </div>
  );
}

export default AnomalyDetection;
