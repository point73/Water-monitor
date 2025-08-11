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
      <h2 style={{ fontSize: '30px', fontWeight: 'bold', marginBottom: '15px', color: '#333' }}>이상 감지 지역</h2>
      <ul style={{ listStyleType: 'none', padding: '0' }}>
        <li style={{ marginBottom: '12px', color: '#475569', fontSize: '1.5em' }}>
          광주 – <span style={{ color: 'red', fontWeight: 'bold' }}>위험</span>
        </li>
        <li style={{ marginBottom: '12px', color: '#475569', fontSize: '1.5em' }}>
          서울 – <span style={{ color: 'orange', fontWeight: 'bold' }}>주의</span>
        </li>
        <li style={{ marginBottom: '12px', color: '#475569', fontSize: '1.5em' }}>
          부산 – <span style={{ color: 'green', fontWeight: 'bold' }}>정상</span>
        </li>
        {/* --- 수정 끝 --- */}
      </ul>
    </div>
  );
}

export default AnomalyDetection;
