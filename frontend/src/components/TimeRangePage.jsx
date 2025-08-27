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

  // 유틸
  const dateOnly = (v) => (v ? String(v).slice(0, 10) : "");
  const pickDateField = (r) => r?.measuredAt ?? r?.timestamp ?? r?.time ?? r?.date ?? "";
  const fmt = (v) => (v === null || v === undefined ? "-" : v);
  const pickStation = (r) => r?.name ?? r?.stationName ?? r?.locatn ?? "";

  const normalize = (s) =>
    (s ?? "").toString().toLowerCase().replace(/\s+/g, "");

  // 표시용 행
  const displayRows = useMemo(() => {
    if (!stationQuery.trim()) return rows;
    const q = normalize(stationQuery);
    return rows.filter((r) => normalize(pickStation(r)).includes(q));
  }, [rows, stationQuery]);

  // 다운로드 버튼 활성화
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
    } catch (err) {
      console.error(err);
      setError(err?.message || "데이터 조회 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  // 공통 다운로드 함수
  const handleDownload = async (type) => {
    if (!searchedDateRange) return;
    setDownloading((p) => ({ ...p, [type]: true }));

    try {
      const blob = await sensorApi[`download${type.toUpperCase()}`](
        searchedDateRange.startDate,
        searchedDateRange.endDate
      );
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `sensor_data_${searchedDateRange.startDate}_${searchedDateRange.endDate}.${type}`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(`❌ ${type.toUpperCase()} 다운로드 오류:`, err);
      setError(err?.message || `${type.toUpperCase()} 다운로드 중 오류가 발생했습니다.`);
    } finally {
      setDownloading((p) => ({ ...p, [type]: false }));
    }
  };

  const handleCsvDownload = () => handleDownload("csv");
  const handleExcelDownload = () => handleDownload("excel");

  // 초기화
  const handleReset = () => {
    setStationQuery("");
    setRows([]);
    setSearchedDateRange(null);
    setError("");
  };

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
            placeholder="예: 내린천, 유등천 …"
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
            {" | "}
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
