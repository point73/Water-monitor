package kr.u_cube.www.WaterPollution.service.sensor;

import org.springframework.stereotype.Service;

import kr.u_cube.www.WaterPollution.dto.SensorInfoDto;
import kr.u_cube.www.WaterPollution.dto.SensorInfoUpdateDto;
import kr.u_cube.www.WaterPollution.entity.SensorInfo;
import kr.u_cube.www.WaterPollution.repository.SensorInfoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SensorInfoService {
    
    private final SensorInfoRepository sensorInfoRepository;
    
    /**
     * ��� ���� ���� ��ȸ
     */
    public List<SensorInfoDto> getAllSensors() {
        return sensorInfoRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Ư�� ���� ���� ��ȸ
     */
    public Optional<SensorInfoDto> getSensorByDeviceId(String deviceId) {
        return sensorInfoRepository.findByDeviceId(deviceId)
                .map(this::convertToDto);
    }
    
    /**
     * ���� ���� ������Ʈ (�κ� ������Ʈ ����)
     */
    public SensorInfoDto updateSensorInfo(String deviceId, SensorInfoUpdateDto updateDto) {
        SensorInfo sensorInfo = sensorInfoRepository.findByDeviceId(deviceId)
                .orElseThrow(() -> new RuntimeException("������ ã�� �� �����ϴ�: " + deviceId));
        
        // null�� �ƴ� �ʵ常 ������Ʈ (�κ� ������Ʈ)
        if (updateDto.getName() != null) {
            sensorInfo.setName(updateDto.getName());
        }
        if (updateDto.getPtno() != null) {
            sensorInfo.setPtno(updateDto.getPtno());
        }
        if (updateDto.getType() != null) {
            sensorInfo.setType(updateDto.getType());
        }
        if (updateDto.getLat() != null) {
            sensorInfo.setLat(updateDto.getLat());
        }
        if (updateDto.getLon() != null) {
            sensorInfo.setLon(updateDto.getLon());
        }
        if (updateDto.getLocation() != null) {
            sensorInfo.setLocation(updateDto.getLocation());
        }
        
        SensorInfo updatedSensor = sensorInfoRepository.save(sensorInfo);
        
        log.info("? ���� ���� ������Ʈ �Ϸ�: {} -> {}", deviceId, updateDto);
        
        return convertToDto(updatedSensor);
    }
    
    /**
     * �⺻������ ������ ������ ��ȸ (������Ʈ �ʿ��� ������)
     */
    public List<SensorInfoDto> getSensorsNeedingUpdate() {
        List<SensorInfo> sensorsNeedingUpdate = sensorInfoRepository.findAll().stream()
                .filter(sensor -> 
                    "���� �̸� ����".equals(sensor.getName()) || 
                    "unknown".equals(sensor.getLocation()) ||
                    sensor.getLat() == 0.0 || 
                    sensor.getLon() == 0.0
                )
                .collect(Collectors.toList());
        
        return sensorsNeedingUpdate.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    /**
     * ���� ���� ����
     */
    public boolean deleteSensorInfo(String deviceId) {
        Optional<SensorInfo> sensorInfo = sensorInfoRepository.findByDeviceId(deviceId);
        if (sensorInfo.isPresent()) {
            sensorInfoRepository.delete(sensorInfo.get());
            log.info("?? ���� ���� ���� �Ϸ�: {}", deviceId);
            return true;
        }
        return false;
    }
    
    /**
     * ���� ��� ����
     */
    public Map<String, Object> getSensorStatistics() {
        List<SensorInfo> allSensors = sensorInfoRepository.findAll();
        
        long totalSensors = allSensors.size();
        long configuredSensors = allSensors.stream()
                .filter(sensor -> 
                    !"���� �̸� ����".equals(sensor.getName()) && 
                    !"unknown".equals(sensor.getLocation()) &&
                    sensor.getLat() != 0.0 && 
                    sensor.getLon() != 0.0
                )
                .count();
        
        long needsUpdateSensors = totalSensors - configuredSensors;
        
        return Map.of(
            "totalSensors", totalSensors,
            "configuredSensors", configuredSensors,
            "needsUpdateSensors", needsUpdateSensors,
            "configurationRate", totalSensors > 0 ? (double) configuredSensors / totalSensors * 100 : 0.0
        );
    }
    
    /**
     * SensorInfo�� SensorInfoDto�� ��ȯ
     */
    private SensorInfoDto convertToDto(SensorInfo sensorInfo) {
        return new SensorInfoDto(
            sensorInfo.getDeviceId(),
            sensorInfo.getName(),
            sensorInfo.getLat(),
            sensorInfo.getLon()
        );
    }
}