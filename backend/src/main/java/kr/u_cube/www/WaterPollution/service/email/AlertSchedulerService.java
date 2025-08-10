package kr.u_cube.www.WaterPollution.service.email;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AlertSchedulerService {
    
    private final BatchEmailService batchEmailService;
    
    /**
     * 매 시간 0분에 주의 단계 센서들의 배치 이메일 발송
     * cron: "0 0 * * * *" = 매시간 정각 (00분 00초)
     */
    @Scheduled(cron = "0 0 * * * *")
    public void sendHourlyWarningAlerts() {
        log.info("⏰ [스케줄러] 1시간마다 주의 단계 배치 이메일 확인 시작");
        
        try {
            batchEmailService.sendWarningAlertBatch();
            log.info("✅ [스케줄러] 주의 단계 배치 이메일 처리 완료");
        } catch (Exception e) {
            log.error("❌ [스케줄러] 주의 단계 배치 이메일 처리 실패", e);
        }
    }
    
    /**
     * 매 5분마다 오염 단계 센서들의 배치 이메일 발송 (추가 보완)
     * cron: "0 * /5 * * * *" = 매 5분마다 (0분, 5분, 10분, ...)
     * 
     * 참고: 오염 단계는 보통 즉시 발송되지만, 
     * 혹시 놓친 것이 있을 수 있어서 5분마다 한번 더 체크
     */
    @Scheduled(cron = "0 */5 * * * *")
    public void sendCriticalAlertsBackup() {
        log.info("⏰ [스케줄러] 5분마다 오염 단계 배치 이메일 백업 확인 시작");
        
        try {
            batchEmailService.sendCriticalAlertBatch();
            log.info("✅ [스케줄러] 오염 단계 배치 이메일 백업 처리 완료");
        } catch (Exception e) {
            log.error("❌ [스케줄러] 오염 단계 배치 이메일 백업 처리 실패", e);
        }
    }
    
    /**
     * 테스트용: 매 1분마다 실행 (개발/테스트 시에만 사용)
     * 운영환경에서는 주석 처리하세요!
     */
    // @Scheduled(fixedRate = 60000) // 60초마다
    public void testScheduler() {
        log.info("🧪 [테스트 스케줄러] 1분마다 실행 - 현재 시간 확인");
    }
    
    /**
     * 매일 자정에 해결된 알림들 정리 (선택사항)
     * cron: "0 0 0 * * *" = 매일 자정
     */
    @Scheduled(cron = "0 0 0 * * *")
    public void dailyAlertCleanup() {
        log.info("🧹 [스케줄러] 일일 알림 정리 작업 시작");
        
        // TODO: 필요시 구현
        // - 30일 이상 된 해결된 알림들 아카이브
        // - 통계 데이터 생성
        // - 시스템 상태 체크
        
        log.info("✅ [스케줄러] 일일 알림 정리 작업 완료");
    }
}