package kr.u_cube.www.WaterPollution.dto.sensor;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Data
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SensorDataDto {
    private String deviceId;
    private double ph;
    private double doValue;
    private double temperature;
    private double ec;
    private double turbidity;
    private double bod;
    private double cod;
    private double tp;
    private double tn;
    private double ss;
    private double chlorophyllA;
    private double no3n;

    private LocalDateTime measuredAt;
}
