package kr.u_cube.www.WaterPollution.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SensorDataHandler {

    private final EmailService emailService;

    public void processSensorData(String location, double ph, double doValue) {
        boolean isDanger = false;
        StringBuilder content = new StringBuilder("""
            <h2>수질 경고 알림</h2>
            <p>아래 지역에서 이상 수치가 감지되었습니다:</p>
            <ul>
        """);

        if (ph < 5.5 || ph > 8.5) {
            isDanger = true;
            content.append("<li>pH: ").append(ph).append(" (기준치 벗어남)</li>");
        }

        if (doValue < 2.0) {
            isDanger = true;
            content.append("<li>DO: ").append(doValue).append(" (기준치 벗어남)</li>");
        }

        content.append("</ul><p>신속한 확인 바랍니다.</p>");

        if (isDanger) {
            String subject = "📢 [수질오염 경고] ○○지역의 수질 오염 지수 상승 예상 (YYYY-MM-DD)" + location;
            String to = "receiver@example.com"; // 또는 DB/설정에서 가져온 값

            emailService.sendAlertEmail(to, subject, content.toString());
        }
    }
}

