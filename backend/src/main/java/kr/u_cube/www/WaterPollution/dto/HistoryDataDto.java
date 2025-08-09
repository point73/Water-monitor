package kr.u_cube.www.WaterPollution.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HistoryDataDto {
    // SensorInfo 필드
    private String deviceId;
    private String ptno;
    private String name;
    private String type;
    private double lat;
    private double lon;
    private String location;
    private LocalDateTime measuredAt;

    // SensorData 필드
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
}
