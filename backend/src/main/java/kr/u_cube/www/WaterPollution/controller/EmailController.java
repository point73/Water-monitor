package kr.u_cube.www.WaterPollution.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import kr.u_cube.www.WaterPollution.service.email.BatchEmailService;
import kr.u_cube.www.WaterPollution.service.email.EmailStatusService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

@RestController
@RequestMapping("/api/email")
@RequiredArgsConstructor
@Slf4j
public class EmailController {
    
    private final BatchEmailService batchEmailService;
    private final EmailStatusService emailStatusService;  // Service 계층 사용
    
    /**
     * 테스트용: 오염 단계 배치 이메일 수동 발송
     */
    @PostMapping("/test/critical")
    public ResponseEntity<Map<String, String>> testCriticalEmail() {
        log.info("🧪 [테스트] 오염 단계 배치 이메일 수동 발송 요청");
        
        try {
            batchEmailService.sendCriticalAlertBatch();
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "오염 단계 배치 이메일 발송 완료"
            ));
        } catch (Exception e) {
            log.error("❌ [테스트] 오염 단계 배치 이메일 발송 실패", e);
            return ResponseEntity.internalServerError().body(Map.of(
                "status", "error",
                "message", "이메일 발송 실패: " + e.getMessage()
            ));
        }
    }
    
    /**
     * 테스트용: 주의 단계 배치 이메일 수동 발송
     */
    @PostMapping("/test/warning")
    public ResponseEntity<Map<String, String>> testWarningEmail() {
        log.info("🧪 [테스트] 주의 단계 배치 이메일 수동 발송 요청");
        
        try {
            batchEmailService.sendWarningAlertBatch();
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "주의 단계 배치 이메일 발송 완료"
            ));
        } catch (Exception e) {
            log.error("❌ [테스트] 주의 단계 배치 이메일 발송 실패", e);
            return ResponseEntity.internalServerError().body(Map.of(
                "status", "error",
                "message", "이메일 발송 실패: " + e.getMessage()
            ));
        }
    }
    
    /**
     * 이메일 시스템 상태 및 미발송 알림 개수 조회
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getEmailStatus() {
        try {
            Map<String, Object> status = emailStatusService.getEmailSystemStatus();
            return ResponseEntity.ok(status);
        } catch (Exception e) {
            log.error("❌ 이메일 상태 조회 실패", e);
            return ResponseEntity.internalServerError().body(Map.of(
                "status", "error",
                "message", "상태 조회 실패: " + e.getMessage(),
                "timestamp", LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))
            ));
        }
    }
    
    /**
     * 간단한 헬스체크 API
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> getEmailHealth() {
        boolean isHealthy = emailStatusService.isEmailSystemHealthy();
        
        return ResponseEntity.ok(Map.of(
            "status", isHealthy ? "UP" : "DOWN",
            "service", "email-system",
            "timestamp", LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))
        ));
    }
}