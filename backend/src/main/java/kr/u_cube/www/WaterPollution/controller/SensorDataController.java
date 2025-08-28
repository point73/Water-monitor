package kr.u_cube.www.WaterPollution.controller;

import java.time.LocalDateTime;
import java.util.List;

import kr.u_cube.www.WaterPollution.dto.HistoryDataDto;
import kr.u_cube.www.WaterPollution.dto.LatestSensorDto;
import kr.u_cube.www.WaterPollution.dto.sensor.SensorInfoDto;
import kr.u_cube.www.WaterPollution.service.sensor.SensorDataService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@Slf4j
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

    @GetMapping("/history")
    public ResponseEntity<List<HistoryDataDto>> getHistory(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {

        log.info("history query startDate={}, endDate={}", startDate, endDate); // 파라미터 확인
        List<HistoryDataDto> result = sensorDataService.getHistory(startDate, endDate);
        return ResponseEntity.ok(result);
    }

}
