export const registerAlertMock = (email, region) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`[MOCK] 알림 등록 완료: 이메일(${email}), 지역(${region})`);
      resolve({
        success: true,
        message: `✅ ${region} 지역 알림이 ${email} 에 등록되었습니다.`,
      });
    }, 1000); 
  });
};
