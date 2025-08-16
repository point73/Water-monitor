package kr.u_cube.www.WaterPollution.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import kr.u_cube.www.WaterPollution.entity.SensorAlert;
import kr.u_cube.www.WaterPollution.entity.SensorAlert.AlertLevel;

@Repository
public interface SensorAlertRepository extends JpaRepository<SensorAlert, Long> {
    
    /**
     * 특정 심각도의 미발송 & 미해결 알림들 조회 (SensorInfo와 함께)
     */
    @Query("SELECT sa FROM SensorAlert sa JOIN FETCH sa.sensorInfo WHERE sa.alertLevel = :alertLevel AND sa.emailSentAt IS NULL AND sa.isResolved = false")
    List<SensorAlert> findByAlertLevelAndEmailSentAtIsNullAndIsResolvedFalse(AlertLevel alertLevel);
    
    /**
     * 특정 센서의 현재 활성 알림 조회 (중복 방지용)
     */
    Optional<SensorAlert> findBySensorInfo_DeviceIdAndIsResolvedFalse(String deviceId);
    
    /**
     * 특정 시간 이후 생성된 미발송 알림들 조회
     */
    @Query("SELECT sa FROM SensorAlert sa JOIN FETCH sa.sensorInfo WHERE sa.detectedAt >= :since AND sa.emailSentAt IS NULL AND sa.isResolved = false")
    List<SensorAlert> findUnsentAlertsSince(LocalDateTime since);
    
    /**
     * 특정 센서의 최근 알림 조회 (상태 변화 감지용)
     */
    Optional<SensorAlert> findTopBySensorInfo_DeviceIdOrderByDetectedAtDesc(String deviceId);
    
    /**
     * 해결되지 않은 모든 알림 조회 (대시보드용)
     */
    @Query("SELECT sa FROM SensorAlert sa JOIN FETCH sa.sensorInfo WHERE sa.isResolved = false ORDER BY sa.detectedAt DESC")
    List<SensorAlert> findAllUnresolvedAlerts();
    
    /**
     * 특정 기간의 알림 통계 조회
     */
    @Query("SELECT sa.alertLevel, COUNT(sa) FROM SensorAlert sa WHERE sa.detectedAt BETWEEN :start AND :end GROUP BY sa.alertLevel")
    List<Object[]> getAlertStatistics(LocalDateTime start, LocalDateTime end);
}