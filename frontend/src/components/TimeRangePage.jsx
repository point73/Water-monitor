// src/components/TimeRangePage.jsx
import React, { useState } from "react";
import axios from "axios";

// 백엔드 주소
const BASE_URL = "http://192.168.111.114:8085";

function TimeRangePage() {
  const todayStr = new Date().toISOString().slice(0, 10);

  // 기간
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);

  // 조회 상태
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rows, setRows] = useState([]);

  // ===== 유틸 =====
  const p2 = (n) => String(n).padStart(2, "0");
  const toLocalIsoNoZ = (d) =>
    `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}T${p2(
      d.getHours()
    )}:${p2(d.getMinutes())}:${p2(d.getSeconds())}`;

  const dateOnly = (v) => (v ? String(v).slice(0, 10) : ""); // 'YYYY-MM-DD'
  const pickDateField = (r) =>
    r?.measuredAt ?? r?.timestamp ?? r?.time ?? r?.date ?? "";
  const inRange = (d, startYmd, endYmd) => {
    const ymd = dateOnly(d);
    // 문자열 비교(YYYY-MM-DD)는 사전순=시간순이라 OK
    return ymd && ymd >= startYmd && ymd <= endYmd;
  };

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
      // 백엔드 요청(LocalDateTime)
      const start = new Date(`${startDate}T00:00:00`);
      const end = new Date(`${endDate}T23:59:59`);
      const params = {
        startDate: toLocalIsoNoZ(start),
        endDate: toLocalIsoNoZ(end),
      };

      const res = await axios.get(`${BASE_URL}/api/sensor/history`, { params });
      const raw = Array.isArray(res.data?.data)
        ? res.data.data
        : res.data ?? [];

      // 프론트에서 한 번 더: 범위 필터 + 날짜→오름차순 정렬(동일일자는 이름으로)
      const filtered = raw
        .filter((r) => inRange(pickDateField(r), startDate, endDate))
        .sort((a, b) => {
          const ad = dateOnly(pickDateField(a));
          const bd = dateOnly(pickDateField(b));
          if (ad === bd)
            return (a.name ?? a.stationName ?? a.locatn ?? "").localeCompare(
              b.name ?? b.stationName ?? b.locatn ?? ""
            );
          return ad.localeCompare(bd);
        });

      setRows(filtered);
      console.log("sample row:", filtered?.[0]); // 확인용
    } catch (e) {
      console.error(e);
      setError("데이터 조회 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "25px",
        height: "100%",
        padding: "25px",
        background: "#f0f2f5",
      }}
    >
      {/* 상단 필터 */}
      <div
        style={{
          background: "#fff",
          padding: "50px 40px",
          borderRadius: 10,
          boxShadow: "0 2px 5px rgba(0,0,0,.1)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 25,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 25,
            flexWrap: "wrap",
            fontSize: 22,
          }}
        >
          <strong>기간설정</strong>
          <select
            style={{
              padding: 14,
              borderRadius: 5,
              border: "1px solid #ccc",
              fontSize: 22,
            }}
            defaultValue="daily"
          >
            <option value="daily">일별 자료</option>
          </select>
          
          <span style={{ marginLeft: 10 }}>시작기간</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{
              padding: 14,
              borderRadius: 5,
              border: "1px solid #ccc",
              fontSize: 22,
              fontFamily: "Arial, sans-serif", // 원하는 폰트로 변경
            }}
          />

          <span>종료기간</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{
              padding: 14,
              borderRadius: 5,
              border: "1px solid #ccc",
              fontSize: 22,
              fontFamily: "Arial, sans-serif", // 원하는 폰트로 변경
            }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
          <button
            onClick={handleSearch}
            disabled={loading}
            style={{
              padding: "14px 28px",
              border: "none",
              borderRadius: 5,
              background: "#6c757d",
              color: "#fff",
              cursor: "pointer",
              fontSize: 22,
            }}
          >
            {loading ? "검색 중…" : "검색"}
          </button>
        </div>
      </div>

      {/* 본문: 표 + 다운로드 버튼 */}
      <div
        style={{
          background: "#fff",
          borderRadius: 10,
          padding: 30,
          boxShadow: "0 2px 5px rgba(0,0,0,.1)",
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <h3 style={{ margin: 0, fontSize: 30 }}>수질 예측 데이터</h3>
          <div>
            <button
              title="CSV 다운로드 (준비중)"
              style={{
                padding: "12px 18px",
                borderRadius: 5,
                border: "1px solid #ccc",
                background: "transparent",
                cursor: "pointer",
                fontSize: 20,
                marginRight: 10,
              }}
            >
              <span style={{ marginRight: 8 }}>⬇️</span> CSV
            </button>
            <button
              title="EXCEL 다운로드 (준비중)"
              style={{
                padding: "12px 18px",
                borderRadius: 5,
                border: "1px solid #ccc",
                background: "transparent",
                cursor: "pointer",
                fontSize: 20,
              }}
            >
              <span style={{ marginRight: 8 }}>⬇️</span> EXCEL
            </button>
          </div>
        </div>

        {error && (
          <div
            style={{
              color: "crimson",
              marginBottom: 10,
              textAlign: "center",
              padding: 20,
              fontSize: 22,
            }}
          >
            {error}
          </div>
        )}
        {!loading && !error && rows.length === 0 && (
          <div
            style={{
              color: "#666",
              textAlign: "center",
              padding: "50px 20px",
              fontSize: 22,
            }}
          >
            검색 결과가 없습니다.
          </div>
        )}

        {rows.length > 0 && (
          <div
            style={{
              overflow: "auto",
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              flexGrow: 1,
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ position: "sticky", top: 0, background: "#fff" }}>
                <tr style={{ background: "#f9fafb" }}>
                  <th style={thStyle}>번호</th>
                  <th style={thStyle}>측정소명</th>
                  <th style={thStyle}>년/월/일</th>
                  <th style={thStyle}>PH(mg/L)</th>
                  <th style={thStyle}>DO(mg/L)</th>
                  <th style={thStyle}>BOD(mg/L)</th>
                  <th style={thStyle}>COD(mg/L)</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => {
                  const ymd = dateOnly(pickDateField(row)) || "-";
                  const station =
                    row.name ?? row.stationName ?? row.locatn ?? "-";
                  return (
                    <tr key={idx} style={{ borderTop: "1px solid #f1f5f9" }}>
                      <td style={tdStyle}>{idx + 1}</td>
                      <td style={tdStyle}>{station}</td>
                      <td style={tdStyle}>{ymd}</td>
                      <td style={tdStyle}>{fmt(row.ph)}</td>
                      <td style={tdStyle}>{fmt(row.doValue ?? row.do)}</td>
                      <td style={tdStyle}>{fmt(row.bod)}</td>
                      <td style={tdStyle}>{fmt(row.cod)}</td>
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

/* ===== 스타일 / 출력 유틸 ===== */
const thStyle = {
  textAlign: "center",
  padding: "16px 20px",
  borderBottom: "1px solid #e5e7eb",
  whiteSpace: "nowrap",
  fontWeight: 600,
  fontSize: 25,
};
const tdStyle = {
  textAlign: "center",
  padding: "16px 20px",
  whiteSpace: "nowrap",
  fontSize: 25,
};
const fmt = (v) => (v === null || v === undefined ? "-" : v);

export default TimeRangePage;
