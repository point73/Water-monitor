package kr.u_cube.www.WaterPollution.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SensorDataDto {
    private String deviceId;
    private double ph;
    private double doValue;
    private double temperature;
    private double ec;
    private double turbidity;

    private double bod;
    private double tp;
    private double tn;
    private double ss;
    private double chlorophyllA;
    private double no3n;

    private LocalDateTime measuredAt;
}
