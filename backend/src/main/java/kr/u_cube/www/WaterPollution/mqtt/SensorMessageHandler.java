package kr.u_cube.www.WaterPollution.mqtt;

import org.springframework.stereotype.Component;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import kr.u_cube.www.WaterPollution.service.SensorDataService;
import kr.u_cube.www.WaterPollution.dto.SensorDataDto;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

@Component
@RequiredArgsConstructor
public class SensorMessageHandler {

    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());
    private final SensorDataService sensorDataService;
    private final SensorAlertPublisher sensorAlertPublisher;

    public void handle(String payload) {
        try {
            SensorDataDto dto = objectMapper.readValue(payload, SensorDataDto.class);

            sensorDataService.save(dto);

            if (dto.getPh() < 5.0 || dto.getDoValue() < 2.0) {
                sensorAlertPublisher.sendAlert(dto);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

    }
}
