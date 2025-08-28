// src/components/PredictionDisplay.jsx
import React, { useEffect, useState } from 'react';
import usePredictionData from '../hooks/usePredictionData';
import '../styles/components.css';

// 아이콘 컴포넌트들
const AlertIcon = ({ level }) => {
  const getColor = () => {
    switch (level) {
      case 'CRITICAL': return '#ef4444';
      case 'WARNING': return '#f59e0b';
      default: return '#10b981';
    }
  };

  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={getColor()} strokeWidth="2">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="8" x2="12" y2="12"></line>
      <line x1="12" y1="16" x2="12.01" y2="16"></line>
    </svg>
  );
};

const ConnectionStatus = ({ isConnected, error }) => (
  <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
    <div className={`status-indicator ${isConnected ? 'green' : 'red'}`}></div>
    <span>{isConnected ? 'AI 예측 서비스 연결됨' : `연결 실패${error ? `: ${error}` : ''}`}</span>
  </div>
);

function PredictionDisplay({ selectedDeviceId = null, showConnectionStatus = true }) {
  const {
    predictions,
    predictionMap,
    isConnected,
    connectionError,
    isLoading,
    getPredictionByDeviceId,
    getLatestPredictions,
    getAlertCounts,
    subscribeToDevice,
    requestTestPrediction
  } = usePredictionData();

  const [selectedPrediction, setSelectedPrediction] = useState(null);

  // 선택된 디바이스가 변경되면 해당 예측 데이터 구독
  useEffect(() => {
    if (selectedDeviceId) {
      subscribeToDevice(selectedDeviceId);
      const prediction = getPredictionByDeviceId(selectedDeviceId);
      setSelectedPrediction(prediction);
    }
  }, [selectedDeviceId, subscribeToDevice, getPredictionByDeviceId]);

  // 예측 데이터가 업데이트되면 선택된 디바이스 데이터 갱신
  useEffect(() => {
    if (selectedDeviceId) {
      const updatedPrediction = getPredictionByDeviceId(selectedDeviceId);
      if (updatedPrediction) {
        setSelectedPrediction(updatedPrediction);
      }
    }
  }, [predictionMap, selectedDeviceId, getPredictionByDeviceId]);

  const alertCounts = getAlertCounts();

  if (isLoading) {
    return (
      <div className="prediction-display loading">
        <div className="loading-spinner"></div>
        <p>AI 예측 서비스 연결 중...</p>
      </div>
    );
  }

  return (
    <div className="prediction-display-container">
      {/* 연결 상태 */}
      {showConnectionStatus && (
        <ConnectionStatus isConnected={isConnected} error={connectionError} />
      )}

      {/* 알림 요약 */}
      <div className="alert-summary">
        <div className="alert-count critical">
          <AlertIcon level="CRITICAL" />
          <span>위험: {alertCounts.CRITICAL}</span>
        </div>
        <div className="alert-count warning">
          <AlertIcon level="WARNING" />
          <span>경고: {alertCounts.WARNING}</span>
        </div>
        <div className="alert-count normal">
          <AlertIcon level="NORMAL" />
          <span>정상: {alertCounts.NORMAL}</span>
        </div>
      </div>

      {/* 선택된 디바이스의 예측 결과 */}
      {selectedPrediction ? (
        <div className="selected-prediction">
          <h3>📍 {selectedPrediction.sensorName || selectedPrediction.deviceId}</h3>
          <div className="prediction-details">
            <div className={`prediction-grade ${selectedPrediction.predictionData?.alertLevel?.toLowerCase()}`}>
              <AlertIcon level={selectedPrediction.predictionData?.alertLevel} />
              <span className="grade-text">{selectedPrediction.predictionData?.overallGrade || '알 수 없음'}</span>
              <span className="score-text">
                ({selectedPrediction.predictionData?.overallScore?.toFixed(1) || 'N/A'})
              </span>
            </div>
            <div className="prediction-time">
              {selectedPrediction.timestamp ? new Date(selectedPrediction.timestamp).toLocaleString('ko-KR') : '시간 정보 없음'}
            </div>
          </div>

          {/* 센서 측정값 */}
          {selectedPrediction.sensorValues && (
            <div className="sensor-values-grid">
              <div className="sensor-value">
                <span className="label">pH</span>
                <span className="value">{selectedPrediction.sensorValues.ph?.toFixed(1) || '-'}</span>
              </div>
              <div className="sensor-value">
                <span className="label">DO</span>
                <span className="value">{selectedPrediction.sensorValues.doValue?.toFixed(1) || '-'} mg/L</span>
              </div>
              <div className="sensor-value">
                <span className="label">BOD</span>
                <span className="value">{selectedPrediction.sensorValues.bod?.toFixed(1) || '-'} mg/L</span>
              </div>
              <div className="sensor-value">
                <span className="label">COD</span>
                <span className="value">{selectedPrediction.sensorValues.cod?.toFixed(1) || '-'} mg/L</span>
              </div>
            </div>
          )}
        </div>
      ) : selectedDeviceId ? (
        <div className="no-prediction">
          <p>선택된 디바이스의 예측 데이터를 기다리는 중...</p>
        </div>
      ) : null}

      {/* 최근 예측 결과 목록 */}
      <div className="recent-predictions">
        <div className="section-header">
          <h4>최근 AI 예측 결과</h4>
          <button onClick={requestTestPrediction} className="test-button">
            테스트 예측
          </button>
        </div>
        
        {predictions.length === 0 ? (
          <div className="no-data">
            <p>아직 예측 데이터가 없습니다.</p>
          </div>
        ) : (
          <div className="predictions-list">
            {getLatestPredictions(5).map((prediction) => (
              <div
                key={`${prediction.deviceId}-${prediction.timestamp}`}
                className={`prediction-item ${prediction.predictionData?.alertLevel?.toLowerCase()}`}
                onClick={() => setSelectedPrediction(prediction)}
              >
                <div className="prediction-header">
                  <span className="device-name">
                    {prediction.sensorName || prediction.deviceId}
                  </span>
                  <span className="prediction-grade">
                    {prediction.predictionData?.overallGrade || '알 수 없음'}
                  </span>
                </div>
                <div className="prediction-meta">
                  <span className="prediction-score">
                    WQI: {prediction.predictionData?.overallScore?.toFixed(1) || 'N/A'}
                  </span>
                  <span className="prediction-time">
                    {new Date(prediction.timestamp).toLocaleTimeString('ko-KR')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PredictionDisplay;