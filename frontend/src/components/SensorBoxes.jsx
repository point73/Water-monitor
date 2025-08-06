// src/components/SensorBoxes.jsx
import React from 'react';

function SensorBoxes({ selectedRegion }) {
  const sensorLabels = {
    ph: 'pH',
    do: 'DO',
    bod: 'BOD',
    cod: 'COD'
  };

  // 각 센서 지표에 대한 임의의 기준 값 (조정 가능)
  const thresholds = {
    ph: { normal: { min: 6.5, max: 8.5 }, warning: { min: 6.0, max: 9.0 } }, // 정상 6.5~8.5, 주의 6.0~9.0 (그 외 위험)
    do: { normal: 5.0, warning: 3.0 }, // 정상 5.0 이상, 주의 3.0 이상 5.0 미만 (그 외 위험)
    bod: { normal: 3.0, warning: 6.0 }, // 정상 3.0 이하, 주의 3.0 초과 6.0 이하 (그 외 위험)
    cod: { normal: 4.0, warning: 8.0 }  // 정상 4.0 이하, 주의 4.0 초과 8.0 이하 (그 외 위험)
  };

  // 센서 값에 따라 '위험', '주의', '정상'을 결정하는 함수
  const getStatus = (key, value) => {
    if (value === undefined || value === null) return '알 수 없음';

    switch (key) {
      case 'ph':
        if (value >= thresholds.ph.normal.min && value <= thresholds.ph.normal.max) {
          return '정상';
        } else if (value >= thresholds.ph.warning.min && value <= thresholds.ph.warning.max) {
          return '주의';
        } else {
          return '위험';
        }
      case 'do': // DO는 높을수록 좋음
        if (value >= thresholds.do.normal) {
          return '정상';
        } else if (value >= thresholds.do.warning) {
          return '주의';
        } else {
          return '위험';
        }
      case 'bod': // BOD는 낮을수록 좋음
        if (value <= thresholds.bod.normal) {
          return '정상';
        } else if (value <= thresholds.bod.warning) {
          return '주의';
        } else {
          return '위험';
        }
      case 'cod': // COD는 낮을수록 좋음
        if (value <= thresholds.cod.normal) {
          return '정상';
        } else if (value <= thresholds.cod.warning) {
          return '주의';
        } else {
          return '위험';
        }
      default:
        return '-';
    }
  };

  // 상태에 따른 색상 반환
  const getStatusColor = (status) => {
    switch (status) {
      case '위험': return 'red';
      case '주의': return 'orange';
      case '정상': return 'green';
      default: return '#666';
    }
  };

  return (
    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'space-between' }}>
      {Object.keys(sensorLabels).map((key, idx) => {
        const sensorValue = selectedRegion ? selectedRegion[key] : undefined;
        const status = getStatus(key, sensorValue);
        const statusColor = getStatusColor(status);

        return (
          <div key={idx} style={{
            flex: 1,
            minWidth: '100px',
            maxWidth: 'calc(25% - 8px)',
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            padding: '12px 14px',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e0e0e0',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <h4 style={{ marginBottom: '6px', fontWeight: 'bold', color: '#475569', fontSize: '1.3em' }}>{sensorLabels[key]}</h4> {/* 글자 크기 더 키움 */}
            <p style={{ fontSize: '2.2em', fontWeight: 'bold', color: '#0f172a' }}> {/* 글자 크기 더 키움 */}
              {sensorValue !== undefined ? sensorValue.toFixed(1) : '-'}
            </p>
            {/* 센서 상태 표시 */}
            <p style={{ fontSize: '1.1em', fontWeight: 'bold', color: statusColor, marginTop: '5px' }}> {/* 글자 크기 더 키움 */}
              {status}
            </p>
            {key === 'ph' && ( /* pH 박스에만 범례를 표시합니다. */
              <div style={{ fontSize: '1.0em', color: '#666', marginTop: '5px' }}> {/* 글자 크기 더 키움 */}
                <span style={{ color: 'red' }}>▲</span> 위험
                <span style={{ color: 'orange', marginLeft: '5px' }}>●</span> 주의
                <span style={{ color: 'green', marginLeft: '5px' }}>▼</span> 정상
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default SensorBoxes;
