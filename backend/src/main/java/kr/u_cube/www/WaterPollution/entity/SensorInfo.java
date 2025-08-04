package kr.u_cube.www.WaterPollution.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "sensor_info")
@Getter 
@Setter 
@Builder
@NoArgsConstructor 
@AllArgsConstructor
public class SensorInfo {

    @Id
    @Column(length = 50)
    private String deviceId;

    private String name; // 청계천 센서1 (센서 고유 이름)
    private double lat;
    private double lon;
    private LocalDateTime installedAt;

    private String location; // 서울 종로구 청계천 (설치 위치 설명)

    public SensorInfo(String deviceId) {
        this.deviceId = deviceId;
    }
}
