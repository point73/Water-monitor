// src/components/TimeRangePage.jsx
import React, { useState } from "react";
import { sensorApi } from '../api';
import '../styles/components.css';

function TimeRangePage() {
  const todayStr = new Date().toISOString().slice(0, 10);

  // 기간
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);

  // 조회 상태
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rows, setRows] = useState([]);
  
  // 검색된 날짜 범위 (다운로드용)
  const [searchedDateRange, setSearchedDateRange] = useState(null);
  
  // 다운로드 상태
  const [downloading, setDownloading] = useState({ csv: false, excel: false });

  const handleSearch = async () => {
    setLoading(true);
    setError("");
    setRows([]);

    // 입력값 검증
    if (!startDate || !endDate) {
      setLoading(false);
      setError("시작/종료 날짜를 선택해 주세요.");
      return;
    }
    if (endDate < startDate) {
      setLoading(false);
      setError("종료 기간이 시작 기간보다 빠릅니다.");
      return;
    }

    try {
      const data = await sensorApi.getSensorHistory(startDate, endDate);
      setRows(data);
      
      // 검색 성공 시 날짜 범위 저장
      setSearchedDateRange({ startDate, endDate });
      
      console.log("sample row:", data?.[0]);
    } catch (error) {
      console.error(error);
      setError(error.message || "데이터 조회 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // CSV 다운로드 함수
  const handleCsvDownload = () => {
    if (!searchedDateRange) return;
    
    setDownloading(prev => ({ ...prev, csv: true }));
    
    try {
      const startDateTime = `${searchedDateRange.startDate}T00:00:00`;
      const endDateTime = `${searchedDateRange.endDate}T23:59:59`;
      
      const backendUrl = 'http://localhost:8085';
      const csvUrl = `${backendUrl}/api/sensor/download/csv?startDate=${encodeURIComponent(startDateTime)}&endDate=${encodeURIComponent(endDateTime)}`;
      
      console.log('📥 CSV 다운로드 URL:', csvUrl);
      
      // window.open 방식으로 다운로드 (가장 간단)
      window.open(csvUrl, '_blank');
      
      // 2초 후 로딩 상태 해제
      setTimeout(() => {
        setDownloading(prev => ({ ...prev, csv: false }));
        console.log('✅ CSV 다운로드 완료');
      }, 2000);
      
    } catch (error) {
      console.error('❌ CSV 다운로드 오류:', error);
      setError('CSV 다운로드 중 오류가 발생했습니다: ' + error.message);
      setDownloading(prev => ({ ...prev, csv: false }));
    }
  };

  // Excel 다운로드 함수
  const handleExcelDownload = () => {
    if (!searchedDateRange) return;
    
    setDownloading(prev => ({ ...prev, excel: true }));
    
    try {
      const startDateTime = `${searchedDateRange.startDate}T00:00:00`;
      const endDateTime = `${searchedDateRange.endDate}T23:59:59`;
      
      const backendUrl = 'http://localhost:8085';
      const excelUrl = `${backendUrl}/api/sensor/download/excel?startDate=${encodeURIComponent(startDateTime)}&endDate=${encodeURIComponent(endDateTime)}`;
      
      
      // window.open 방식으로 다운로드 (가장 간단)
      window.open(excelUrl, '_blank');
      
      // 2초 후 로딩 상태 해제
      setTimeout(() => {
        setDownloading(prev => ({ ...prev, excel: false }));
      }, 2000);
      
    } catch (error) {
      console.error('❌ Excel 다운로드 오류:', error);
      setError('Excel 다운로드 중 오류가 발생했습니다: ' + error.message);
      setDownloading(prev => ({ ...prev, excel: false }));
    }
  };

  const dateOnly = (v) => (v ? String(v).slice(0, 10) : "");
  const pickDateField = (r) => r?.measuredAt ?? r?.timestamp ?? r?.time ?? r?.date ?? "";

  // 다운로드 버튼 활성화 조건: 검색 완료 && 데이터 존재
  const canDownload = searchedDateRange && rows.length > 0 && !loading;

  return (
    <div className="time-range-container">
      {/* 상단 필터 */}
      <div className="time-range-filter">
        <div className="filter-controls">
          <strong>기간설정</strong>
          <select className="filter-select" defaultValue="daily">
            <option value="daily">일별 자료</option>
            <option value="monthly">월별 자료</option>
          </select>
          
          <span className="filter-label">시작기간</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="filter-input"
            disabled={loading}
          />

          <span>종료기간</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="filter-input"
            disabled={loading}
          />
        </div>

        <div className="filter-buttons">
          <button
            onClick={handleSearch}
            disabled={loading}
            className="search-button"
          >
            {loading ? "검색 중…" : "검색"}
          </button>
        </div>
      </div>

      {/* 본문: 표 + 다운로드 버튼 */}
      <div className="data-section">
        <div className="data-header">
          <h3 className="data-title">수질 예측 데이터</h3>
          <div className="download-buttons">
            <button 
              onClick={handleCsvDownload}
              disabled={!canDownload || downloading.csv}
              title={!canDownload ? "먼저 검색을 실행해주세요" : "CSV 다운로드"}
              style={{
                opacity: !canDownload ? 0.5 : 1,
                cursor: !canDownload ? 'not-allowed' : 'pointer'
              }}
            >
              <span style={{ marginRight: 8 }}>
                {downloading.csv ? "⏳" : "⬇️"}
              </span>
              {downloading.csv ? "다운로드 중..." : "CSV"}
            </button>
            <button 
              onClick={handleExcelDownload}
              disabled={!canDownload || downloading.excel}
              title={!canDownload ? "먼저 검색을 실행해주세요" : "EXCEL 다운로드"}
              style={{
                opacity: !canDownload ? 0.5 : 1,
                cursor: !canDownload ? 'not-allowed' : 'pointer'
              }}
            >
              <span style={{ marginRight: 8 }}>
                {downloading.excel ? "⏳" : "⬇️"}
              </span>
              {downloading.excel ? "다운로드 중..." : "EXCEL"}
            </button>
          </div>
        </div>

        {/* 검색된 날짜 범위 표시 */}
        {searchedDateRange && (
          <div style={{ 
            marginBottom: '10px', 
            padding: '8px 12px', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '4px',
            fontSize: '14px',
            color: '#666'
          }}>
            📅 검색 기간: {searchedDateRange.startDate} ~ {searchedDateRange.endDate}
            {rows.length > 0 && ` (총 ${rows.length}건)`}
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        {!loading && !error && rows.length === 0 && searchedDateRange && (
          <div className="no-data-message">
            검색 결과가 없습니다.
          </div>
        )}
        
        {!searchedDateRange && (
          <div className="no-data-message">
            검색 버튼을 눌러 데이터를 조회해주세요.
          </div>
        )}

        {rows.length > 0 && (
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="table-header">번호</th>
                  <th className="table-header">측정소명</th>
                  <th className="table-header">년/월/일</th>
                  <th className="table-header">PH(mg/L)</th>
                  <th className="table-header">DO(mg/L)</th>
                  <th className="table-header">BOD(mg/L)</th>
                  <th className="table-header">COD(mg/L)</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => {
                  const ymd = dateOnly(pickDateField(row)) || "-";
                  const station = row.name ?? row.stationName ?? row.locatn ?? "-";
                  return (
                    <tr key={idx}>
                      <td className="table-cell">{idx + 1}</td>
                      <td className="table-cell">{station}</td>
                      <td className="table-cell">{ymd}</td>
                      <td className="table-cell">{fmt(row.ph)}</td>
                      <td className="table-cell">{fmt(row.doValue ?? row.do)}</td>
                      <td className="table-cell">{fmt(row.bod)}</td>
                      <td className="table-cell">{fmt(row.cod)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ===== 출력 유틸 ===== */
const fmt = (v) => (v === null || v === undefined ? "-" : v);

export default TimeRangePage;