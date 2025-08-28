// src/hooks/usePredictionData.js
import { useState, useEffect, useCallback, useRef } from 'react';
import websocketService from '../services/websocketService';

export const usePredictionData = () => {
  const [predictions, setPredictions] = useState(new Map());
  const [systemStatus, setSystemStatus] = useState({ connected: false, lastUpdate: null });
  const [connectionError, setConnectionError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const mountedRef = useRef(true);

  // 예측 데이터 핸들러
  const handlePredictionMessage = useCallback((message) => {
    if (!mountedRef.current) return;

    console.log('🤖 예측 결과 수신:', message);

    if (message.messageType === 'PREDICTION_RESULT' && message.success) {
      setPredictions(prev => {
        const newPredictions = new Map(prev);
        newPredictions.set(message.deviceId, {
          ...message,
          receivedAt: new Date()
        });
        return newPredictions;
      });
    } else if (!message.success) {
      console.warn('⚠️ 예측 실패:', message.errorMessage);
    }
  }, []);

  // 시스템 상태 핸들러
  const handleSystemMessage = useCallback((message) => {
    if (!mountedRef.current) return;

    console.log('📊 시스템 메시지 수신:', message);
    
    setSystemStatus({
      connected: message.success,
      lastUpdate: new Date(),
      message: message.errorMessage
    });
  }, []);

  // WebSocket 초기화
  useEffect(() => {
    let reconnectTimer;

    const initializeWebSocket = async () => {
      try {
        setIsLoading(true);
        setConnectionError(null);

        // WebSocket 연결
        await websocketService.connect();

        // 예측 결과 구독
        websocketService.subscribeToPredictions(handlePredictionMessage);

        // 시스템 상태 구독
        websocketService.subscribeToSystemStatus(handleSystemMessage);

        // 구독 요청 전송
        websocketService.requestPredictionSubscription();

        console.log('✅ WebSocket 초기화 완료');
        
      } catch (error) {
        console.error('❌ WebSocket 초기화 실패:', error);
        setConnectionError(error.message);
        
        // 재연결 시도
        reconnectTimer = setTimeout(initializeWebSocket, 5000);
      } finally {
        setIsLoading(false);
      }
    };

    initializeWebSocket();

    // 컴포넌트 언마운트 시 정리
    return () => {
      mountedRef.current = false;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      websocketService.disconnect();
    };
  }, [handlePredictionMessage, handleSystemMessage]);

  // 특정 디바이스 예측 데이터 조회
  const getPredictionByDeviceId = useCallback((deviceId) => {
    return predictions.get(deviceId) || null;
  }, [predictions]);

  // 최신 예측 데이터 조회 (시간 기준)
  const getLatestPredictions = useCallback((limit = 10) => {
    return Array.from(predictions.values())
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }, [predictions]);

  // 알림 레벨별 예측 데이터 조회
  const getPredictionsByAlertLevel = useCallback((alertLevel) => {
    return Array.from(predictions.values())
      .filter(prediction => prediction.predictionData?.alertLevel === alertLevel)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [predictions]);

  // 위험/경고 알림 개수 조회
  const getAlertCounts = useCallback(() => {
    const counts = { CRITICAL: 0, WARNING: 0, NORMAL: 0 };
    
    predictions.forEach(prediction => {
      const level = prediction.predictionData?.alertLevel || 'NORMAL';
      counts[level] = (counts[level] || 0) + 1;
    });
    
    return counts;
  }, [predictions]);

  // 특정 디바이스 구독
  const subscribeToDevice = useCallback((deviceId) => {
    websocketService.subscribeToDevicePredictions(deviceId, handlePredictionMessage);
    websocketService.requestDevicePredictionSubscription(deviceId);
  }, [handlePredictionMessage]);

  // 테스트 예측 요청
  const requestTestPrediction = useCallback(() => {
    return websocketService.requestTestPrediction();
  }, []);

  // 예측 데이터 초기화
  const clearPredictions = useCallback(() => {
    setPredictions(new Map());
  }, []);

  return {
    // 상태
    predictions: Array.from(predictions.values()),
    predictionMap: predictions,
    systemStatus,
    connectionError,
    isLoading,
    isConnected: websocketService.isWebSocketConnected(),
    
    // 조회 함수
    getPredictionByDeviceId,
    getLatestPredictions,
    getPredictionsByAlertLevel,
    getAlertCounts,
    
    // 액션 함수
    subscribeToDevice,
    requestTestPrediction,
    clearPredictions
  };
};

export default usePredictionData;