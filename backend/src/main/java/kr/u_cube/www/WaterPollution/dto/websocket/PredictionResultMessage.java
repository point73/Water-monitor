package kr.u_cube.www.WaterPollution.dto.websocket;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PredictionResultMessage {
    
    // 메시지 타입
    private String messageType; // "PREDICTION_RESULT"
    
    // 센서 기본 정보
    private String deviceId;
    private String sensorName;
    private String sugyeName;   // 수계명
    
    // 센서 측정값
    private SensorValues sensorValues;
    
    // AI 예측 결과
    private PredictionData predictionData;
    
    // 타임스탬프
    private LocalDateTime timestamp;
    
    // 요청 성공 여부
    private boolean success;
    private String errorMessage;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SensorValues {
        private Double ph;
        private Double doValue;
        private Double temperature;
        private Double ec;
        private Double bod;
        private Double cod;
        private Double tp;
        private Double tn;
        private Double ss;
        private Double chlorophyllA;
        private Double no3n;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PredictionData {
        private String sugyeName;           // 수계명
        private List<WqiPrediction> predictions; // 예측 결과 리스트
        private String overallGrade;        // 전체 등급 (최신 예측값 기준)
        private Double overallScore;        // 전체 점수 (최신 예측값 기준)
        private String alertLevel;          // 알림 레벨 (NORMAL, WARNING, CRITICAL)
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WqiPrediction {
        private String date;        // 예측 날짜 (yyyy-MM-dd)
        private Double wqiScore;    // WQI 점수 (0-100)
        private String wqiGrade;    // WQI 등급 (매우 좋음, 좋음, 보통, 나쁨, 매우 나쁨)
    }

    // 팩토리 메소드: 성공 메시지 생성
    public static PredictionResultMessage success(String deviceId, String sensorName, String sugyeName, 
                                                  SensorValues sensorValues, PredictionData predictionData) {
        return PredictionResultMessage.builder()
                .messageType("PREDICTION_RESULT")
                .deviceId(deviceId)
                .sensorName(sensorName)
                .sugyeName(sugyeName)
                .sensorValues(sensorValues)
                .predictionData(predictionData)
                .timestamp(LocalDateTime.now())
                .success(true)
                .build();
    }

    // 팩토리 메소드: 실패 메시지 생성
    public static PredictionResultMessage failure(String deviceId, String errorMessage) {
        return PredictionResultMessage.builder()
                .messageType("PREDICTION_RESULT")
                .deviceId(deviceId)
                .timestamp(LocalDateTime.now())
                .success(false)
                .errorMessage(errorMessage)
                .build();
    }
}