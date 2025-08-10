package kr.u_cube.www.WaterPollution.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import kr.u_cube.www.WaterPollution.entity.SensorAlert;
import kr.u_cube.www.WaterPollution.entity.SensorAlert.AlertLevel;
import kr.u_cube.www.WaterPollution.entity.SensorInfo;
import kr.u_cube.www.WaterPollution.entity.SensorData;
import kr.u_cube.www.WaterPollution.repository.SensorAlertRepository;
import kr.u_cube.www.WaterPollution.repository.SensorInfoRepository;
import kr.u_cube.www.WaterPollution.repository.SensorDataRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class BatchEmailService {
    
    private final EmailService emailService;
    private final SensorAlertRepository sensorAlertRepository;
    private final SensorInfoRepository sensorInfoRepository;
    private final SensorDataRepository sensorDataRepository;
    
    @Value("${alert.email.recipient:admin@company.com}")
    private String alertEmailRecipient;
    
    /**
     * 오염 단계 센서들을 즉시 모아서 배치 이메일 발송
     */
    @Async("emailTaskExecutor")
    public void sendCriticalAlertBatch() {
        List<SensorAlert> criticalAlerts = sensorAlertRepository
                .findByAlertLevelAndEmailSentAtIsNullAndIsResolvedFalse(AlertLevel.CRITICAL);
        
        if (criticalAlerts.isEmpty()) {
            return;
        }
        
        log.info("🔴 오염 단계 배치 이메일 발송: {}개 센서", criticalAlerts.size());
        
        String subject = String.format("🚨 [긴급] 수질오염 감지 - %d개 센서 (%s)", 
                criticalAlerts.size(), 
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("MM-dd HH:mm")));
        
        String htmlContent = generateCriticalEmailContent(criticalAlerts);
        emailService.sendAlertEmail(alertEmailRecipient, subject, htmlContent);
        markEmailSent(criticalAlerts);
    }
    
    /**
     * 주의 단계 센서들을 1시간마다 모아서 배치 이메일 발송
     */
    @Async("emailTaskExecutor")
    public void sendWarningAlertBatch() {
        List<SensorAlert> warningAlerts = sensorAlertRepository
                .findByAlertLevelAndEmailSentAtIsNullAndIsResolvedFalse(AlertLevel.WARNING);
        
        if (warningAlerts.isEmpty()) {
            return;
        }
        
        log.info("🟡 주의 단계 배치 이메일 발송: {}개 센서", warningAlerts.size());
        
        String subject = String.format("⚠️ [주의] 수질 주의보 - %d개 센서 (%s)", 
                warningAlerts.size(),
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("MM-dd HH:mm")));
        
        String htmlContent = generateWarningEmailContent(warningAlerts);
        emailService.sendAlertEmail(alertEmailRecipient, subject, htmlContent);
        markEmailSent(warningAlerts);
    }
    
    /**
     * 오염 단계 이메일 내용 생성 (공식 양식 기반)
     */
    private String generateCriticalEmailContent(List<SensorAlert> alerts) {
        LocalDateTime now = LocalDateTime.now();
        String currentDate = now.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        String currentTime = now.format(DateTimeFormatter.ofPattern("yyyy년 MM월 dd일 HH시"));
        
        StringBuilder content = new StringBuilder();
        
        content.append("""
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: 'Malgun Gothic', Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 800px; margin: 0 auto; padding: 20px; }
                    .header { border-bottom: 2px solid #dc3545; padding-bottom: 15px; margin-bottom: 20px; }
                    .warning-box { background-color: #f8d7da; border-left: 4px solid #dc3545; padding: 15px; margin: 20px 0; }
                    .link-button { background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1 style="color: #dc3545; margin: 0;">📢 [수질오염 경고] 수질 오염 지수 상승 예상 (%s)</h1>
                    </div>
                    
                    <p><strong>수신:</strong><br>[공공기관명] 담당자님</p>
                    
                    <p><strong>본문:</strong><br>
                    안녕하세요,<br>
                    <strong>U-CUBE 수질오염 감시 시스템</strong>입니다.</p>
                    
                    <p><strong>%s 기준</strong>, 아래 지역들의 수질 오염 주요 지표가 정상 범위를 초과할 가능성이 감지되었습니다. 
                    본 시스템은 다음의 항목에서 기준치를 초과할 것으로 예측하였습니다:</p>
                    
                    <h2 style="color: #dc3545;">📊 예측 수질 데이터 요약</h2>
            """.formatted(currentDate, currentTime));
        
        // 센서별 상세 정보 테이블
        for (SensorAlert alert : alerts) {
            String sensorLocation = getLocationInfoFromAlert(alert);  // 더 효율적인 방법 사용
            String detectedTime = alert.getDetectedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
            
            content.append("""
                <div style="margin-bottom: 25px; border: 1px solid #dc3545; padding: 15px; border-radius: 5px;">
                    <h3 style="color: #dc3545; margin-top: 0;">🔴 센서 %s</h3>
                    <p><strong>측정 위치:</strong> %s<br>
                    <strong>예측 시점:</strong> %s</p>
                    
                    <p><strong>예측 항목 및 수치:</strong></p>
                    <div style="margin-left: 20px;">
                        %s
                    </div>
                </div>
                """.formatted(
                    alert.getDeviceId(),
                    sensorLocation,
                    detectedTime,
                    generateSensorDetails(alert)
                ));
        }
        
        content.append("""
                    <div class="warning-box">
                        <h3 style="color: #721c24; margin-top: 0;">⚠️ 조치 권고사항:</h3>
                        <ul style="margin: 10px 0;">
                            <li>해당 지역의 수질 현장 점검 및 추가 수질 검사 권장</li>
                            <li>주민 및 관계기관 대상 사전 안내 필요 시 참고</li>
                            <li>아래 링크를 클릭하여 상세 예측 리포트를 확인하시기 바랍니다.</li>
                        </ul>
                    </div>
                    
                    <p>
                        <a href="http://localhost:3000/dashboard" class="link-button">
                            🔗 예측 상세 리포트 바로가기
                        </a>
                    </p>
                    
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
                    
                    <p>본 메일은 자동 발송 시스템에 의해 전송되었으며,<br>
                    추가 문의가 필요하신 경우 아래 연락처로 연락 바랍니다.</p>
                    
                    <p>감사합니다.</p>
                    
                    <p><strong>U-CUBE 수질오염 감시 시스템 운영팀</strong><br>
                    📞 연락처: 010-0000-0000 / ✉️ contact@u-cube.com</p>
                    
                    <div style="margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 5px;">
                        <h4 style="margin-top: 0;">📌 부가사항</h4>
                        <p style="margin-bottom: 0;">필요 시 PDF 또는 Excel 리포트 첨부 가능<br>
                        <small style="color: #6c757d;">* 상세 데이터는 위 링크를 통해 실시간 확인 가능합니다.</small></p>
                    </div>
                </div>
            </body>
            </html>
            """);
        
        return content.toString();
    }
    
    /**
     * 주의 단계 이메일 내용 생성 (공식 양식 기반)
     */
    private String generateWarningEmailContent(List<SensorAlert> alerts) {
        LocalDateTime now = LocalDateTime.now();
        String currentDate = now.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        String currentTime = now.format(DateTimeFormatter.ofPattern("yyyy년 MM월 dd일 HH시"));
        
        StringBuilder content = new StringBuilder();
        
        content.append("""
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: 'Malgun Gothic', Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 800px; margin: 0 auto; padding: 20px; }
                    .header { border-bottom: 2px solid #ffc107; padding-bottom: 15px; margin-bottom: 20px; }
                    .warning-box { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
                    .link-button { background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
                    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 14px; color: #6c757d; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1 style="color: #ffc107; margin: 0;">📢 [수질오염 경고] 수질 오염 지수 상승 예상 (%s)</h1>
                    </div>
                    
                    <p><strong>수신:</strong><br>[공공기관명] 담당자님</p>
                    
                    <p><strong>본문:</strong><br>
                    안녕하세요,<br>
                    <strong>U-CUBE 수질오염 감시 시스템</strong>입니다.</p>
                    
                    <p><strong>%s 기준</strong>, 아래 지역들의 수질 오염 주요 지표가 정상 범위를 초과할 가능성이 감지되었습니다. 
                    본 시스템은 다음의 항목에서 기준치를 초과할 것으로 예측하였습니다:</p>
                    
                    <h2 style="color: #ffc107;">📊 예측 수질 데이터 요약</h2>
            """.formatted(currentDate, currentTime));
        
        // 센서별 상세 정보
        for (SensorAlert alert : alerts) {
            String sensorLocation = getLocationInfoFromAlert(alert);  // 더 효율적인 방법 사용
            String detectedTime = alert.getDetectedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
            
            content.append("""
                <div style="margin-bottom: 25px; border: 1px solid #ffc107; padding: 15px; border-radius: 5px;">
                    <h3 style="color: #ffc107; margin-top: 0;">🟡 센서 %s</h3>
                    <p><strong>측정 위치:</strong> %s<br>
                    <strong>예측 시점:</strong> %s</p>
                    
                    <p><strong>예측 항목 및 수치:</strong></p>
                    <div style="margin-left: 20px;">
                        %s
                    </div>
                </div>
                """.formatted(
                    alert.getDeviceId(),
                    sensorLocation,
                    detectedTime,
                    generateWarningDetails(alert)
                ));
        }
        
        content.append("""
                    <div class="warning-box">
                        <h3 style="color: #856404; margin-top: 0;">⚠️ 조치 권고사항:</h3>
                        <ul style="margin: 10px 0;">
                            <li>해당 지역의 수질 현장 점검 및 추가 수질 검사 권장</li>
                            <li>주민 및 관계기관 대상 사전 안내 필요 시 참고</li>
                            <li>아래 링크를 클릭하여 상세 예측 리포트를 확인하시기 바랍니다.</li>
                        </ul>
                    </div>
                    
                    <p>
                        <a href="http://localhost:3000/dashboard" class="link-button">
                            🔗 예측 상세 리포트 바로가기
                        </a>
                    </p>
                    
                    <div class="footer">
                        <p>본 메일은 자동 발송 시스템에 의해 전송되었으며,<br>
                        추가 문의가 필요하신 경우 아래 연락처로 연락 바랍니다.</p>
                        
                        <p>감사합니다.</p>
                        
                        <p><strong>U-CUBE 수질오염 감시 시스템 운영팀</strong><br>
                        📞 연락처: 010-0000-0000 / ✉️ contact@u-cube.com</p>
                        
                        <div style="margin-top: 15px; padding: 10px; background-color: #e9ecef; border-radius: 5px;">
                            <h4 style="margin: 0 0 5px 0;">📌 부가사항</h4>
                            <p style="margin: 0; font-size: 13px;">필요 시 PDF 또는 Excel 리포트 첨부 가능</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
            """);
        
        return content.toString();
    }
    
    /**
     * 오염 단계 센서 상세 수치 정보 생성 (실제 데이터 기반)
     */
    private String generateSensorDetails(SensorAlert alert) {
        SensorData sensorData = alert.getSensorData();
        if (sensorData == null) {
            sensorData = sensorDataRepository
                    .findTopBySensorInfo_DeviceIdOrderByMeasuredAtDesc(alert.getDeviceId())
                    .orElse(null);
        }
        
        if (sensorData == null) {
            return "<strong>측정 데이터를 찾을 수 없습니다.</strong>";
        }
        
        StringBuilder details = new StringBuilder();
        
        // pH 체크 (기준: 6.5 ~ 8.5)
        Double ph = sensorData.getPh();
        if (ph != null) {
            String color = (ph < 6.5 || ph > 8.5) ? "#dc3545" : "#28a745";
            details.append(String.format(
                "<strong>pH:</strong> <span style=\"color: %s;\">%.1f</span> (기준: 6.5 ~ 8.5) → %s<br>",
                color, ph, ph < 6.5 ? "산성화 경고" : ph > 8.5 ? "알칼리화 경고" : "정상"
            ));
        }
        
        // DO 체크 (기준: ≥ 5.0 mg/L)
        Double doValue = sensorData.getDoValue();
        if (doValue != null) {
            String color = (doValue < 5.0) ? "#dc3545" : "#28a745";
            details.append(String.format(
                "<strong>DO (용존산소):</strong> <span style=\"color: %s;\">%.1f mg/L</span> (기준: ≥ 5.0 mg/L) → %s<br>",
                color, doValue, doValue < 5.0 ? "산소 부족" : "정상"
            ));
        }
        
        // BOD 체크 (기준: ≤ 8.0 mg/L)
        Double bod = sensorData.getBod();
        if (bod != null) {
            String color = (bod > 8.0) ? "#dc3545" : "#28a745";
            details.append(String.format(
                "<strong>BOD:</strong> <span style=\"color: %s;\">%.1f mg/L</span> (기준: ≤ 8.0 mg/L) → %s<br>",
                color, bod, bod > 8.0 ? "오염도 높음" : "정상"
            ));
        }
        
        // COD 체크 (기준: ≤ 10.0 mg/L)
        Double cod = sensorData.getCod();
        if (cod != null) {
            String color = (cod > 10.0) ? "#dc3545" : "#28a745";
            details.append(String.format(
                "<strong>COD:</strong> <span style=\"color: %s;\">%.1f mg/L</span> (기준: ≤ 10.0 mg/L) → %s<br>",
                color, cod, cod > 10.0 ? "오염도 높음" : "정상"
            ));
        }
        
        // 수온 정보 추가
        Double temperature = sensorData.getTemperature();
        if (temperature != null) {
            details.append(String.format(
                "<strong>수온:</strong> %.1f°C<br>", temperature
            ));
        }
        
        return details.toString();
    }
    
    /**
     * 주의 단계 센서 상세 수치 정보 생성 (실제 데이터 기반)
     */
    private String generateWarningDetails(SensorAlert alert) {
        SensorData sensorData = alert.getSensorData();
        if (sensorData == null) {
            sensorData = sensorDataRepository
                    .findTopBySensorInfo_DeviceIdOrderByMeasuredAtDesc(alert.getDeviceId())
                    .orElse(null);
        }
        
        if (sensorData == null) {
            return "<strong>측정 데이터를 찾을 수 없습니다.</strong>";
        }
        
        StringBuilder details = new StringBuilder();
        
        // pH 체크 (주의 범위: 6.0~6.5 또는 8.5~9.0)
        Double ph = sensorData.getPh();
        if (ph != null) {
            boolean isWarning = (ph >= 6.0 && ph < 6.5) || (ph > 8.5 && ph <= 9.0);
            if (isWarning) {
                details.append(String.format(
                    "<strong>pH:</strong> <span style=\"color: #ffc107;\">%.1f</span> (기준: 6.5 ~ 8.5) → %s<br>",
                    ph, ph < 6.5 ? "약간 산성" : "약간 알칼리성"
                ));
            }
        }
        
        // DO 체크 (주의 범위: 3.0~5.0 mg/L)
        Double doValue = sensorData.getDoValue();
        if (doValue != null && doValue >= 3.0 && doValue < 5.0) {
            details.append(String.format(
                "<strong>DO (용존산소):</strong> <span style=\"color: #ffc107;\">%.1f mg/L</span> (기준: ≥ 5.0 mg/L) → 다소 부족<br>",
                doValue
            ));
        }
        
        // BOD 체크 (주의 범위: 6.0~8.0 mg/L)
        Double bod = sensorData.getBod();
        if (bod != null && bod >= 6.0 && bod <= 8.0) {
            details.append(String.format(
                "<strong>BOD:</strong> <span style=\"color: #ffc107;\">%.1f mg/L</span> (기준: ≤ 8.0 mg/L) → 주의 필요<br>",
                bod
            ));
        }
        
        // COD 체크 (주의 범위: 8.0~10.0 mg/L)
        Double cod = sensorData.getCod();
        if (cod != null && cod >= 8.0 && cod <= 10.0) {
            details.append(String.format(
                "<strong>COD:</strong> <span style=\"color: #ffc107;\">%.1f mg/L</span> (기준: ≤ 10.0 mg/L) → 주의 필요<br>",
                cod
            ));
        }
        
        // 수온 정보 추가
        Double temperature = sensorData.getTemperature();
        if (temperature != null) {
            details.append(String.format(
                "<strong>수온:</strong> %.1f°C<br>", temperature
            ));
        }
        
        return details.length() > 0 ? details.toString() : "<strong>주의 단계 항목이 감지되지 않았습니다.</strong>";
    }
    
    /**
     * 이메일 발송 완료 표시
     */
    private void markEmailSent(List<SensorAlert> alerts) {
        LocalDateTime now = LocalDateTime.now();
        alerts.forEach(alert -> alert.setEmailSentAt(now));
        sensorAlertRepository.saveAll(alerts);
        
        log.info("✅ 배치 이메일 발송 완료: {}개 알림", alerts.size());
    }
    
    /**
     * 센서 위치 정보 조회 (SensorAlert에서 직접 접근)
     */
    private String getLocationInfo(String deviceId) {
        return sensorInfoRepository.findByDeviceId(deviceId)
                .map(sensorInfo -> {
                    if (sensorInfo.getLocation() != null && !sensorInfo.getLocation().equals("unknown")) {
                        return sensorInfo.getLocation();
                    } else if (sensorInfo.getName() != null && !sensorInfo.getName().equals("센서 이름 없음")) {
                        return sensorInfo.getName();
                    } else {
                        return String.format("센서 %s (위도: %.4f, 경도: %.4f)", 
                                deviceId, sensorInfo.getLat(), sensorInfo.getLon());
                    }
                })
                .orElse("위치 정보 없음");
    }
    
    /**
     * SensorAlert에서 직접 위치 정보 조회 (더 효율적)
     */
    private String getLocationInfoFromAlert(SensorAlert alert) {
        SensorInfo sensorInfo = alert.getSensorInfo();
        if (sensorInfo != null) {
            if (sensorInfo.getLocation() != null && !sensorInfo.getLocation().equals("unknown")) {
                return sensorInfo.getLocation();
            } else if (sensorInfo.getName() != null && !sensorInfo.getName().equals("센서 이름 없음")) {
                return sensorInfo.getName();
            } else {
                return String.format("센서 %s (위도: %.4f, 경도: %.4f)", 
                        alert.getDeviceId(), sensorInfo.getLat(), sensorInfo.getLon());
            }
        }
        return "위치 정보 없음";
    }
}