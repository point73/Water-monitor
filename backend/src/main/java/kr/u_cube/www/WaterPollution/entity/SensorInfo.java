package kr.u_cube.www.WaterPollution.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "sensor_info")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SensorInfo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // AUTO_INCREMENT 매핑
    private Long id; // PK

    @Column(length = 50)
    private String deviceId;

    @Column(length = 20, unique = true)
    private String ptno; // 측정소 코드 (예: 3011A40, GEOJSON PTNO)

    @Column(length = 100)
    private String name; // 센서 고유 이름 (예: 청계천 센서1)

    @Column(length = 20)
    private String type; // 측정망 종류 (하천, 호소 등)

    private double lat; // 위도
    private double lon; // 경도

    @Column(length = 255)
    private String location; // 설치 위치 설명 (예: 서울 종로구 청계천)

    private LocalDateTime installedAt;

    public SensorInfo(String deviceId) {
        this.deviceId = deviceId;
    }
}
