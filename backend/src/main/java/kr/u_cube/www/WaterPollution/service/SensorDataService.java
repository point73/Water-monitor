package kr.u_cube.www.WaterPollution.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import kr.u_cube.www.WaterPollution.dto.HistoryDataDto;
import kr.u_cube.www.WaterPollution.dto.LatestSensorDto;
import kr.u_cube.www.WaterPollution.dto.SensorDataDto;
import kr.u_cube.www.WaterPollution.dto.SensorInfoDto;
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
                                .sensorInfo(sensorInfo)
                                .ph(dto.getPh())
                                .doValue(dto.getDoValue())
                                .temperature(dto.getTemperature())
                                .ec(dto.getEc())
                                .bod(dto.getBod())
                                .cod(dto.getCod())
                                .tp(dto.getTp())
                                .tn(dto.getTn())
                                .ss(dto.getSs())
                                .chlorophyllA(dto.getChlorophyllA())
                                .no3n(dto.getNo3n())
                                .measuredAt(dto.getMeasuredAt())
                                .createdAt(LocalDateTime.now())
                                .build();

                sensorDataRepository.save(entity);
        }

        public List<SensorInfoDto> getLatestSensorInfoPerDevice() {
                List<SensorData> allData = sensorDataRepository.findAll();

                // deviceId 기준 최신 데이터만 추출
                Map<String, SensorData> latestMap = allData.stream()
                                .collect(Collectors.toMap(
                                                sd -> sd.getSensorInfo().getDeviceId(),
                                                sd -> sd,
                                                (existing, replacement) -> existing.getMeasuredAt()
                                                                .isAfter(replacement.getMeasuredAt())
                                                                                ? existing
                                                                                : replacement));

                // SensorInfo만 DTO로 변환
                return latestMap.values().stream()
                                .map(sd -> {
                                        SensorInfo info = sd.getSensorInfo();
                                        return new SensorInfoDto(
                                                        info.getDeviceId(),
                                                        info.getName(),
                                                        info.getLat(),
                                                        info.getLon());
                                })
                                .toList();

        }

        public LatestSensorDto getLatestByDeviceId(String deviceId) {
                return sensorDataRepository.findTopBySensorInfo_DeviceIdOrderByMeasuredAtDesc(deviceId)
                                .map(entity -> new LatestSensorDto(
                                                entity.getSensorInfo().getDeviceId(),
                                                entity.getPh(),
                                                entity.getDoValue(),
                                                entity.getTemperature(),
                                                entity.getEc(),
                                                entity.getBod(),
                                                entity.getCod(),
                                                entity.getTp(),
                                                entity.getTn(),
                                                entity.getSs(),
                                                entity.getChlorophyllA(),
                                                entity.getNo3n(),
                                                entity.getMeasuredAt()))
                                .orElse(null);
        }

        public List<HistoryDataDto> getHistory(LocalDateTime start, LocalDateTime end) {
        return sensorDataRepository.findHistoryDataByTimestampBetween(start, end);
    }

}
