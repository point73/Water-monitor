import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import '../styles/components.css';

function PredictionChart({ regionName }) {
  // 각 지역별로 생성된 차트 데이터를 저장하기 위한 state
  const [memoizedChartData, setMemoizedChartData] = useState({});

  // regionName prop이 변경될 때마다 실행됩니다.
  useEffect(() => {
    // regionName이 존재하고, 아직 해당 지역의 데이터가 저장되지 않았을 때만 데이터를 생성합니다.
    if (regionName && !memoizedChartData[regionName]) {
      console.log(`'${regionName}'의 신규 더미 데이터를 생성합니다.`);

      // 더미 데이터 생성 로직
      const generateDummyData = () => {
        const currentMonth = new Date().getMonth();
        const labels = [];
        const data = [];
        // 시작 값을 40~100 사이에서 랜덤하게 설정
        let lastValue = Math.random() * 60 + 40;

        for (let i = currentMonth; i < 12; i++) {
          labels.push(`${i + 1}월`);

          // 첫 번째 데이터 이후에는 이전 값에 기반하여 값을 변동시킴
          if (i > currentMonth) {
            // -10에서 +10 사이의 랜덤한 변화량을 생성
            const change = (Math.random() * 20 - 10);
            let newValue = lastValue + change;

            // 값이 40~100 범위를 벗어나지 않도록 보정
            newValue = Math.max(40, Math.min(100, newValue));
            lastValue = newValue; // 다음 계산을 위해 현재 값을 저장
          }
          
          data.push(lastValue.toFixed(1));
        }

        return {
          labels,
          datasets: [
            {
              label: '월별 WQI 예측',
              data: data,
              fill: true,
              backgroundColor: 'rgba(75,192,192,0.2)',
              borderColor: 'rgba(75,192,192,1)',
              tension: 0.4, // tension 값을 조절하여 곡선을 더 부드럽게 만듭니다.
              pointBackgroundColor: 'rgba(75,192,192,1)',
              pointBorderColor: '#fff',
              pointHoverRadius: 7,
              pointHoverBackgroundColor: '#fff',
              pointHoverBorderColor: 'rgba(75,192,192,1)',
            },
          ],
        };
      };

      const newChartData = generateDummyData();

      // 새로 생성한 데이터를 state에 저장합니다.
      setMemoizedChartData(prevData => ({
        ...prevData,
        [regionName]: newChartData,
      }));
    }
  }, [regionName, memoizedChartData]);

  const chartOptions = {
    maintainAspectRatio: false,
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        min: 0,   // Y축 최소값 고정
        max: 100, // Y축 최대값 고정
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

  // 현재 선택된 지역에 해당하는 차트 데이터를 가져옵니다.
  const currentChartData = memoizedChartData[regionName] || { labels: [], datasets: [] };

  return (
    <div className="prediction-container">
      <h2 className="prediction-title"> 선택된 지역의 수질 예측</h2>
      {regionName ? (
        <>
          <p className="prediction-region"><strong>{regionName}</strong></p>
          <div className="prediction-chart-wrapper">
            <Line data={currentChartData} options={chartOptions} />
          </div>
        </>
      ) : (
        <div className="prediction-no-data">
          <p className="prediction-no-data-text">아직 지역이 선택되지 않았습니다.</p>
        </div>
      )}
    </div>
  );
}

export default PredictionChart;
