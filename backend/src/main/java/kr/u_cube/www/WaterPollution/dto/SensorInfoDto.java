package kr.u_cube.www.WaterPollution.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class SensorInfoDto {
    private String deviceId;
    private String name;
    private double lat;
    private double lon;
}

