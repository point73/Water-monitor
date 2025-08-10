package kr.u_cube.www.WaterPollution.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "sensor_alert")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SensorAlert {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // SensorInfo와 PK 조인 (올바른 방식)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sensor_info_id", nullable = false)
    private SensorInfo sensorInfo;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "alert_level", nullable = false)
    private AlertLevel alertLevel;
    
    @Column(name = "detected_at", nullable = false)
    private LocalDateTime detectedAt;  // 최초 감지 시간
    
    @Column(name = "email_sent_at")
    private LocalDateTime emailSentAt;  // 이메일 발송 시간
    
    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;   // 정상으로 돌아온 시간
    
    @Builder.Default  // Lombok @Builder에서 기본값 사용
    @Column(name = "is_resolved", nullable = false)
    private Boolean isResolved = false;  // 해결 여부
    
    @Column(name = "prediction_result")
    private String predictionResult;  // AI 예측 결과 원본
    
    // 센서 데이터 참조 (선택사항)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sensor_data_id")
    private SensorData sensorData;
    
    // 편의 메소드: deviceId 접근
    public String getDeviceId() {
        return sensorInfo != null ? sensorInfo.getDeviceId() : null;
    }
    
    public enum AlertLevel {
        WARNING("주의"),    // 1시간 배치
        CRITICAL("오염");   // 즉시 배치
        
        private final String description;
        
        AlertLevel(String description) {
            this.description = description;
        }
        
        public String getDescription() {
            return description;
        }
        
        public static AlertLevel fromPrediction(String prediction) {
            return switch (prediction) {
                case "주의" -> WARNING;
                case "오염" -> CRITICAL;
                default -> null; // 정상인 경우
            };
        }
    }
}