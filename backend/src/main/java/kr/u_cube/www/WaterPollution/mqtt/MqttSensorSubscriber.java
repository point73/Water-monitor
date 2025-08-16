package kr.u_cube.www.WaterPollution.mqtt;

import org.eclipse.paho.client.mqttv3.MqttClient;
import org.eclipse.paho.client.mqttv3.persist.MemoryPersistence;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Value;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class MqttSensorSubscriber {
    private final SensorMessageHandler messageHandler;

    @Value("${mqtt.broker}")
    private String brokerUrl;

    @Value("${mqtt.topic}")
    private String topic;

    private MqttClient client;

    @PostConstruct
    public void subscribe() {
        try {
            client = new MqttClient(brokerUrl, MqttClient.generateClientId(), new MemoryPersistence());
            client.connect();
            System.out.println("✅ MQTT 연결됨: " + brokerUrl);

            client.subscribe(topic, (t, msg) -> {
                String payload = new String(msg.getPayload());
                System.out.println("📥 MQTT 수신: " + payload);

                messageHandler.handle(payload);
            });
        } catch (Exception e) {
            System.err.println("❌ MQTT 연결 실패:");
            e.printStackTrace();

        }
    }
}
