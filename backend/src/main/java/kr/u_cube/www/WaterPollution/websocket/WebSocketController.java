package kr.u_cube.www.WaterPollution.websocket;

import kr.u_cube.www.WaterPollution.dto.websocket.PredictionResultMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;

@Controller
@RequiredArgsConstructor
@Slf4j
public class WebSocketController {
    
    private final PredictionResultPublisher predictionResultPublisher;
    
    /**
     * 클라이언트가 예측 결과 구독을 요청할 때
     */
    @MessageMapping("/subscribe/prediction")
    @SendTo("/water/prediction")
    public PredictionResultMessage subscribeToPrediction(SimpMessageHeaderAccessor headerAccessor) {
        String sessionId = headerAccessor.getSessionId();
        log.info("🔗 예측 결과 구독 요청: sessionId={}", sessionId);
        
        // 구독 확인 메시지 반환
        return PredictionResultMessage.builder()
                .messageType("SUBSCRIPTION_CONFIRMED")
                .deviceId("SYSTEM")
                .timestamp(LocalDateTime.now())
                .success(true)
                .errorMessage("예측 결과 구독이 완료되었습니다")
                .build();
    }
    
    /**
     * 특정 디바이스의 예측 결과 구독
     */
    @MessageMapping("/subscribe/prediction/device/{deviceId}")
    @SendTo("/water/prediction/device/{deviceId}")
    public PredictionResultMessage subscribeToDevicePrediction(
            @DestinationVariable String deviceId,
            SimpMessageHeaderAccessor headerAccessor) {
        
        String sessionId = headerAccessor.getSessionId();
        log.info("🎯 디바이스별 예측 결과 구독 요청: deviceId={}, sessionId={}", deviceId, sessionId);
        
        return PredictionResultMessage.builder()
                .messageType("DEVICE_SUBSCRIPTION_CONFIRMED")
                .deviceId(deviceId)
                .timestamp(LocalDateTime.now())
                .success(true)
                .errorMessage("디바이스 " + deviceId + " 예측 결과 구독이 완료되었습니다")
                .build();
    }
    
    /**
     * 시스템 상태 구독
     */
    @MessageMapping("/subscribe/system")
    @SendTo("/water/system")
    public PredictionResultMessage subscribeToSystem(SimpMessageHeaderAccessor headerAccessor) {
        String sessionId = headerAccessor.getSessionId();
        log.info("📊 시스템 상태 구독 요청: sessionId={}", sessionId);
        
        return PredictionResultMessage.builder()
                .messageType("SYSTEM_SUBSCRIPTION_CONFIRMED")
                .deviceId("SYSTEM")
                .timestamp(LocalDateTime.now())
                .success(true)
                .errorMessage("시스템 상태 구독이 완료되었습니다")
                .build();
    }
    
    /**
     * 테스트용 예측 결과 전송
     */
    @MessageMapping("/test/prediction")
    public void sendTestPrediction(SimpMessageHeaderAccessor headerAccessor) {
        String sessionId = headerAccessor.getSessionId();
        log.info("🧪 테스트 예측 결과 전송 요청: sessionId={}", sessionId);
        
        // 테스트 예측 결과 생성
        PredictionResultMessage testMessage = PredictionResultMessage.builder()
                .messageType("PREDICTION_RESULT")
                .deviceId("TEST_DEVICE")
                .sensorName("테스트 센서")
                .sugyeName("테스트강")
                .sensorValues(PredictionResultMessage.SensorValues.builder()
                        .ph(7.2)
                        .doValue(6.5)
                        .temperature(15.0)
                        .ec(200.0)
                        .bod(3.0)
                        .cod(5.0)
                        .build())
                .predictionData(PredictionResultMessage.PredictionData.builder()
                        .sugyeName("테스트강")
                        .overallGrade("좋음")
                        .overallScore(75.0)
                        .alertLevel("NORMAL")
                        .predictions(java.util.Arrays.asList(
                                PredictionResultMessage.WqiPrediction.builder()
                                        .date("2025-08-27")
                                        .wqiScore(75.0)
                                        .wqiGrade("좋음")
                                        .build()
                        ))
                        .build())
                .timestamp(LocalDateTime.now())
                .success(true)
                .build();
        
        // 테스트 메시지 전송
        predictionResultPublisher.publishPredictionResult(testMessage);
    }
}