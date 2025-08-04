package kr.u_cube.www.WaterPollution.service;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import kr.u_cube.www.WaterPollution.dto.SensorDataDto;
import kr.u_cube.www.WaterPollution.entity.SensorData;
import kr.u_cube.www.WaterPollution.entity.SensorInfo;
import kr.u_cube.www.WaterPollution.repository.SensorDataRepository;
import kr.u_cube.www.WaterPollution.repository.SensorInfoRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SensorDataService {
    private final SensorDataRepository sensorDataRepository;
    private final SensorInfoRepository sensorInfoRepository;

    public void save(SensorDataDto dto) {
        SensorInfo sensorInfo = sensorInfoRepository.findByDeviceId(dto.getDeviceId())
                .orElseGet(() -> {
                    // 2. 없으면 신규 등록
                    SensorInfo newInfo = SensorInfo.builder()
                            .deviceId(dto.getDeviceId())
                            .name("센서 이름 없음")
                            .lat(0.0)
                            .lon(0.0)
                            .installedAt(LocalDateTime.now())
                            .location("unknown")
                            .build();
                    return sensorInfoRepository.save(newInfo);
                });

        SensorData entity = SensorData.builder()
                .sensorInfo(new SensorInfo(dto.getDeviceId()))
                .ph(dto.getPh())
                .doValue(dto.getDoValue())
                .temperature(dto.getTemperature())
                .ec(dto.getEc())
                .turbidity(dto.getTurbidity())
                .measuredAt(dto.getMeasuredAt())
                .createdAt(LocalDateTime.now())
                .build();

        sensorDataRepository.save(entity);
    }
}
