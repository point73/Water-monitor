package kr.u_cube.www.WaterPollution.service.sensor;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import com.opencsv.CSVWriter;

import kr.u_cube.www.WaterPollution.dto.HistoryDataDto;
import kr.u_cube.www.WaterPollution.service.monitoring.CustomMetricsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class SensorDownloadService {

    private final SensorDataService sensorDataService;
    private final CustomMetricsService customMetricsService; // 🆕 추가

    /**
     * 지정된 기간의 센서 데이터를 CSV 형태로 생성
     */
    public byte[] generateCSVData(LocalDateTime startDate, LocalDateTime endDate) throws IOException {
        log.info("📊 CSV 데이터 생성 시작: {} ~ {}", startDate, endDate);
        
        // 데이터 조회
        List<HistoryDataDto> historyData = sensorDataService.getHistory(startDate, endDate);
        
        if (historyData.isEmpty()) {
            log.warn("⚠️ 조회된 데이터가 없습니다");
            throw new IllegalStateException("지정된 기간에 데이터가 없습니다.");
        }
        
        // CSV 생성
        byte[] csvBytes = createCSVBytes(historyData);

        // 🆕 메트릭 증가
        customMetricsService.incrementCsvDownload();
        
        log.info("✅ CSV 데이터 생성 완료: {} rows, {} bytes", historyData.size(), csvBytes.length);
        return csvBytes;
    }

    /**
     * 지정된 기간의 센서 데이터를 Excel 형태로 생성
     */
    public byte[] generateExcelData(LocalDateTime startDate, LocalDateTime endDate) throws IOException {
        log.info("📊 Excel 데이터 생성 시작: {} ~ {}", startDate, endDate);
        
        // 데이터 조회
        List<HistoryDataDto> historyData = sensorDataService.getHistory(startDate, endDate);
        
        if (historyData.isEmpty()) {
            log.warn("⚠️ 조회된 데이터가 없습니다");
            throw new IllegalStateException("지정된 기간에 데이터가 없습니다.");
        }
        
        // Excel 생성
        byte[] excelBytes = createExcelBytes(historyData);

        // 🆕 메트릭 증가
        customMetricsService.incrementExcelDownload();
        
        log.info("✅ Excel 데이터 생성 완료: {} rows, {} bytes", historyData.size(), excelBytes.length);
        return excelBytes;
    }

    /**
     * 파일명 생성
     */
    public String generateFileName(String fileType, LocalDateTime startDate, LocalDateTime endDate) {
        String startDateStr = startDate.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String endDateStr = endDate.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String extension = "csv".equalsIgnoreCase(fileType) ? "csv" : "xlsx";
        
        return String.format("sensor_data_%s_to_%s.%s", startDateStr, endDateStr, extension);
    }

    /**
     * 데이터 개수 조회 (미리 확인용)
     */
    public int getDataCount(LocalDateTime startDate, LocalDateTime endDate) {
        List<HistoryDataDto> historyData = sensorDataService.getHistory(startDate, endDate);
        return historyData.size();
    }

    /**
     * CSV 바이트 배열 생성
     */
    private byte[] createCSVBytes(List<HistoryDataDto> dataList) throws IOException {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        
        // BOM 추가 (Excel에서 한글 깨짐 방지)
        outputStream.write(0xEF);
        outputStream.write(0xBB);
        outputStream.write(0xBF);
        
        OutputStreamWriter writer = new OutputStreamWriter(outputStream, StandardCharsets.UTF_8);
        CSVWriter csvWriter = new CSVWriter(writer);
        
        try {
            // 헤더 작성
            writeCSVHeader(csvWriter);
            
            // 데이터 작성
            writeCSVData(csvWriter, dataList);
            
        } finally {
            csvWriter.close();
        }
        
        return outputStream.toByteArray();
    }

    /**
     * Excel 바이트 배열 생성
     */
    private byte[] createExcelBytes(List<HistoryDataDto> dataList) throws IOException {
        Workbook workbook = new XSSFWorkbook();
        
        try {
            Sheet sheet = workbook.createSheet("센서 데이터");
            
            // 스타일 생성
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle dataStyle = createDataStyle(workbook);
            CellStyle numberStyle = createNumberStyle(workbook);
            
            // 헤더 작성
            writeExcelHeader(sheet, headerStyle);
            
            // 데이터 작성
            writeExcelData(sheet, dataList, dataStyle, numberStyle);
            
            // 컬럼 너비 조정
            autoSizeColumns(sheet);
            
            // 바이트 배열로 변환
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();
            
        } finally {
            workbook.close();
        }
    }

    /**
     * CSV 헤더 작성
     */
    private void writeCSVHeader(CSVWriter csvWriter) {
        String[] header = {
            "번호", "디바이스ID", "측정소코드", "측정소명", "측정망종류", 
            "위도", "경도", "위치", "측정시간",
            "pH", "DO(mg/L)", "수온(°C)", "EC", "BOD(mg/L)", 
            "COD(mg/L)", "T-P(mg/L)", "T-N(mg/L)", "SS(mg/L)", 
            "Chlorophyll-a", "NO3-N(mg/L)"
        };
        csvWriter.writeNext(header);
    }

    /**
     * CSV 데이터 작성
     */
    private void writeCSVData(CSVWriter csvWriter, List<HistoryDataDto> dataList) {
        int index = 1;
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        
        for (HistoryDataDto data : dataList) {
            String[] row = {
                String.valueOf(index++),
                nvl(data.getDeviceId()),
                nvl(data.getPtno()),
                nvl(data.getName()),
                nvl(data.getType()),
                String.valueOf(data.getLat()),
                String.valueOf(data.getLon()),
                nvl(data.getLocation()),
                data.getMeasuredAt() != null ? data.getMeasuredAt().format(formatter) : "",
                formatDouble(data.getPh()),
                formatDouble(data.getDoValue()),
                formatDouble(data.getTemperature()),
                formatDouble(data.getEc()),
                formatDouble(data.getBod()),
                formatDouble(data.getCod()),
                formatDouble(data.getTp()),
                formatDouble(data.getTn()),
                formatDouble(data.getSs()),
                formatDouble(data.getChlorophyllA()),
                formatDouble(data.getNo3n())
            };
            csvWriter.writeNext(row);
        }
    }

    /**
     * Excel 헤더 작성
     */
    private void writeExcelHeader(Sheet sheet, CellStyle headerStyle) {
        Row headerRow = sheet.createRow(0);
        headerRow.setHeight((short) 600);
        
        String[] headers = {
            "번호", "디바이스ID", "측정소코드", "측정소명", "측정망종류", 
            "위도", "경도", "위치", "측정시간",
            "pH", "DO(mg/L)", "수온(°C)", "EC", "BOD(mg/L)", 
            "COD(mg/L)", "T-P(mg/L)", "T-N(mg/L)", "SS(mg/L)", 
            "Chlorophyll-a", "NO3-N(mg/L)"
        };
        
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }
    }

    /**
     * Excel 데이터 작성
     */
    private void writeExcelData(Sheet sheet, List<HistoryDataDto> dataList, 
                               CellStyle dataStyle, CellStyle numberStyle) {
        int rowNum = 1;
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        
        for (HistoryDataDto data : dataList) {
            Row row = sheet.createRow(rowNum);
            
            // 번호
            createCell(row, 0, rowNum, dataStyle);
            
            // 문자열 데이터
            createCell(row, 1, data.getDeviceId(), dataStyle);
            createCell(row, 2, data.getPtno(), dataStyle);
            createCell(row, 3, data.getName(), dataStyle);
            createCell(row, 4, data.getType(), dataStyle);
            
            // 좌표 데이터
            createCell(row, 5, data.getLat(), numberStyle);
            createCell(row, 6, data.getLon(), numberStyle);
            
            // 위치 및 시간
            createCell(row, 7, data.getLocation(), dataStyle);
            createCell(row, 8, data.getMeasuredAt() != null ? data.getMeasuredAt().format(formatter) : "", dataStyle);
            
            // 센서 측정값들
            createCell(row, 9, data.getPh(), numberStyle);
            createCell(row, 10, data.getDoValue(), numberStyle);
            createCell(row, 11, data.getTemperature(), numberStyle);
            createCell(row, 12, data.getEc(), numberStyle);
            createCell(row, 13, data.getBod(), numberStyle);
            createCell(row, 14, data.getCod(), numberStyle);
            createCell(row, 15, data.getTp(), numberStyle);
            createCell(row, 16, data.getTn(), numberStyle);
            createCell(row, 17, data.getSs(), numberStyle);
            createCell(row, 18, data.getChlorophyllA(), numberStyle);
            createCell(row, 19, data.getNo3n(), numberStyle);
            
            rowNum++;
        }
    }

    // === 스타일 생성 메서드들 ===
    
    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 12);
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.LIGHT_BLUE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        setBorders(style);
        return style;
    }

    private CellStyle createDataStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        setBorders(style);
        return style;
    }

    private CellStyle createNumberStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setAlignment(HorizontalAlignment.RIGHT);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        setBorders(style);
        return style;
    }

    private void setBorders(CellStyle style) {
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
    }

    // === 유틸리티 메서드들 ===
    
    private void createCell(Row row, int column, String value, CellStyle style) {
        Cell cell = row.createCell(column);
        cell.setCellValue(nvl(value));
        cell.setCellStyle(style);
    }

    private void createCell(Row row, int column, Number value, CellStyle style) {
        Cell cell = row.createCell(column);
        if (value != null) {
            cell.setCellValue(value.doubleValue());
        }
        cell.setCellStyle(style);
    }

    private void autoSizeColumns(Sheet sheet) {
        int columnCount = 20; // 총 컬럼 수
        for (int i = 0; i < columnCount; i++) {
            sheet.autoSizeColumn(i);
            // 최소/최대 너비 설정
            int currentWidth = sheet.getColumnWidth(i);
            if (currentWidth < 2000) {
                sheet.setColumnWidth(i, 2000);
            } else if (currentWidth > 8000) {
                sheet.setColumnWidth(i, 8000);
            }
        }
    }

    private String formatDouble(Double value) {
        return value != null ? String.format("%.2f", value) : "";
    }

    private String nvl(String value) {
        return value != null ? value : "";
    }
}