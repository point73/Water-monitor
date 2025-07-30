import React from 'react';
function About() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2>서비스 소개</h2>
      <p>본 시스템은 AI 기반 수질 예측 모델과 GIS 대시보드를 결합하여, 전국 수질 데이터를 시각화하고 예측 결과를 제공하는 플랫폼입니다.</p>
      <ul>
        <li>AI 모델: LSTM 기반 예측</li>
        <li>시각화: Leaflet 지도 기반</li>
        <li>알림 기능: 이메일 경고 시스템</li>
        <li>데이터 출처: KOSIS, U-cube</li>
      </ul>
    </div>
  );
}
export default About;