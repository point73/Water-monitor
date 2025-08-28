package kr.u_cube.www.WaterPollution.mqtt;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import kr.u_cube.www.WaterPollution.dto.ai.AiPredictionResponse;
import kr.u_cube.www.WaterPollution.dto.sensor.SensorDataDto;
import kr.u_cube.www.WaterPollution.dto.websocket.PredictionResultMessage;
import kr.u_cube.www.WaterPollution.entity.SensorInfo;
import kr.u_cube.www.WaterPollution.repository.SensorInfoRepository;
import kr.u_cube.www.WaterPollution.service.ai.AiPredictionService;
import kr.u_cube.www.WaterPollution.service.sensor.SensorDataService;
import kr.u_cube.www.WaterPollution.websocket.PredictionResultPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class SensorMessageHandler {

    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());
    private final SensorDataService sensorDataService;
    private final SensorAlertPublisher sensorAlertPublisher;
    private final AiPredictionService aiPredictionService;
    private final PredictionResultPublisher predictionResultPublisher;
    private final SensorInfoRepository sensorInfoRepository;

    /**
     * MQTT로 수신된 센서 데이터 처리
     * 1. 센서 데이터를 DB에 저장
     * 2. AI 서버에 예측 요청
     * 3. 예측 결과를 WebSocket으로 전송
     */
    public void handle(String payload) {
        try {
            log.info("📥 MQTT 센서 데이터 수신: {}", payload);
            
            // 1. JSON 파싱
            SensorDataDto dto = objectMapper.readValue(payload, SensorDataDto.class);
            
            // 2. 데이터 검증
            if (!isValidSensorData(dto)) {
                            log.warn("⚠️ 유효하지 않은 센서 데이터: deviceId={}", dto.getDeviceId());
                            return;
                        }
                        
                        // 3. DB에 센서 데이터 저장 (동기)
                        sensorDataService.save(dto);
                        log.info("💾 센서 데이터 저장 완료: deviceId={}", dto.getDeviceId());
                        
                        // 4. 기존 알림 로직 (동기)
                        checkAndSendAlert(dto);
                                                
                                                // 5. AI 예측 요청 및 결과 전송 (비동기)
                                                processAiPredictionAsync(dto);
                                                
                                            } catch (Exception e) {
                                                log.error("❌ MQTT 센서 데이터 처리 실패: payload={}", payload, e);
                                            }
                                        }
                                    
                                        private void checkAndSendAlert(SensorDataDto dto) {
                                // TODO Auto-generated method stub
                                throw new UnsupportedOperationException("Unimplemented method 'checkAndSendAlert'");
                            }
                        
                                        private boolean isValidSensorData(SensorDataDto dto) {
                    // TODO Auto-generated method stub
                    throw new UnsupportedOperationException("Unimplemented method 'isValidSensorData'");
                }
            
                /**
     * AI 예측 요청 및 결과 처리 (비동기)
     */
    @Async("emailTaskExecutor")
    public void processAiPredictionAsync(SensorDataDto sensorData) {
        try {
            log.info("🤖 AI 예측 처리 시작: deviceId={}", sensorData.getDeviceId());
            
            // 1. AI 서버에 예측 요청
            AiPredictionResponse aiResponse = aiPredictionService.requestPrediction(sensorData);
            
            // 2. 예측 결과를 WebSocket 메시지로 변환
            PredictionResultMessage wsMessage = convertToWebSocketMessage(sensorData, aiResponse);
            
            // 3. WebSocket으로 결과 전송
            predictionResultPublisher.publishPredictionResult(wsMessage);
            
            log.info("✅ AI 예측 처리 완료: deviceId={}, success={}", 
                    sensorData.getDeviceId(), aiResponse.isSuccess());
            
        } catch (Exception e) {
            log.error("❌ AI 예측 처리 실패: deviceId={}", sensorData.getDeviceId(), e);
            
            // 실패 메시지를 WebSocket으로 전송
            PredictionResultMessage failureMessage = PredictionResultMessage.failure(
                    sensorData.getDeviceId(), 
                    "AI 예측 처리 중 오류 발생: " + e.getMessage()
            );
            predictionResultPublisher.publishPredictionResult(failureMessage);
        }
    }

    // /**
    //  * 센서 데이터 유효성 검증
    //  */
    // private boolean isValidSensorData(SensorDataDto dto) {
    //     if (dto == null || dto.getDeviceId() == null || dto.getDeviceId().trim().isEmpty()) {
    //         return false;
    //     }
        
    //     // 필수 센서 값 중 최소 하나는 있어야 함
    //     return dto.getPh() != null || dto.getDoValue() != null ||
    //            dto.getBod() != null || dto.getCod() != null;
    // }

    // /**
    //  * 기존 알림 체크 로직
    //  */
    // private void checkAndSendAlert(SensorDataDto dto) {
    //     try {
    //         // 기존 임계값 체크 로직
    //         if (dto.getPh() != null && (dto.getPh() < 5.0 || dto.getPh() > 9.0)) {
    //             sensorAlertPublisher.sendAlert(dto);
    //         } else if (dto.getDoValue() != null && dto.getDoValue() < 2.0) {
    //             sensorAlertPublisher.sendAlert(dto);
    //         }
    //     } catch (Exception e) {
    //         log.error("❌ 센서 알림 체크 실패: deviceId={}", dto.getDeviceId(), e);
    //     }
    // }

    /**
     * AI 예측 결과를 WebSocket 메시지로 변환
     */
    private PredictionResultMessage convertToWebSocketMessage(SensorDataDto sensorData, 
                                                              AiPredictionResponse aiResponse) {
        // 센서 정보 조회
        String sensorName = "Unknown";
        String sugyeName = sensorData.getDeviceId();
        
        try {
            Optional<SensorInfo> sensorInfo = sensorInfoRepository.findByDeviceId(sensorData.getDeviceId());
            if (sensorInfo.isPresent()) {
                sensorName = sensorInfo.get().getName() != null ? sensorInfo.get().getName() : "Unknown";
                if (sensorName.contains("-")) {
                    sugyeName = sensorName.split("-")[0];
                }
            }
        } catch (Exception e) {
            log.warn("⚠️ 센서 정보 조회 실패: deviceId={}", sensorData.getDeviceId(), e);
        }

        // 센서 측정값 변환
        PredictionResultMessage.SensorValues sensorValues = PredictionResultMessage.SensorValues.builder()
                .ph(sensorData.getPh())
                .doValue(sensorData.getDoValue())
                .temperature(sensorData.getTemperature())
                .ec(sensorData.getEc())
                .bod(sensorData.getBod())
                .cod(sensorData.getCod())
                .tp(sensorData.getTp())
                .tn(sensorData.getTn())
                .ss(sensorData.getSs())
                .chlorophyllA(sensorData.getChlorophyllA())
                .no3n(sensorData.getNo3n())
                .build();

        if (!aiResponse.isSuccess()) {
            // AI 예측 실패 시
            return PredictionResultMessage.failure(sensorData.getDeviceId(), aiResponse.getErrorMessage());
        }

        // AI 예측 성공 시 데이터 변환
        PredictionResultMessage.PredictionData predictionData = convertAiResponseToPredictionData(
                sugyeName, aiResponse);

        return PredictionResultMessage.success(
                sensorData.getDeviceId(),
                sensorName,
                sugyeName,
                sensorValues,
                predictionData
        );
    }

    /**
     * AI 응답을 예측 데이터로 변환
     */
    @SuppressWarnings("unchecked")
    private PredictionResultMessage.PredictionData convertAiResponseToPredictionData(String sugyeName, 
                                                                                     AiPredictionResponse aiResponse) {
        try {
            Map<String, Object> predictions = aiResponse.getPredictions();
            Object sugyeData = predictions.get(sugyeName);
            
            if (sugyeData instanceof List) {
                List<Map<String, Object>> predictionList = (List<Map<String, Object>>) sugyeData;
                
                List<PredictionResultMessage.WqiPrediction> wqiPredictions = predictionList.stream()
                        .map(this::convertToWqiPrediction)
                        .filter(Objects::nonNull)
                        .collect(Collectors.toList());
                
                // 최신 예측값으로 전체 상태 결정
                String overallGrade = "보통";
                Double overallScore = 50.0;
                String alertLevel = "NORMAL";
                
                if (!wqiPredictions.isEmpty()) {
                    PredictionResultMessage.WqiPrediction latest = wqiPredictions.get(wqiPredictions.size() - 1);
                    overallGrade = latest.getWqiGrade();
                    overallScore = latest.getWqiScore();
                    alertLevel = determineAlertLevel(overallScore);
                }
                
                return PredictionResultMessage.PredictionData.builder()
                        .sugyeName(sugyeName)
                        .predictions(wqiPredictions)
                        .overallGrade(overallGrade)
                        .overallScore(overallScore)
                        .alertLevel(alertLevel)
                        .build();
            } else {
                // 에러 메시지인 경우
                log.warn("⚠️ AI 예측 결과가 리스트가 아님: {}", sugyeData);
                return createDefaultPredictionData(sugyeName);
            }
            
        } catch (Exception e) {
            log.error("❌ AI 응답 변환 실패", e);
            return createDefaultPredictionData(sugyeName);
        }
    }

    /**
     * Map 데이터를 WqiPrediction 객체로 변환
     */
    private PredictionResultMessage.WqiPrediction convertToWqiPrediction(Map<String, Object> predictionMap) {
        try {
            String ds = (String) predictionMap.get("ds");
            Object yhatObj = predictionMap.get("yhat");
            String wqiGrade = (String) predictionMap.get("WQI_등급");
            
            Double yhat = null;
            if (yhatObj instanceof Number) {
                yhat = ((Number) yhatObj).doubleValue();
            }
            
            return PredictionResultMessage.WqiPrediction.builder()
                    .date(ds)
                    .wqiScore(yhat)
                    .wqiGrade(wqiGrade != null ? wqiGrade : "보통")
                    .build();
                    
        } catch (Exception e) {
            log.error("❌ WQI 예측 데이터 변환 실패", e);
            return null;
        }
    }

    /**
     * WQI 점수에 따른 알림 레벨 결정
     */
    private String determineAlertLevel(Double wqiScore) {
        if (wqiScore == null) return "NORMAL";
        
        if (wqiScore <= 25) {
            return "CRITICAL";  // 매우 나쁨
        } else if (wqiScore <= 50) {
            return "WARNING";   // 나쁨
        } else {
            return "NORMAL";    // 보통 이상
        }
    }

    /**
     * 기본 예측 데이터 생성 (AI 서버 오류 시)
     */
    private PredictionResultMessage.PredictionData createDefaultPredictionData(String sugyeName) {
        PredictionResultMessage.WqiPrediction defaultPrediction = PredictionResultMessage.WqiPrediction.builder()
                .date(java.time.LocalDate.now().toString())
                .wqiScore(50.0)
                .wqiGrade("보통")
                .build();
        
        return PredictionResultMessage.PredictionData.builder()
                .sugyeName(sugyeName)
                .predictions(Arrays.asList(defaultPrediction))
                .overallGrade("보통")
                .overallScore(50.0)
                .alertLevel("NORMAL")
                .build();
    }
}