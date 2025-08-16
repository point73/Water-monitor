package kr.u_cube.www.WaterPollution.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import kr.u_cube.www.WaterPollution.dto.SensorInfoDto;
import kr.u_cube.www.WaterPollution.dto.SensorInfoUpdateDto;
import kr.u_cube.www.WaterPollution.service.sensor.SensorInfoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sensor-info")
@RequiredArgsConstructor
@Slf4j
public class SensorInfoController {
    
    private final SensorInfoService sensorInfoService;
    
    /**
     * 모든 센서 정보 조회
     */
    @GetMapping
    public ResponseEntity<List<SensorInfoDto>> getAllSensors() {
        List<SensorInfoDto> sensors = sensorInfoService.getAllSensors();
        return ResponseEntity.ok(sensors);
    }
    
    /**
     * 특정 센서 정보 조회
     */
    @GetMapping("/{deviceId}")
    public ResponseEntity<SensorInfoDto> getSensorByDeviceId(@PathVariable String deviceId) {
        return sensorInfoService.getSensorByDeviceId(deviceId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * 센서 정보 업데이트 (부분 업데이트 지원)
     */
    @PutMapping("/{deviceId}")
    public ResponseEntity<Map<String, Object>> updateSensorInfo(
            @PathVariable String deviceId,
            @RequestBody SensorInfoUpdateDto updateDto) {
        
        try {
            SensorInfoDto updatedSensor = sensorInfoService.updateSensorInfo(deviceId, updateDto);
            
            log.info("✅ 센서 정보 업데이트 API 호출 성공: {}", deviceId);
            
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "센서 정보가 성공적으로 업데이트되었습니다",
                "deviceId", deviceId,
                "updatedSensor", updatedSensor
            ));
            
        } catch (RuntimeException e) {
            log.error("❌ 센서 정보 업데이트 실패: {}", deviceId, e);
            return ResponseEntity.badRequest().body(Map.of(
                "status", "error",
                "message", e.getMessage(),
                "deviceId", deviceId
            ));
        }
    }
    
    /**
     * 업데이트가 필요한 센서들 조회
     */
    @GetMapping("/needs-update")
    public ResponseEntity<Map<String, Object>> getSensorsNeedingUpdate() {
        List<SensorInfoDto> sensorsNeedingUpdate = sensorInfoService.getSensorsNeedingUpdate();
        
        return ResponseEntity.ok(Map.of(
            "status", "success",
            "count", sensorsNeedingUpdate.size(),
            "sensors", sensorsNeedingUpdate,
            "message", sensorsNeedingUpdate.isEmpty() ? 
                "모든 센서 정보가 설정되었습니다" : 
                sensorsNeedingUpdate.size() + "개 센서의 정보 업데이트가 필요합니다"
        ));
    }
    
    /**
     * 센서 통계 정보
     */
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getSensorStatistics() {
        Map<String, Object> statistics = sensorInfoService.getSensorStatistics();
        return ResponseEntity.ok(Map.of(
            "status", "success",
            "data", statistics
        ));
    }
    
    /**
     * 센서 정보 삭제
     */
    @DeleteMapping("/{deviceId}")
    public ResponseEntity<Map<String, String>> deleteSensorInfo(@PathVariable String deviceId) {
        boolean deleted = sensorInfoService.deleteSensorInfo(deviceId);
        
        if (deleted) {
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "센서 정보가 삭제되었습니다",
                "deviceId", deviceId
            ));
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}