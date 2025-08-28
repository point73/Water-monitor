// src/components/WaterQualityStandards.jsx
import React from 'react';
import '../styles/components.css';

// 하천 생활환경기준 데이터
const riverStandardsData = [
  { grade: '매우 좋음', level: 'Ia', ph: '6.5~8.5', bod: '1 이하', cod: '2 이하', toc: '2 이하', ss: '25 이하', do: '7.5 이상', tp: '0.02 이하', totalColiforms: '50 이하', fecalColiforms: '10 이하' },
  { grade: '좋음', level: 'Ib', ph: '6.5~8.5', bod: '2 이하', cod: '4 이하', toc: '3 이하', ss: '25 이하', do: '5.0 이상', tp: '0.04 이하', totalColiforms: '500 이하', fecalColiforms: '100 이하' },
  { grade: '약간 좋음', level: 'II', ph: '6.5~8.5', bod: '3 이하', cod: '5 이하', toc: '4 이하', ss: '25 이하', do: '5.0 이상', tp: '0.1 이하', totalColiforms: '1,000 이하', fecalColiforms: '200 이하' },
  { grade: '보통', level: 'III', ph: '6.5~8.5', bod: '5 이하', cod: '7 이하', toc: '5 이하', ss: '25 이하', do: '5.0 이상', tp: '0.2 이하', totalColiforms: '5,000 이하', fecalColiforms: '1,000 이하' },
  { grade: '약간 나쁨', level: 'IV', ph: '6.0~8.5', bod: '8 이하', cod: '9 이하', toc: '6 이하', ss: '100 이하', do: '2.0 이상', tp: '0.3 이하', totalColiforms: '-', fecalColiforms: '-' },
  { grade: '나쁨', level: 'V', ph: '6.0~8.5', bod: '10 이하', cod: '11 이하', toc: '8 이하', ss: '쓰레기 등이 떠있지 아니할것', do: '2.0 이상', tp: '0.5 이하', totalColiforms: '-', fecalColiforms: '-' },
  { grade: '매우 나쁨', level: 'VI', ph: '-', bod: '10 초과', cod: '11 초과', toc: '8 초과', ss: '-', do: '2.0 미만', tp: '0.5 초과', totalColiforms: '-', fecalColiforms: '-' },
];

// WQI 등급별 점수 데이터
const wqiScoreData = [
    { grade: '매우 좋음', score: '90 ~ 100' },
    { grade: '좋음', score: '70 ~ 89' },
    { grade: '보통', score: '50 ~ 69' },
    { grade: '나쁨', score: '25 ~ 49' },
    { grade: '매우 나쁨', score: '0 ~ 24' },
];

function WaterQualityStandards() {
  return (
    <div className="standards-page-container">
      <div className="standards-section">
        <div className="standards-header">
            <h3>하천의 생활환경기준</h3>
            
        </div>
        <table className="standards-table">
          <thead>
            <tr>
              <th rowSpan="2" colSpan="2">등급</th>
              <th colSpan="8">기준</th>
            </tr>
            <tr>
              <th>수소이온농도(pH)</th>
              <th>생물화학적<br/>산소요구량(BOD)<br/>(mg/L)</th>
              <th>화학적<br/>산소요구량(COD)<br/>(mg/L)</th>
              <th>총유기탄소량<br/>(TOC)<br/>(mg/L)</th>
              <th>부유물질량<br/>(SS)<br/>(mg/L)</th>
              <th>용존산소량<br/>(DO)<br/>(mg/L)</th>
              <th>총인<br/>(T-P)<br/>(mg/L)</th>
              <th>대장균군<br/>(총대장균군 / 분원성대장균군)<br/>(군수/100mL)</th>
            </tr>
          </thead>
          <tbody>
            {riverStandardsData.map((item, index) => (
              <tr key={index}>
                <td>{item.grade}</td>
                <td>{item.level}</td>
                <td>{item.ph}</td>
                <td>{item.bod}</td>
                <td>{item.cod}</td>
                <td>{item.toc}</td>
                <td>{item.ss}</td>
                <td>{item.do}</td>
                <td>{item.tp}</td>
                <td>
                  {item.totalColiforms !== '-' ? `${item.totalColiforms} / ${item.fecalColiforms}` : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="standards-section">
        <div className="standards-header">
            <h3>수질오염지수(WQI) 산정 기준</h3>
        </div>
        <div className="wqi-content">
            <div className="wqi-weights">
                <h4>가중치</h4>
                <ul>
                    <li>용존산소(DO): <strong>20%</strong></li>
                    <li>생물화학적산소요구량(BOD): <strong>15%</strong></li>
                    <li>화학적산소요구량(COD): <strong>15%</strong></li>
                    <li>총인(T-P): <strong>15%</strong></li>
                    <li>총질소(T-N): <strong>15%</strong></li>
                    <li>클로로필-a(Chlorophyll-a): <strong>10%</strong></li>
                    <li>수소이온농도(pH): <strong>10%</strong></li>
                </ul>
            </div>
            <div className="wqi-scores">
                <h4>등급별 WQI 점수</h4>
                <table className="standards-table wqi-score-table">
                    <thead>
                        <tr>
                            <th>등급</th>
                            <th>WQI 점수</th>
                        </tr>
                    </thead>
                    <tbody> 
                        {wqiScoreData.map((item, index) => (
                            <tr key={index}>
                                <td>{item.grade}</td>
                                <td>{item.score}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  );
}

export default WaterQualityStandards;
