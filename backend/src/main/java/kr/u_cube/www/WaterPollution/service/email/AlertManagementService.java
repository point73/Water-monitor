package kr.u_cube.www.WaterPollution.service.email;

import org.springframework.stereotype.Service;

import kr.u_cube.www.WaterPollution.dto.SensorDataDto;
import kr.u_cube.www.WaterPollution.entity.SensorAlert;
import kr.u_cube.www.WaterPollution.entity.SensorAlert.AlertLevel;
import kr.u_cube.www.WaterPollution.entity.SensorData;
import kr.u_cube.www.WaterPollution.entity.SensorInfo;
import kr.u_cube.www.WaterPollution.repository.SensorAlertRepository;
import kr.u_cube.www.WaterPollution.repository.SensorDataRepository;
import kr.u_cube.www.WaterPollution.repository.SensorInfoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AlertManagementService {
    
    private final SensorAlertRepository sensorAlertRepository;
    private final SensorDataRepository sensorDataRepository;
    private final SensorInfoRepository sensorInfoRepository;
    private final BatchEmailService batchEmailService;
    
    /**
     * AI 예측 결과를 받아서 알림 생성 및 이메일 발송 처리
     */
    public void processAiPrediction(SensorDataDto sensorData, String aiPrediction) {
        String deviceId = sensorData.getDeviceId();
        
        // 현재 활성 알림이 있는지 확인 (중복 방지)
        Optional<SensorAlert> existingAlert = sensorAlertRepository.findBySensorInfo_DeviceIdAndIsResolvedFalse(deviceId);
        
        if ("정상".equals(aiPrediction)) {
            // 정상인 경우 기존 알림 해결 처리
            handleNormalPrediction(existingAlert, deviceId);
        } else {
            // 주의 또는 오염인 경우 알림 생성/유지
            handleAbnormalPrediction(existingAlert, sensorData, aiPrediction);
        }
    }
    
    /**
     * 정상 예측 처리 - 기존 알림 해결
     */
    private void handleNormalPrediction(Optional<SensorAlert> existingAlert, String deviceId) {
        if (existingAlert.isPresent()) {
            SensorAlert alert = existingAlert.get();
            alert.setIsResolved(true);
            alert.setResolvedAt(LocalDateTime.now());
            sensorAlertRepository.save(alert);
            
            log.info("✅ 센서 {} 알림 해결됨", deviceId);
        }
    }
    
    /**
     * 비정상 예측 처리 - 새 알림 생성 또는 기존 알림 유지
     */
    private void handleAbnormalPrediction(Optional<SensorAlert> existingAlert, 
                                        SensorDataDto sensorData, String aiPrediction) {
        
        AlertLevel alertLevel = AlertLevel.fromPrediction(aiPrediction);
        if (alertLevel == null) {
            return; // 예상치 못한 예측 결과
        }
        
        if (existingAlert.isEmpty()) {
            // 새로운 알림 생성
            createNewAlert(sensorData, aiPrediction, alertLevel);
        } else {
            // 기존 알림의 심각도 업데이트 (필요한 경우)
            updateExistingAlert(existingAlert.get(), aiPrediction, alertLevel);
        }
    }
    
    /**
     * 새로운 알림 생성
     */
    private void createNewAlert(SensorDataDto sensorData, String aiPrediction, AlertLevel alertLevel) {
        // SensorInfo 조회 (필수)
        SensorInfo sensorInfo = sensorInfoRepository.findByDeviceId(sensorData.getDeviceId())
                .orElseThrow(() -> new RuntimeException("센서 정보를 찾을 수 없습니다: " + sensorData.getDeviceId()));
        
        // 최근 저장된 SensorData 조회 (참조용)
        Optional<SensorData> recentSensorData = sensorDataRepository
                .findTopBySensorInfo_DeviceIdOrderByMeasuredAtDesc(sensorData.getDeviceId());
        
        SensorAlert newAlert = SensorAlert.builder()
                .sensorInfo(sensorInfo)  // SensorInfo 객체 직접 설정
                .alertLevel(alertLevel)
                .detectedAt(LocalDateTime.now())
                .predictionResult(aiPrediction)
                .isResolved(false)
                .sensorData(recentSensorData.orElse(null))
                .build();
        
        sensorAlertRepository.save(newAlert);
        
        log.info("🚨 새로운 {} 알림 생성: 센서 {}", alertLevel.getDescription(), sensorData.getDeviceId());
        
        // 알림 레벨에 따른 즉시 처리
        triggerEmailIfNeeded(alertLevel);
    }
    
    /**
     * 기존 알림 업데이트
     */
    private void updateExistingAlert(SensorAlert existingAlert, String aiPrediction, AlertLevel newAlertLevel) {
        AlertLevel currentLevel = existingAlert.getAlertLevel();
        
        // 심각도가 높아진 경우에만 업데이트
        if (shouldUpdateAlertLevel(currentLevel, newAlertLevel)) {
            existingAlert.setAlertLevel(newAlertLevel);
            existingAlert.setPredictionResult(aiPrediction);
            existingAlert.setDetectedAt(LocalDateTime.now()); // 감지 시간 갱신
            
            // 이메일 발송 상태 초기화 (심각도 변경 시 재발송 위해)
            existingAlert.setEmailSentAt(null);
            
            sensorAlertRepository.save(existingAlert);
            
            log.info("⬆️ 센서 {} 알림 심각도 상승: {} → {}", 
                    existingAlert.getDeviceId(), 
                    currentLevel.getDescription(), 
                    newAlertLevel.getDescription());
            
            // 심각도 상승 시 즉시 이메일 처리
            triggerEmailIfNeeded(newAlertLevel);
        }
    }
    
    /**
     * 알림 레벨 업데이트 필요성 판단
     */
    private boolean shouldUpdateAlertLevel(AlertLevel current, AlertLevel newLevel) {
        // 주의 → 오염으로 상승하는 경우만 업데이트
        return current == AlertLevel.WARNING && newLevel == AlertLevel.CRITICAL;
    }
    
    /**
     * 알림 레벨에 따른 이메일 발송 트리거
     */
    private void triggerEmailIfNeeded(AlertLevel alertLevel) {
        if (alertLevel == AlertLevel.CRITICAL) {
            // 오염 단계: 즉시 배치 이메일 발송
            batchEmailService.sendCriticalAlertBatch();
        }
        // 주의 단계는 스케줄러에서 1시간마다 처리
    }
}