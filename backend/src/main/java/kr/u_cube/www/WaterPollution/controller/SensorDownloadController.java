package kr.u_cube.www.WaterPollution.controller;

import java.time.LocalDateTime;

import org.springframework.format.annotation.DateTimeFormat;
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
public class SensorDownloadController {

    private final SensorDownloadService sensorDownloadService;

    /**
     * CSV 다운로드
     */
    @GetMapping("/csv")
    public ResponseEntity<byte[]> downloadCSV(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        try {
            log.info("📥 CSV 다운로드 요청: {} ~ {}", startDate, endDate);
            
            // Service에서 CSV 데이터 생성
            byte[] csvBytes = sensorDownloadService.generateCSVData(startDate, endDate);
            
            // 파일명 생성
            String fileName = sensorDownloadService.generateFileName("csv", startDate, endDate);
            
            // HTTP 응답 헤더 설정
            HttpHeaders headers = createDownloadHeaders("text/csv; charset=UTF-8", fileName);
            
            log.info("✅ CSV 다운로드 성공: {} ({} bytes)", fileName, csvBytes.length);
            
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(csvBytes);
                    
        } catch (IllegalStateException e) {
            log.warn("⚠️ CSV 다운로드 - 데이터 없음: {}", e.getMessage());
            return ResponseEntity.noContent().build();
            
        } catch (Exception e) {
            log.error("❌ CSV 다운로드 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorMessage("CSV 생성 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * Excel 다운로드
     */
    @GetMapping("/excel")
    public ResponseEntity<byte[]> downloadExcel(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        try {
            log.info("📥 Excel 다운로드 요청: {} ~ {}", startDate, endDate);
            
            // Service에서 Excel 데이터 생성
            byte[] excelBytes = sensorDownloadService.generateExcelData(startDate, endDate);
            
            // 파일명 생성
            String fileName = sensorDownloadService.generateFileName("excel", startDate, endDate);
            
            // HTTP 응답 헤더 설정
            HttpHeaders headers = createDownloadHeaders(
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
            
            log.info("✅ Excel 다운로드 성공: {} ({} bytes)", fileName, excelBytes.length);
            
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(excelBytes);
                    
        } catch (IllegalStateException e) {
            log.warn("⚠️ Excel 다운로드 - 데이터 없음: {}", e.getMessage());
            return ResponseEntity.noContent().build();
            
        } catch (Exception e) {
            log.error("❌ Excel 다운로드 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorMessage("Excel 생성 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * 다운로드 가능한 데이터 개수 확인 (선택사항)
     */
    @GetMapping("/count")
    public ResponseEntity<Object> getDataCount(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        try {
            int count = sensorDownloadService.getDataCount(startDate, endDate);
            
            return ResponseEntity.ok(java.util.Map.of(
                "status", "success",
                "count", count,
                "message", count > 0 ? count + "개의 데이터가 있습니다." : "해당 기간에 데이터가 없습니다.",
                "startDate", startDate.toString(),
                "endDate", endDate.toString()
            ));
            
        } catch (Exception e) {
            log.error("❌ 데이터 개수 조회 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(java.util.Map.of(
                        "status", "error",
                        "message", "데이터 개수 조회 중 오류가 발생했습니다: " + e.getMessage()
                    ));
        }
    }

    // === 유틸리티 메서드들 ===
    
    /**
     * 다운로드용 HTTP 헤더 생성
     */
    private HttpHeaders createDownloadHeaders(String contentType, String fileName) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(contentType));
        headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"");
        return headers;
    }

    /**
     * 에러 메시지 바이트 배열 생성
     */
    private byte[] createErrorMessage(String message) {
        return message.getBytes(java.nio.charset.StandardCharsets.UTF_8);
    }
}
