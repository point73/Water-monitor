package kr.u_cube.www.WaterPollution.service.email;

import org.springframework.stereotype.Service;

import kr.u_cube.www.WaterPollution.entity.SensorAlert;
import kr.u_cube.www.WaterPollution.entity.SensorAlert.AlertLevel;
import kr.u_cube.www.WaterPollution.repository.SensorAlertRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailStatusService {
    
    private final SensorAlertRepository sensorAlertRepository;
    
    /**
     * 이메일 시스템 전체 상태 조회
     */
    public Map<String, Object> getEmailSystemStatus() {
        try {
            LocalDateTime now = LocalDateTime.now();
            
            // 미발송 알림 개수 조회
            Map<String, Integer> pendingAlerts = getPendingAlertsCount();
            
            // 미해결 알림 개수 조회
            int unresolvedCount = getUnresolvedAlertsCount();
            
            // 최근 24시간 통계
            Map<String, Long> last24HourStats = getLast24HourStatistics();
            
            // 다음 스케줄 시간
            Map<String, String> nextSchedule = getNextScheduleTimes(now);
            
            // 응답 구성
            Map<String, Object> response = new HashMap<>();
            response.put("status", "active");
            response.put("message", "이메일 시스템 정상 작동 중");
            response.put("timestamp", now.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
            response.put("pendingAlerts", pendingAlerts);
            response.put("unresolvedAlerts", unresolvedCount);
            response.put("last24HourStats", last24HourStats);
            response.put("nextSchedule", nextSchedule);
            
            log.info("📊 이메일 상태 조회 완료 - 미발송: {}개, 미해결: {}개", 
                    pendingAlerts.get("total"), unresolvedCount);
            
            return response;
            
        } catch (Exception e) {
            log.error("❌ 이메일 상태 조회 실패", e);
            throw new RuntimeException("이메일 상태 조회 중 오류 발생", e);
        }
    }
    
    /**
     * 미발송 알림 개수 조회
     */
    public Map<String, Integer> getPendingAlertsCount() {
        // 미발송 오염 단계 알림
        List<SensorAlert> criticalAlerts = sensorAlertRepository
                .findByAlertLevelAndEmailSentAtIsNullAndIsResolvedFalse(AlertLevel.CRITICAL);
        
        // 미발송 주의 단계 알림
        List<SensorAlert> warningAlerts = sensorAlertRepository
                .findByAlertLevelAndEmailSentAtIsNullAndIsResolvedFalse(AlertLevel.WARNING);
        
        Map<String, Integer> pendingAlerts = new HashMap<>();
        pendingAlerts.put("critical", criticalAlerts.size());
        pendingAlerts.put("warning", warningAlerts.size());
        pendingAlerts.put("total", criticalAlerts.size() + warningAlerts.size());
        
        return pendingAlerts;
    }
    
    /**
     * 미해결 알림 개수 조회
     */
    public int getUnresolvedAlertsCount() {
        List<SensorAlert> unresolvedAlerts = sensorAlertRepository.findAllUnresolvedAlerts();
        return unresolvedAlerts.size();
    }
    
    /**
     * 최근 24시간 알림 통계
     */
    public Map<String, Long> getLast24HourStatistics() {
        LocalDateTime yesterday = LocalDateTime.now().minusDays(1);
        LocalDateTime now = LocalDateTime.now();
        
        List<Object[]> alertStats = sensorAlertRepository.getAlertStatistics(yesterday, now);
        
        Map<String, Long> stats = new HashMap<>();
        stats.put("주의", 0L);  // 기본값 설정
        stats.put("오염", 0L);
        
        // 실제 통계로 덮어쓰기
        for (Object[] stat : alertStats) {
            AlertLevel level = (AlertLevel) stat[0];
            Long count = (Long) stat[1];
            stats.put(level.getDescription(), count);
        }
        
        return stats;
    }
    
    /**
     * 다음 스케줄 실행 시간 계산
     */
    public Map<String, String> getNextScheduleTimes(LocalDateTime now) {
        // 다음 정시 (주의 단계 배치)
        LocalDateTime nextHourly = now.withMinute(0).withSecond(0).withNano(0).plusHours(1);
        
        // 다음 5분 단위 (오염 단계 백업)
        LocalDateTime next5Min = now.withSecond(0).withNano(0);
        int minutes = next5Min.getMinute();
        int nextInterval = ((minutes / 5) + 1) * 5;
        
        if (nextInterval >= 60) {
            next5Min = next5Min.plusHours(1).withMinute(0);
        } else {
            next5Min = next5Min.withMinute(nextInterval);
        }
        
        Map<String, String> schedule = new HashMap<>();
        schedule.put("warningBatch", nextHourly.format(DateTimeFormatter.ofPattern("HH:mm")));
        schedule.put("criticalBackup", next5Min.format(DateTimeFormatter.ofPattern("HH:mm")));
        
        return schedule;
    }
    
    /**
     * 간단한 상태 체크 (헬스체크용)
     */
    public boolean isEmailSystemHealthy() {
        try {
            // 기본적인 데이터베이스 연결 체크
            sensorAlertRepository.count();
            return true;
        } catch (Exception e) {
            log.error("❌ 이메일 시스템 헬스체크 실패", e);
            return false;
        }
    }
}