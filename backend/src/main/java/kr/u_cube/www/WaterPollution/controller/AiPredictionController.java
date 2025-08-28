package kr.u_cube.www.WaterPollution.controller;

import kr.u_cube.www.WaterPollution.dto.ai.AiPredictionResponse;
import kr.u_cube.www.WaterPollution.dto.sensor.SensorDataDto;
import kr.u_cube.www.WaterPollution.service.ai.AiPredictionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Slf4j
public class AiPredictionController {
    
    private final AiPredictionService aiPredictionService;
    
    /**
     * AI 서버 상태 확인
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> checkAiServerHealth() {
        boolean isHealthy = aiPredictionService.isAiServerHealthy();
        
        return ResponseEntity.ok(Map.of(
            "status", isHealthy ? "UP" : "DOWN",
            "service", "ai-prediction-server",
            "timestamp", LocalDateTime.now(),
            "message", isHealthy ? "AI 서버가 정상 작동 중입니다" : "AI 서버에 연결할 수 없습니다"
        ));
    }
    
    /**
     * AI 예측 테스트 (수동)
     */
    @PostMapping("/test/prediction")
    public ResponseEntity<AiPredictionResponse> testAiPrediction(@RequestBody SensorDataDto sensorData) {
        log.info("🧪 AI 예측 테스트 요청: deviceId={}", sensorData.getDeviceId());
        
        try {
            AiPredictionResponse response = aiPredictionService.requestPrediction(sensorData);
            
            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            log.error("❌ AI 예측 테스트 실패", e);
            
            AiPredictionResponse errorResponse = AiPredictionResponse.builder()
                    .success(false)
                    .errorMessage("AI 예측 테스트 실패: " + e.getMessage())
                    .build();
            
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
    
    /**
     * 더미 센서 데이터로 AI 예측 테스트
     */
    @PostMapping("/test/dummy-prediction")
    public ResponseEntity<AiPredictionResponse> testWithDummyData(@RequestParam(defaultValue = "TEST_DEVICE") String deviceId) {
        log.info("🧪 더미 데이터로 AI 예측 테스트: deviceId={}", deviceId);
        
        // 더미 센서 데이터 생성
        SensorDataDto dummyData = SensorDataDto.builder()
                .deviceId(deviceId)
                .ph(7.2)
                .doValue(6.5)
                .temperature(15.0)
                .ec(200.0)
                .bod(3.0)
                .cod(5.0)
                .tp(0.05)
                .tn(2.0)
                .ss(10.0)
                .chlorophyllA(15.0)
                .no3n(1.5)
                .measuredAt(LocalDateTime.now())
                .build();
        
        return testAiPrediction(dummyData);
    }
}