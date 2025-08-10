package kr.u_cube.www.WaterPollution.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import kr.u_cube.www.WaterPollution.service.BatchEmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.Map;

@RestController
@RequestMapping("/api/email")
@RequiredArgsConstructor
@Slf4j
public class EmailController {
    
    private final BatchEmailService batchEmailService;
    
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
     * 현재 미발송 알림 개수 조회
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getEmailStatus() {
        // TODO: SensorAlertRepository를 통해 미발송 알림 개수 조회
        return ResponseEntity.ok(Map.of(
            "status", "active",
            "message", "이메일 시스템 정상 작동 중"
        ));
    }
}