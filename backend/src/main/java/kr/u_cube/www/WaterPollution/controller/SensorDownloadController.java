package kr.u_cube.www.WaterPollution.controller;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import kr.u_cube.www.WaterPollution.service.sensor.SensorDownloadService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/sensor/download")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*", exposedHeaders = {"Content-Disposition", "Content-Type", "Content-Length"})
public class SensorDownloadController {

    private final SensorDownloadService sensorDownloadService;

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");

    /**
     * CSV 다운로드
     */
    @GetMapping("/csv")
    public ResponseEntity<byte[]> downloadCSV(
            @RequestParam String startDate,
            @RequestParam String endDate) {

        try {
            LocalDateTime start = LocalDateTime.parse(startDate, FORMATTER);
            LocalDateTime end = LocalDateTime.parse(endDate, FORMATTER);

            log.info("📥 CSV 다운로드 요청: {} ~ {}", start, end);

            byte[] csvBytes = sensorDownloadService.generateCSVData(start, end);
            String fileName = sensorDownloadService.generateFileName("csv", start, end);
            HttpHeaders headers = createDownloadHeaders("text/csv; charset=UTF-8", fileName);

            log.info("✅ CSV 다운로드 성공: {} ({} bytes)", fileName, csvBytes.length);
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(csvBytes);

        } catch (IllegalStateException e) {
            log.warn("⚠️ CSV 다운로드 - 데이터 없음: {}", e.getMessage());
            return ResponseEntity.noContent()
                    .header("X-Error-Message", e.getMessage())
                    .build();

        } catch (Exception e) {
            log.error("❌ CSV 다운로드 실패", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .header("X-Error-Message", "요청 파라미터 확인 필요: " + e.getMessage())
                    .body(e.getMessage().getBytes());
        }
    }

    /**
     * Excel 다운로드
     */
    @GetMapping("/excel")
    public ResponseEntity<byte[]> downloadExcel(
            @RequestParam String startDate,
            @RequestParam String endDate) {

        try {
            LocalDateTime start = LocalDateTime.parse(startDate, FORMATTER);
            LocalDateTime end = LocalDateTime.parse(endDate, FORMATTER);

            log.info("📥 Excel 다운로드 요청: {} ~ {}", start, end);

            byte[] excelBytes = sensorDownloadService.generateExcelData(start, end);
            String fileName = sensorDownloadService.generateFileName("excel", start, end);
            HttpHeaders headers = createDownloadHeaders(
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);

            log.info("✅ Excel 다운로드 성공: {} ({} bytes)", fileName, excelBytes.length);
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(excelBytes);

        } catch (IllegalStateException e) {
            log.warn("⚠️ Excel 다운로드 - 데이터 없음: {}", e.getMessage());
            return ResponseEntity.noContent()
                    .header("X-Error-Message", e.getMessage())
                    .build();

        } catch (Exception e) {
            log.error("❌ Excel 다운로드 실패", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .header("X-Error-Message", "요청 파라미터 확인 필요: " + e.getMessage())
                    .body(e.getMessage().getBytes());
        }
    }

    private HttpHeaders createDownloadHeaders(String contentType, String fileName) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(contentType));
        headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"");
        headers.set(HttpHeaders.ACCESS_CONTROL_EXPOSE_HEADERS, "Content-Disposition, Content-Type, Content-Length");
        headers.set(HttpHeaders.CACHE_CONTROL, "no-cache, no-store, must-revalidate");
        headers.set(HttpHeaders.PRAGMA, "no-cache");
        headers.set(HttpHeaders.EXPIRES, "0");
        return headers;
    }
}
