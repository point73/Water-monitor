// src/components/TimeRangePage.jsx
import React, { useMemo, useState, useCallback } from "react";
import { sensorApi } from '../api';
import '../styles/components.css';

function TimeRangePage() {
  const todayStr = new Date().toISOString().slice(0, 10);

  // 기간
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);

  // 측정소명 검색어
  const [stationQuery, setStationQuery] = useState("");

  // 조회 상태
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 원본 rows (기간 조회 결과 보관)
  const [rows, setRows] = useState([]);

  // 검색된 날짜 범위 (다운로드용)
  const [searchedDateRange, setSearchedDateRange] = useState(null);

  // 다운로드 상태
  const [downloading, setDownloading] = useState({ csv: false, excel: false });

  // 유틸: 값 포맷
  const dateOnly = (v) => (v ? String(v).slice(0, 10) : "");
  const pickDateField = (r) => r?.measuredAt ?? r?.timestamp ?? r?.time ?? r?.date ?? "";
  const fmt = (v) => (v === null || v === undefined ? "-" : v);

  // 유틸: 측정소명 통일해서 꺼내기
  const pickStation = (r) => r?.name ?? r?.stationName ?? r?.locatn ?? "";

  // 유틸: 문자열 정규화(대소문자/공백 무시)
  const normalize = (s) =>
    (s ?? "")
      .toString()
      .toLowerCase()
      .replace(/\s+/g, "");

  // 표시용 행: 기간 결과(rows)에서 측정소명(stationQuery)로 추가 필터
  const displayRows = useMemo(() => {
    if (!stationQuery.trim()) return rows;
    const q = normalize(stationQuery);
    return rows.filter((r) => normalize(pickStation(r)).includes(q));
  }, [rows, stationQuery]);

  // 다운로드 버튼 활성화: 검색 완료 && 표시 데이터 존재 && 로딩 아님
  const canDownload = searchedDateRange && displayRows.length > 0 && !loading;

  // 기간 조회
  const handleSearch = useCallback(async () => {
    setLoading(true);
    setError("");
    setRows([]);

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
      setRows(Array.isArray(data) ? data : []);
      setSearchedDateRange({ startDate, endDate });
      console.log("검색 결과:", data?.length || 0, "건");
    } catch (err) {
      console.error(err);
      setError(err?.message || "데이터 조회 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  // CSV 다운로드 (필터 적용 버전: 현재 표시 중인 데이터만 CSV 요청하고 싶다면 백엔드에 별도 엔드포인트 필요)
  const handleCsvDownload = async () => {
    if (!searchedDateRange) return;
    setDownloading((p) => ({ ...p, csv: true }));
    try {
      await sensorApi.downloadCSV(searchedDateRange.startDate, searchedDateRange.endDate);
      console.log('✅ CSV 다운로드 시작됨');
    } catch (err) {
      console.error('❌ CSV 다운로드 오류:', err);
      setError(err?.message || "CSV 다운로드 중 오류가 발생했습니다.");
    } finally {
      setTimeout(() => setDownloading((p) => ({ ...p, csv: false })), 2000);
    }
  };

  // Excel 다운로드
  const handleExcelDownload = async () => {
    if (!searchedDateRange) return;
    setDownloading((p) => ({ ...p, excel: true }));
    try {
      await sensorApi.downloadExcel(searchedDateRange.startDate, searchedDateRange.endDate);
      console.log('✅ Excel 다운로드 시작됨');
    } catch (err) {
      console.error('❌ Excel 다운로드 오류:', err);
      setError(err?.message || "Excel 다운로드 중 오류가 발생했습니다.");
    } finally {
      setTimeout(() => setDownloading((p) => ({ ...p, excel: false })), 2000);
    }
  };

  // 초기화
  const handleReset = () => {
    setStationQuery("");
    setRows([]);
    setSearchedDateRange(null);
    setError("");
  };

  // Enter 키로 검색 실행
  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="time-range-container">
      {/* 상단 필터 */}
      <div className="time-range-filter">
        <div className="filter-controls">
          <strong>기간설정</strong>
          <select className="filter-select" defaultValue="daily" disabled={loading}>
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

          {/* 측정소명 입력 */}
          <span style={{ marginLeft: 12 }}>측정소명</span>
          <input
            type="text"
            placeholder="예: 금남교, 용산교 …"
            value={stationQuery}
            onChange={(e) => setStationQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="filter-input"
            style={{ minWidth: 200 }}
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
          <button
            onClick={handleReset}
            disabled={loading && !rows.length}
            className="search-button"
            style={{ marginLeft: 8, backgroundColor: '#e5e7eb', color: '#111827' }}
            title="검색조건/결과 초기화"
          >
            초기화
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
                cursor: !canDownload ? 'not-allowed' : 'pointer',
                marginLeft: 8
              }}
            >
              <span style={{ marginRight: 8 }}>
                {downloading.excel ? "⏳" : "⬇️"}
              </span>
              {downloading.excel ? "다운로드 중..." : "EXCEL"}
            </button>
          </div>
        </div>

        {/* 검색된 날짜 범위 + 현재 필터 상태 */}
        {searchedDateRange && (
          <div style={{
            marginBottom: '10px',
            padding: '8px 12px',
            backgroundColor: '#f8f9fa',
            borderRadius: '4px',
            fontSize: '14px',
            color: '#666'
          }}>
            📅 기간: {searchedDateRange.startDate} ~ {searchedDateRange.endDate}
            {` | `}
            🔎 측정소: {stationQuery.trim() ? `"${stationQuery.trim()}"` : '전체'}
            {displayRows.length > 0 && ` (표시 ${displayRows.length}건 / 원본 ${rows.length}건)`}
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {!loading && !error && searchedDateRange && displayRows.length === 0 && (
          <div className="no-data-message">
            검색 결과가 없습니다. (조건: 기간 {startDate}~{endDate}, 측정소명 {stationQuery || '전체'})
          </div>
        )}

        {!searchedDateRange && !loading && !error && (
          <div className="no-data-message">
            기간을 설정하고 검색 버튼을 눌러 데이터를 조회해주세요.
          </div>
        )}

        {displayRows.length > 0 && (
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
                {displayRows.map((row, idx) => {
                  const ymd = dateOnly(pickDateField(row)) || "-";
                  const station = pickStation(row) || "-";
                  return (
                    <tr key={`${station}-${ymd}-${idx}`}>
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

export default TimeRangePage;
