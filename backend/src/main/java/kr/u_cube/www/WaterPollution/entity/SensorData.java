package kr.u_cube.www.WaterPollution.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "sensor_data")
@Getter 
@Setter 
@NoArgsConstructor 
@AllArgsConstructor 
@Builder
public class SensorData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "device_id")
    private SensorInfo sensorInfo;

    // 기존
    private double ph;           // pH
    private double doValue;      // DO (용존산소)
    private double temperature;  // 수온 (Temp)
    private double ec;           // 전기전도도 (EC)
    private double turbidity;    // 탁도 (SS 등과 별도로 관리 가능)

    // 추가 (이미지 표 기준)
    private double bod;          // BOD (생물화학적 산소요구량)
    private double tp;           // T-P (총인)
    private double tn;           // T-N (총질소)
    private double ss;           // SS (부유물질)
    private double chlorophyllA; // Chlorophyll-a (엽록소-a)
    private double no3n;         // NO3-N (질산성 질소)

    private LocalDateTime measuredAt; // 측정 시각
    private LocalDateTime createdAt;  // 저장 시각

    public String getDeviceId() {
        return sensorInfo != null ? sensorInfo.getDeviceId() : null;
    }
}
