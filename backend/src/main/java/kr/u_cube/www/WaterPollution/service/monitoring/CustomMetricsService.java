package kr.u_cube.www.WaterPollution.service.monitoring;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.stereotype.Service;

import kr.u_cube.www.WaterPollution.repository.SensorDataRepository;
import kr.u_cube.www.WaterPollution.repository.SensorAlertRepository;

@Service
// @RequiredArgsConstructor 제거 - 수동 생성자 사용
public class CustomMetricsService {

    private final MeterRegistry meterRegistry;
    private final SensorDataRepository sensorDataRepository;
    private final SensorAlertRepository sensorAlertRepository;

    // 카운터 메트릭들
    private final Counter sensorDataReceivedCounter;
    private final Counter csvDownloadCounter;
    private final Counter excelDownloadCounter;
    private final Counter emailSentCounter;

    // 수동 생성자만 사용
    public CustomMetricsService(MeterRegistry meterRegistry,
            SensorDataRepository sensorDataRepository,
            SensorAlertRepository sensorAlertRepository) {
        this.meterRegistry = meterRegistry;
        this.sensorDataRepository = sensorDataRepository;
        this.sensorAlertRepository = sensorAlertRepository;

        // 카운터 초기화
        this.sensorDataReceivedCounter = Counter.builder("sensor_data_received_total")
                .description("총 수신된 센서 데이터 수")
                .register(meterRegistry);

        this.csvDownloadCounter = Counter.builder("csv_download_total")
                .description("CSV 다운로드 총 횟수")
                .register(meterRegistry);

        this.excelDownloadCounter = Counter.builder("excel_download_total")
                .description("Excel 다운로드 총 횟수")
                .register(meterRegistry);

        this.emailSentCounter = Counter.builder("email_sent_total")
                .description("발송된 이메일 총 수")
                .register(meterRegistry);

        // 게이지 메트릭 등록
        registerGaugeMetrics();
    }

    /**
     * 게이지 메트릭 등록 (실시간 값)
     */
    private void registerGaugeMetrics() {
        // 총 센서 데이터 개수
        Gauge.builder("sensor_data_count_total", this, CustomMetricsService::getTotalSensorDataCount)
                .description("데이터베이스의 총 센서 데이터 수")
                .register(meterRegistry);

        // 활성 알림 개수
        Gauge.builder("alert_count_total", this, CustomMetricsService::getActiveAlertCount)
                .description("현재 활성 상태인 알림 수")
                .register(meterRegistry);

        // 미해결 알림 개수
        Gauge.builder("unresolved_alert_count", this, CustomMetricsService::getUnresolvedAlertCount)
                .description("해결되지 않은 알림 수")
                .register(meterRegistry);
    }

    // === 카운터 메트릭 증가 메서드들 ===

    public void incrementSensorDataReceived() {
        sensorDataReceivedCounter.increment();
    }

    public void incrementCsvDownload() {
        csvDownloadCounter.increment();
    }

    public void incrementExcelDownload() {
        excelDownloadCounter.increment();
    }

    public void incrementEmailSent() {
        emailSentCounter.increment();
    }

    // === 게이지 메트릭 값 제공 메서드들 ===

    private double getTotalSensorDataCount() {
        try {
            return sensorDataRepository.count();
        } catch (Exception e) {
            return 0;
        }
    }

    private double getActiveAlertCount() {
        try {
            return sensorAlertRepository.findAllUnresolvedAlerts().size();
        } catch (Exception e) {
            return 0;
        }
    }

    private double getUnresolvedAlertCount() {
        try {
            return sensorAlertRepository.findAllUnresolvedAlerts().size();
        } catch (Exception e) {
            return 0;
        }
    }
}