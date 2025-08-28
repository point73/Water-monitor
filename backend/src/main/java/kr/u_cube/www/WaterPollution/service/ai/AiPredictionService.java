package kr.u_cube.www.WaterPollution.service.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import kr.u_cube.www.WaterPollution.dto.ai.AiPredictionRequest;
import kr.u_cube.www.WaterPollution.dto.ai.AiPredictionResponse;
import kr.u_cube.www.WaterPollution.dto.sensor.SensorDataDto;
import kr.u_cube.www.WaterPollution.entity.SensorInfo;
import kr.u_cube.www.WaterPollution.repository.SensorInfoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.ResourceAccessException;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiPredictionService {

    private final RestTemplate restTemplate;
    private final SensorInfoRepository sensorInfoRepository;
    private final ObjectMapper objectMapper;

    @Value("${AI_SERVER_URL}")
    private String aiServerUrl;

    @Value("${AI_PREDICTION_ENDPOINT:/predict/all_with_sensors}")
    private String predictionEndpoint;

    @Value("${AI_SERVER_TIMEOUT:10000}")
    private int aiServerTimeout;

    /**
     * 센서 데이터를 AI 서버로 보내서 예측값을 받아온다
     */
    public AiPredictionResponse requestPrediction(SensorDataDto sensorData) {
        try {
            log.info("🤖 AI 예측 요청 시작: deviceId={}", sensorData.getDeviceId());
            
            // 1. 센서 데이터를 AI 요청 형식으로 변환
            AiPredictionRequest request = convertToAiRequest(sensorData);
            
            // 2. AI 서버로 HTTP 요청 전송
            AiPredictionResponse response = sendPredictionRequest(request);
            
            log.info("✅ AI 예측 요청 완료: deviceId={}, success={}", 
                    sensorData.getDeviceId(), response.isSuccess());
            
            return response;
            
        } catch (Exception e) {
            log.error("❌ AI 예측 요청 실패: deviceId={}", sensorData.getDeviceId(), e);
            
            return AiPredictionResponse.builder()
                    .success(false)
                    .errorMessage("AI 서버 통신 오류: " + e.getMessage())
                    .predictions(new HashMap<>())
                    .build();
        }
    }

    /**
     * 센서 데이터를 AI 서버 요청 형식으로 변환
     */
    private AiPredictionRequest convertToAiRequest(SensorDataDto sensorData) {
        // 수계 정보 조회 (없으면 deviceId 사용)
        String sugyeName = getSugyeName(sensorData.getDeviceId());
        
        // 현재 날짜를 문자열로 변환
        String currentDate = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        
        // 센서 데이터 포인트 생성
        AiPredictionRequest.SensorDataPoint dataPoint = AiPredictionRequest.SensorDataPoint.builder()
                .ds(currentDate)
                .ss(sensorData.getSs())
                .bod(sensorData.getBod())
                .ph(sensorData.getPh())
                .temp(sensorData.getTemperature())
                .do_value(sensorData.getDoValue()) // 'do' 대신 'do_value' 사용
                .ec(sensorData.getEc())
                .no3_n(sensorData.getNo3n())
                .t_p(sensorData.getTp())
                .t_n(sensorData.getTn())
                .chlorophyll_a(sensorData.getChlorophyllA())
                .cod(sensorData.getCod())
                .build();

        // 수계별 데이터 맵 생성
        Map<String, List<AiPredictionRequest.SensorDataPoint>> allSensorData = new HashMap<>();
        allSensorData.put(sugyeName, Arrays.asList(dataPoint));

        return AiPredictionRequest.builder()
                .all_sensor_data(allSensorData)
                .build();
    }

    /**
     * AI 서버로 예측 요청 전송
     */
    private AiPredictionResponse sendPredictionRequest(AiPredictionRequest request) {
        try {
            // HTTP 헤더 설정
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setAccept(Arrays.asList(MediaType.APPLICATION_JSON));

            // 요청 엔티티 생성
            HttpEntity<AiPredictionRequest> requestEntity = new HttpEntity<>(request, headers);

            // AI 서버 URL 생성
            String fullUrl = aiServerUrl + predictionEndpoint;
            
            log.debug("🌐 AI 서버 요청 URL: {}", fullUrl);
            log.debug("📤 AI 서버 요청 데이터: {}", objectMapper.writeValueAsString(request));

            // HTTP POST 요청 전송
            ResponseEntity<Map> responseEntity = restTemplate.exchange(
                    fullUrl,
                    HttpMethod.POST,
                    requestEntity,
                    Map.class
            );

            if (responseEntity.getStatusCode() == HttpStatus.OK && responseEntity.getBody() != null) {
                Map<String, Object> responseBody = responseEntity.getBody();
                
                log.debug("📥 AI 서버 응답 데이터: {}", objectMapper.writeValueAsString(responseBody));

                return AiPredictionResponse.builder()
                        .success(true)
                        .predictions(responseBody)
                        .build();
            } else {
                throw new RuntimeException("AI 서버 응답 오류: " + responseEntity.getStatusCode());
            }

        } catch (ResourceAccessException e) {
            log.error("🔌 AI 서버 연결 실패: {}", e.getMessage());
            throw new RuntimeException("AI 서버에 연결할 수 없습니다", e);
        } catch (Exception e) {
            log.error("📡 AI 서버 통신 오류", e);
            throw new RuntimeException("AI 서버 통신 중 오류 발생", e);
        }
    }

    /**
     * deviceId로부터 수계명을 조회 (기본값: deviceId)
     */
    private String getSugyeName(String deviceId) {
        try {
            Optional<SensorInfo> sensorInfo = sensorInfoRepository.findByDeviceId(deviceId);
            if (sensorInfo.isPresent()) {
                String name = sensorInfo.get().getName();
                // 수계명 추출 로직 (예: "한강-서울" -> "한강")
                if (name != null && name.contains("-")) {
                    return name.split("-")[0];
                }
                return name != null ? name : deviceId;
            }
            return deviceId;
        } catch (Exception e) {
            log.warn("⚠️ 수계명 조회 실패, deviceId 사용: {}", deviceId, e);
            return deviceId;
        }
    }

    /**
     * AI 서버 상태 확인
     */
    public boolean isAiServerHealthy() {
        try {
            String healthUrl = aiServerUrl + "/health";
            ResponseEntity<String> response = restTemplate.getForEntity(healthUrl, String.class);
            return response.getStatusCode() == HttpStatus.OK;
        } catch (Exception e) {
            log.warn("🔍 AI 서버 상태 확인 실패: {}", e.getMessage());
            return false;
        }
    }
}