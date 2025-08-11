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
      console.log("sample row:", data?.[0]); // 확인용
    } catch (error) {
      console.error(error);
      setError(error.message || "데이터 조회 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const dateOnly = (v) => (v ? String(v).slice(0, 10) : "");
  const pickDateField = (r) =>
    r?.measuredAt ?? r?.timestamp ?? r?.time ?? r?.date ?? "";

  return (
    <div className="time-range-container">
      {/* 상단 필터 */}
      <div className="time-range-filter">
        <div className="filter-controls">
          <strong>기간설정</strong>
          <select className="filter-select" defaultValue="daily">
            <option value="daily">일별 자료</option>
          </select>
          
          <span className="filter-label">시작기간</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="filter-input"
          />

          <span>종료기간</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="filter-input"
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
            <button title="CSV 다운로드 (준비중)">
              <span style={{ marginRight: 8 }}>⬇️</span> CSV
            </button>
            <button title="EXCEL 다운로드 (준비중)">
              <span style={{ marginRight: 8 }}>⬇️</span> EXCEL
            </button>
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        {!loading && !error && rows.length === 0 && (
          <div className="no-data-message">
            검색 결과가 없습니다.
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
                  const station =
                    row.name ?? row.stationName ?? row.locatn ?? "-";
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