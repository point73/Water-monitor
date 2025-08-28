package kr.u_cube.www.WaterPollution.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

// AI 예측 응답 DTO
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiPredictionResponse {
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PredictionResult {
        private String ds;          // 예측 날짜
        private Double yhat;        // 예측된 WQI 값
        private String wqi_등급;    // WQI 등급 (매우 좋음, 좋음, 보통, 나쁨, 매우 나쁨)
    }
    
    // 수계별 예측 결과 (수계명 -> 예측 결과 리스트)
    private Map<String, Object> predictions; // Object는 List<PredictionResult> 또는 에러 메시지 String
    
    // 요청 성공 여부
    private boolean success;
    
    // 에러 메시지 (있는 경우)
    private String errorMessage;
}
