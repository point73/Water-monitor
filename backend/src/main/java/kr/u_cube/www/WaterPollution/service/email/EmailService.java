package kr.u_cube.www.WaterPollution.service.email;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import kr.u_cube.www.WaterPollution.service.monitoring.CustomMetricsService;
import lombok.RequiredArgsConstructor;


@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;
    private final CustomMetricsService customMetricsService; // 🆕 추가

    public void sendAlertEmail(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");

            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true); // true = HTML 사용

            mailSender.send(message);

            // 🆕 메트릭 증가
            customMetricsService.incrementEmailSent();
        } catch (MessagingException e) {
            // 예외 처리
            throw new RuntimeException("메일 전송 실패", e);
        }
    }
}