package kr.u_cube.www.WaterPollution.controller;

import java.util.List;

import kr.u_cube.www.WaterPollution.dto.LatestSensorDto;
import kr.u_cube.www.WaterPollution.dto.SensorInfoDto;
import kr.u_cube.www.WaterPollution.service.SensorDataService;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/sensor")
public class SensorDataController {

    private final SensorDataService sensorDataService;

    @GetMapping("/latest/all")
    public ResponseEntity<List<SensorInfoDto>> getLatestDataPerDevice() {
        List<SensorInfoDto> list = sensorDataService.getLatestSensorInfoPerDevice();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{deviceid}")
    public ResponseEntity<LatestSensorDto> getLatestDataByDeviceId(@PathVariable("deviceid") String deviceId) {
        LatestSensorDto latestData = sensorDataService.getLatestByDeviceId(deviceId);
        if (latestData == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(latestData);
    }

}
