// src/components/SensorBoxes.jsx
import React from 'react';

function SensorBoxes({ selectedSensorData }) {
  const sensorLabels = {
    ph: 'pH',
    doValue: 'DO',
    bod: 'BOD',
    cod: 'COD'
  };

  const thresholds = {
    ph: { normal: { min: 6.5, max: 8.5 }, warning: { min: 6.0, max: 9.0 } },
    doValue: { normal: 5.0, warning: 3.0 },
    bod: { normal: 3.0, warning: 6.0 },
    cod: { normal: 4.0, warning: 8.0 }
  };

  const getStatus = (key, value) => {
    if (value === undefined || value === null) return '알 수 없음';

    switch (key) {
      case 'ph':
        if (value >= thresholds.ph.normal.min && value <= thresholds.ph.normal.max) return '정상';
        else if (value >= thresholds.ph.warning.min && value <= thresholds.ph.warning.max) return '주의';
        else return '위험';
      case 'doValue':
        if (value >= thresholds.doValue.normal) return '정상';
        else if (value >= thresholds.doValue.warning) return '주의';
        else return '위험';
      case 'bod':
        if (value <= thresholds.bod.normal) return '정상';
        else if (value <= thresholds.bod.warning) return '주의';
        else return '위험';
      case 'cod':
        if (value <= thresholds.cod.normal) return '정상';
        else if (value <= thresholds.cod.warning) return '주의';
        else return '위험';
      default:
        return '-';
    }
  };

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
        const sensorValue = selectedSensorData ? selectedSensorData[key] : undefined;
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
            <h4 style={{ marginBottom: '6px', fontWeight: 'bold', color: '#475569', fontSize: '1.3em' }}>{sensorLabels[key]}</h4>
            <p style={{ fontSize: '2.2em', fontWeight: 'bold', color: '#0f172a' }}>
              {sensorValue !== undefined ? sensorValue.toFixed(1) : '-'}
            </p>
            <p style={{ fontSize: '1.1em', fontWeight: 'bold', color: statusColor, marginTop: '5px' }}>
              {status}
            </p>
            {key === 'ph' && (
              <div style={{ fontSize: '1.0em', color: '#666', marginTop: '5px' }}>
                <span style={{ color: 'red' }}>▲</span> 위험
                <span style={{ color: 'orange', marginLeft: '5px' }}>●</span> 주의
                <span style={{ color: 'green', marginLeft: '5px' }}>▼</span> 정상
              </div>
            )}
            {key === 'doValue' && (
              <div style={{ fontSize: '1.0em', color: '#666', marginTop: '5px' }}>
                <span style={{ color: 'red' }}>▲</span> 위험
                <span style={{ color: 'orange', marginLeft: '5px' }}>●</span> 주의
                <span style={{ color: 'green', marginLeft: '5px' }}>▼</span> 정상
              </div>
            )}
            {key === 'bod' && (
              <div style={{ fontSize: '1.0em', color: '#666', marginTop: '5px' }}>
                <span style={{ color: 'red' }}>▲</span> 위험
                <span style={{ color: 'orange', marginLeft: '5px' }}>●</span> 주의
                <span style={{ color: 'green', marginLeft: '5px' }}>▼</span> 정상
              </div>
            )}
              {key === 'cod' && (
              <div style={{ fontSize: '1.0em', color: '#666', marginTop: '5px' }}>
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