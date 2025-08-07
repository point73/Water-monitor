import React from 'react';

// 이 컴포넌트는 '시간 범위 선택' 페이지의 메인 콘텐츠를 구성합니다.
function TimeRangePage() {
  const today = new Date().toISOString().split('T')[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
      {/* 상단 필터 섹션 */}
      <div style={{
        backgroundColor: '#ffffff',
        padding: '60px 25px',
        borderRadius: '10px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '30px', // 요소 간 간격도 조금 넓혔습니다.
        fontSize: '18px' // 박스 내부의 기본 글자 크기를 키웠습니다.
      }}>
       
        {/* 기간 설정 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>기간설정</span>
          <select style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '16px' }}>
            <option>일별 자료</option>
          </select>
          <span style={{ marginLeft: '20px' }}>시작기간</span>
          <input type="date" defaultValue={today} style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '20px' }} />
          <span>종료기간</span>
          <input type="date" defaultValue={today} style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '20px' }} />
        </div>

        {/* 버튼 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto' }}>
          <button style={{ padding: '10px 20px', border: 'none', borderRadius: '5px', backgroundColor: '#0d6efd', color: 'white', cursor: 'pointer', fontSize: '20px' }}>
            지점선택            
          </button>
          <button style={{ padding: '10px 20px', border: 'none', borderRadius: '5px', backgroundColor: '#6c757d', color: 'white', cursor: 'pointer', fontSize: '20px' }}>
            검색
          </button>
        </div>
      </div>

      {/* 하단 콘텐츠 섹션 */}
      <div style={{ display: 'flex', gap: '20px', flexGrow: 1 }}>
        {/* 왼쪽 카드 (차트 등 표시 영역) */}
        <div style={{
          flex: 2,
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          padding: '20px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#666'
        }}>
          선택한 조건의 데이터가 여기에 표시됩니다.
        </div>
        
        {/* 오른쪽 카드 (지도 등 표시 영역) */}
        <div style={{
          flex: 1,
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          padding: '20px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#666'
        }}>
          추가 정보가 여기에 표시됩니다.
        </div>
      </div>
    </div>
  );
}

export default TimeRangePage;