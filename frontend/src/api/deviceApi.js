// src/api/deviceApi.js
import axios from 'axios';

const BASE_URL = "http://localhost:8085";

// API 인스턴스 생성
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// 디바이스 관련 API 함수들
export const deviceApi = {
  // 모든 디바이스 목록 조회
  getAllDevices: async () => {
    try {
      const response = await api.get('/api/devices');
      return Array.isArray(response.data?.data) ? response.data.data : response.data;
    } catch (error) {
      throw new Error('디바이스 목록을 불러오는데 실패했습니다.');
    }
  },

  // 특정 디바이스 정보 조회
  getDeviceById: async (deviceId) => {
    try {
      const response = await api.get(`/api/devices/${deviceId}`);
      return response.data?.data || response.data;
    } catch (error) {
      throw new Error(`디바이스 ${deviceId} 정보를 불러오는데 실패했습니다.`);
    }
  },

  // 디바이스 상태 업데이트
  updateDeviceStatus: async (deviceId, status) => {
    try {
      const response = await api.put(`/api/devices/${deviceId}/status`, { status });
      return response.data;
    } catch (error) {
      throw new Error(`디바이스 ${deviceId} 상태 업데이트에 실패했습니다.`);
    }
  }
};

export default deviceApi;