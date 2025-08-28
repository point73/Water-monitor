package kr.u_cube.www.WaterPollution.dto.ai;

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
public class AiPredictionRequest {
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SensorDataPoint {
        private String ds;      // 날짜 (YYYY-MM-DD 형식)
        private Double ss;      // 부유물질
        private Double bod;     // BOD
        private Double ph;      // pH
        private Double temp;    // 수온
        private Double do_value; // DO (용존산소) - 'do'는 Java 예약어이므로 do_value 사용
        private Double ec;      // 전기전도도
        private Double no3_n;   // 질산성질소
        private Double t_p;     // 총인
        private Double t_n;     // 총질소
        private Double chlorophyll_a; // 엽록소-a
        private Double cod;     // COD
    }
    
    // 수계별 센서 데이터
    private Map<String, List<SensorDataPoint>> all_sensor_data;
}
