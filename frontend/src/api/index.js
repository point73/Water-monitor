// src/api/index.js
export { sensorApi } from './sensorApi';
export { deviceApi } from './deviceApi';

// 전체 API 객체로 내보내기 (선택사항)
import { sensorApi } from './sensorApi';
import { deviceApi } from './deviceApi';

export const api = {
  sensor: sensorApi,
  device: deviceApi,
};

export default api;