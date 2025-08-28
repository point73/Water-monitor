package kr.u_cube.www.WaterPollution.websocket;

import kr.u_cube.www.WaterPollution.dto.websocket.PredictionResultMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class PredictionResultPublisher {
    
    private final SimpMessagingTemplate messagingTemplate;
    
    // WebSocket 토픽 경로
    private static final String PREDICTION_TOPIC = "/water/prediction";
    private static final String DEVICE_SPECIFIC_TOPIC = "/water/prediction/device/";
    
    /**
     * 모든 구독자에게 예측 결과 전송
     */
    public void broadcastPredictionResult(PredictionResultMessage message) {
        try {
            log.info("📡 예측 결과 브로드캐스트: deviceId={}, success={}", 
                    message.getDeviceId(), message.isSuccess());
            
            messagingTemplate.convertAndSend(PREDICTION_TOPIC, message);
            
        } catch (Exception e) {
            log.error("❌ 예측 결과 브로드캐스트 실패: deviceId={}", 
                    message.getDeviceId(), e);
        }
    }
    
    /**
     * 특정 디바이스를 구독하는 클라이언트에게만 예측 결과 전송
     */
    public void sendToDeviceSubscribers(PredictionResultMessage message) {
        try {
            String deviceTopic = DEVICE_SPECIFIC_TOPIC + message.getDeviceId();
            
            log.info("🎯 디바이스별 예측 결과 전송: topic={}, deviceId={}", 
                    deviceTopic, message.getDeviceId());
            
            messagingTemplate.convertAndSend(deviceTopic, message);
            
        } catch (Exception e) {
            log.error("❌ 디바이스별 예측 결과 전송 실패: deviceId={}", 
                    message.getDeviceId(), e);
        }
    }
    
    /**
     * 예측 결과를 모든 채널로 전송 (브로드캐스트 + 디바이스별)
     */
    public void publishPredictionResult(PredictionResultMessage message) {
        // 전체 브로드캐스트
        broadcastPredictionResult(message);
        
        // 디바이스별 구독자에게 전송
        sendToDeviceSubscribers(message);
        
        log.debug("✅ 예측 결과 발행 완료: deviceId={}", message.getDeviceId());
    }
    
    /**
     * 시스템 상태 메시지 전송
     */
    public void sendSystemStatus(String status, String message) {
        try {
            PredictionResultMessage statusMessage = PredictionResultMessage.builder()
                    .messageType("SYSTEM_STATUS")
                    .deviceId("SYSTEM")
                    .success("OK".equals(status))
                    .errorMessage("OK".equals(status) ? null : message)
                    .timestamp(java.time.LocalDateTime.now())
                    .build();
            
            messagingTemplate.convertAndSend("/water/system", statusMessage);
            
            log.info("📊 시스템 상태 전송: status={}, message={}", status, message);
            
        } catch (Exception e) {
            log.error("❌ 시스템 상태 전송 실패", e);
        }
    }
}