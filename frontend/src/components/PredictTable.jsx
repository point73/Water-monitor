import React, { useEffect, useState } from 'react';
import axios from 'axios';

function getColor(prediction) {
  if (prediction === '위험') return 'red';
  if (prediction === '주의') return 'orange';
  return 'green';
}

const PredictTable = () => {
  const [sensorList, setSensorList] = useState([]);

  useEffect(() => {
    // 실제 API 서버 없으므로 더미 데이터 임시 사용
    const dummyData = [
      { region: '서울', lat: 37.5665, lng: 126.9780, prediction: '정상' },
      { region: '부산', lat: 35.1796, lng: 129.0756, prediction: '주의' },
      { region: '광주', lat: 35.1595, lng: 126.8526, prediction: '위험' },
    ];

    // 실제 연결시 아래 axios 사용
    /*
    axios.get('http://localhost:8000/predict/all')
      .then(res => setSensorList(res.data))
      .catch(err => console.error('API 오류:', err));
    */

    setSensorList(dummyData); // 더미 데이터 적용
  }, []);

  return (
    <div style={{ padding: '30px', maxWidth: '1000px', margin: '0 auto' }}>
      <h2 style={{ color: '#00d5ff', textAlign: 'center', marginBottom: '20px' }}>예측 현황 테이블</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden' }}>
        <thead style={{ backgroundColor: '#0f172a', color: 'white' }}>
          <tr>
            <th style={{ padding: '12px' }}>지역</th>
            <th style={{ padding: '12px' }}>위도</th>
            <th style={{ padding: '12px' }}>경도</th>
            <th style={{ padding: '12px' }}>예측 결과</th>
          </tr>
        </thead>
        <tbody>
          {sensorList.map((item, idx) => (
            <tr key={idx} style={{ textAlign: 'center', borderBottom: '1px solid #ccc' }}>
              <td style={{ padding: '10px' }}>{item.region}</td>
              <td>{item.lat}</td>
              <td>{item.lng}</td>
              <td style={{ color: getColor(item.prediction), fontWeight: 'bold' }}>{item.prediction}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PredictTable;
