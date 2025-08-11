import React from 'react';
import { Line } from 'react-chartjs-2';

function PredictionChart({ regionName }) { // props 이름 수정 및 단순화
  
  // 더미 데이터 생성 로직
  const generateDummyData = () => {
    const currentMonth = new Date().getMonth(); // 0-11 (현재 7월이면 6)
    const labels = [];
    const data = [];

    for (let i = currentMonth; i < 12; i++) {
      labels.push(`${i + 1}월`);
      // 1.0에서 10.0 사이의 랜덤한 오염도 값 생성
      data.push((Math.random() * 9 + 1).toFixed(1)); 
    }

    return {
      labels,
      datasets: [
        {
          label: '월별 예측 오염도',
          data: data,
          fill: true,
          backgroundColor: 'rgba(75,192,192,0.2)',
          borderColor: 'rgba(75,192,192,1)',
          tension: 0.4,
          pointBackgroundColor: 'rgba(75,192,192,1)',
          pointBorderColor: '#fff',
          pointHoverRadius: 7,
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(75,192,192,1)',
        },
      ],
    };
  };

  // 지역이 선택되었을 때만 더미 데이터 생성
  const chartData = regionName ? generateDummyData() : { labels: [], datasets: [] };

  const chartOptions = {
    maintainAspectRatio: false,
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            size: 14,
          }
        }
      },
      x: {
        ticks: {
          font: {
            size: 14,
          }
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 16
          }
        }
      }
    }
  };

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '10px',
      padding: '20px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
      flexGrow: 1,
      display: 'flex',
      flexDirection: 'column'
    }}>
      <h2 style={{ fontSize: '35px', fontWeight: 'bold', marginBottom: '15px', color: '#333' }}>📊 선택된 지역의 예측 오염도</h2>
      {regionName ? (
        <>
          <p style={{ marginBottom: '10px', color: '#475569', fontSize: '1.5em' }}><strong>{regionName}</strong></p>
          <div style={{ flexGrow: 1, position: 'relative' }}>
            <Line data={chartData} options={chartOptions} />
          </div>
        </>
      ) : (
        <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: '#666', fontSize: '1.5em' }}>아직 지역이 선택되지 않았습니다.</p>
        </div>
      )}
    </div>
  );
}

export default PredictionChart;
