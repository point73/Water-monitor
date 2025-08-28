package kr.u_cube.www.WaterPollution.mqtt;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import kr.u_cube.www.WaterPollution.dto.sensor.SensorDataDto;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class SensorAlertPublisher {
    
    private final SimpMessagingTemplate messagingTemplate;

    public void sendAlert(SensorDataDto dto) {
        messagingTemplate.convertAndSend("/water/alert", dto);
    }
}
