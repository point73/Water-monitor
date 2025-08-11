// src/api/sensorApi.js
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8085";
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000;

// API 인스턴스 생성
const api = axios.create({
  baseURL: BASE_URL,
  timeout: API_TIMEOUT,
});

// 응답 인터셉터 (에러 처리)
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API 에러:', error);
    return Promise.reject(error);
  }
);

// 센서 관련 API 함수들
export const sensorApi = {
  // 모든 최신 센서 데이터 조회
  getAllLatestSensorData: async () => {
    try {
      const response = await api.get('/api/sensor/latest/all');
      return Array.isArray(response.data?.data) ? response.data.data : response.data;
    } catch (error) {
      throw new Error('전체 센서 데이터를 불러오는데 실패했습니다.');
    }
  },

  // 특정 디바이스 센서 데이터 조회
  getSensorDataByDeviceId: async (deviceId) => {
    try {
      const response = await api.get(`/api/sensor/${deviceId}`);
      return response.data?.data || response.data;
    } catch (error) {
      throw new Error(`디바이스 ${deviceId}의 센서 데이터를 불러오는데 실패했습니다.`);
    }
  },

  // 기간별 센서 히스토리 조회
  getSensorHistory: async (startDate, endDate) => {
    try {
      // 날짜 포맷팅 유틸
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

      const response = await api.get('/api/sensor/history', { params });
      const rawData = Array.isArray(response.data?.data) 
        ? response.data.data 
        : response.data ?? [];

      // 데이터 필터링 및 정렬
      const dateOnly = (v) => (v ? String(v).slice(0, 10) : "");
      const pickDateField = (r) =>
        r?.measuredAt ?? r?.timestamp ?? r?.time ?? r?.date ?? "";
      const inRange = (d, startYmd, endYmd) => {
        const ymd = dateOnly(d);
        return ymd && ymd >= startYmd && ymd <= endYmd;
      };

      const filtered = rawData
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

      return filtered;
    } catch (error) {
      throw new Error('센서 히스토리 데이터를 불러오는데 실패했습니다.');
    }
  }
};

export default sensorApi;