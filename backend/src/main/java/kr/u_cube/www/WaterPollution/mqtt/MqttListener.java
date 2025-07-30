package kr.u_cube.www.WaterPollution.mqtt;

import org.eclipse.paho.client.mqttv3.IMqttDeliveryToken;
import org.eclipse.paho.client.mqttv3.MqttCallback;
import org.eclipse.paho.client.mqttv3.MqttClient;
import org.eclipse.paho.client.mqttv3.MqttException;
import org.eclipse.paho.client.mqttv3.MqttMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class MqttListener {

    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // mosquitto 주소
    @Value("${mqtt.broker}")
    private String brokerUrl;

    // mosquitto에서 발행자와 구독자가 만나는 연결점
    @Value("${mqtt.topic}")
    private String topic;

    private MqttClient mqttClient;
    
    @PostConstruct
    public void init() throws MqttException {
        mqttClient = new MqttClient(brokerUrl, MqttClient.generateClientId());
        mqttClient.connect();

        mqttClient.subscribe(topic);

        mqttClient.setCallback(new MqttCallback() {
            // MQTT 연결이 끊겼을 때
            @Override
            public void connectionLost(Throwable cause) {
                System.out.println("[MQTT] 연결 끊김");
            }
            // 메시지를 수신했을 때
            @Override
            public void messageArrived(String topic, MqttMessage message) throws Exception {
                try{
                String payload = new String(message.getPayload());
                JsonNode json = objectMapper.readTree(payload);
                } catch (Exception e) {
                    System.err.println("[MQTT 처리 오류] " + e.getMessage());
                }
            }
            // 메시지 전송이 완료됐을 때
            @Override
            public void deliveryComplete(IMqttDeliveryToken token) { }
        });

    }
}
