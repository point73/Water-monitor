package kr.u_cube.www.WaterPollution.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LatestSensorDto {
    private String deviceId;
    private double ph;
    private double doValue;
    private double temperature;
    private double ec;
    private double bod;
    private double cod;
    private double tp;
    private double tn;
    private double ss;
    private double chlorophyllA;
    private double no3n;
    private LocalDateTime measuredAt;
}
