import React from 'react';
// 아이콘을 사용하기 위해 react-icons 라이브러리를 추가합니다.
// 실제 프로젝트에서는 npm install react-icons 또는 yarn add react-icons 로 설치해야 합니다.
import { WiThermometer, WiTsunami, WiBarometer, WiCloudy } from 'react-icons/wi';

function SensorBoxes({ selectedSensorData }) {
  // 각 센서에 대한 정보 (라벨, 아이콘, 단위)
  const sensorConfig = {
    // --- 여기를 수정했습니다 (pH 단위 추가) ---
    ph: { label: 'pH', Icon: WiThermometer, unit: 'pH' },
    doValue: { label: 'DO', Icon: WiTsunami, unit: 'mg/L' },
    bod: { label: 'BOD', Icon: WiBarometer, unit: 'mg/L' },
    cod: { label: 'COD', Icon: WiCloudy, unit: 'mg/L' },
  };

  const thresholds = {
    ph: { normal: { min: 6.5, max: 8.5 }, warning: { min: 6.0, max: 9.0 } },
    doValue: { normal: 5.0, warning: 3.0 },
    bod: { normal: 3.0, warning: 6.0 },
    cod: { normal: 4.0, warning: 8.0 },
  };

  const getStatus = (key, value) => {
    if (value === undefined || value === null) return { text: '데이터 없음', color: '#A0AEC0' };

    switch (key) {
      case 'ph':
        if (value >= thresholds.ph.normal.min && value <= thresholds.ph.normal.max) return { text: '정상', color: '#48BB78' };
        if (value >= thresholds.ph.warning.min && value <= thresholds.ph.warning.max) return { text: '주의', color: '#F59E0B' };
        return { text: '위험', color: '#F56565' };
      case 'doValue':
        if (value >= thresholds.doValue.normal) return { text: '정상', color: '#48BB78' };
        if (value >= thresholds.doValue.warning) return { text: '주의', color: '#F59E0B' };
        return { text: '위험', color: '#F56565' };
      case 'bod':
        if (value <= thresholds.bod.normal) return { text: '정상', color: '#48BB78' };
        if (value <= thresholds.bod.warning) return { text: '주의', color: '#F59E0B' };
        return { text: '위험', color: '#F56565' };
      case 'cod':
        if (value <= thresholds.cod.normal) return { text: '정상', color: '#48BB78' };
        if (value <= thresholds.cod.warning) return { text: '주의', color: '#F59E0B' };
        return { text: '위험', color: '#F56565' };
      default:
        return { text: '-', color: '#A0AEC0' };
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '30px' }}>
      {Object.keys(sensorConfig).map((key) => {
        const sensorValue = selectedSensorData ? selectedSensorData[key] : undefined;
        const status = getStatus(key, sensorValue);
        const { Icon, label, unit } = sensorConfig[key];

        return (
          <div key={key} style={{
            backgroundColor: `${status.color}1A`,
            border: `1px solid ${status.color}40`,
            borderLeft: `5px solid ${status.color}`,
            borderRadius: '12px',
            padding: '30px 24px', // 세로 여백 증가
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column', // 세로 정렬로 변경
            alignItems: 'flex-start', // 왼쪽 정렬
            gap: '10px', // 요소간 간격
            transition: 'all 0.3s ease',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '50%',
                  width: '50px',
                  height: '50px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                }}>
                  <Icon size={28} color={status.color} />
                </div>
                {/* --- 센서 이름 크기 증가 --- */}
                <p style={{ margin: 0, fontSize: '28px', fontWeight: '600', color: '#4A5568' }}>
                  {label}
                </p>
            </div>
            <p style={{ margin: '8px 0 0 0', fontSize: '44px', fontWeight: 'bold', color: '#2D3748', alignSelf: 'center' }}>
              {sensorValue !== undefined ? sensorValue.toFixed(1) : '-'}
              <span style={{ fontSize: '20px', marginLeft: '6px', color: '#4A5568', fontWeight: '500' }}>{unit}</span>
            </p>
          </div>
        );
      })}
    </div>
  );
}

export default SensorBoxes;
