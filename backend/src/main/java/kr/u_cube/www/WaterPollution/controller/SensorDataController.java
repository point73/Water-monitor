package kr.u_cube.www.WaterPollution.controller;

import kr.u_cube.www.WaterPollution.entity.SensorData;
import kr.u_cube.www.WaterPollution.repository.SensorDataRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/sensor")
public class SensorDataController {

    private final SensorDataRepository sensorDataRepository;

    @GetMapping("/latest")
    public ResponseEntity<SensorData> getLatestSensorData() {
        return sensorDataRepository.findTopByOrderByMeasuredAtDesc()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }
}
