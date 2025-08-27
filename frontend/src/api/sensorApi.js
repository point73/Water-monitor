import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT);

const api = axios.create({
  baseURL: BASE_URL,
  timeout: API_TIMEOUT,
});

// 응답 인터셉터
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API 에러:", error);
    return Promise.reject(error);
  }
);

export const sensorApi = {
  // 최신 데이터 전체 조회
  getAllLatestSensorData: async () => {
    const res = await api.get("/api/sensor/latest/all");
    return Array.isArray(res.data?.data) ? res.data.data : res.data;
  },

  // 특정 디바이스 조회
  getSensorDataByDeviceId: async (deviceId) => {
    const res = await api.get(`/api/sensor/${deviceId}`);
    return res.data?.data || res.data;
  },

  // 기간별 히스토리 조회
  getSensorHistory: async (startDate, endDate) => {
    const p2 = (n) => String(n).padStart(2, "0");
    const toLocalIsoNoZ = (d) =>
      `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}T${p2(
        d.getHours()
      )}:${p2(d.getMinutes())}:${p2(d.getSeconds())}`;

    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T23:59:59`);

    const params = {
      startDate: toLocalIsoNoZ(start),
      endDate: toLocalIsoNoZ(end),
    };

    const res = await api.get("/api/sensor/history", { params });
    const rawData = Array.isArray(res.data?.data)
      ? res.data.data
      : res.data ?? [];

    const dateOnly = (v) => (v ? String(v).slice(0, 10) : "");
    const pickDateField = (r) =>
      r?.measuredAt ?? r?.timestamp ?? r?.time ?? r?.date ?? "";
    const inRange = (d, startYmd, endYmd) => {
      const ymd = dateOnly(d);
      return ymd && ymd >= startYmd && ymd <= endYmd;
    };

    return rawData
      .filter((r) => inRange(pickDateField(r), startDate, endDate))
      .sort((a, b) => {
        const ad = dateOnly(pickDateField(a));
        const bd = dateOnly(pickDateField(b));
        if (ad === bd) {
          return (a.name ?? a.stationName ?? a.locatn ?? "").localeCompare(
            b.name ?? b.stationName ?? b.locatn ?? ""
          );
        }
        return ad.localeCompare(bd);
      });
  },

  // CSV 다운로드
  downloadCSV: async (startDate, endDate) => {
    const url = `/api/sensor/download/csv`;
    const params = {
      startDate: `${startDate}T00:00:00`,
      endDate: `${endDate}T23:59:59`,
    };

    const res = await api.get(url, { params, responseType: "blob" });

    const blob = new Blob([res.data], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = `sensor-data_${startDate}_${endDate}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(link.href);
  },

  // Excel 다운로드
  downloadExcel: async (startDate, endDate) => {
    const url = `/api/sensor/download/excel`;
    const params = {
      startDate: `${startDate}T00:00:00`,
      endDate: `${endDate}T23:59:59`,
    };

    const res = await api.get(url, { params, responseType: "blob" });

    const blob = new Blob([res.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = `sensor-data_${startDate}_${endDate}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(link.href);
  },
};

export default sensorApi;
