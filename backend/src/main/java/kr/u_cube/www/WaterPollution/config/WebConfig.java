package kr.u_cube.www.WaterPollution.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("*") // 테스트용 전체 허용
                .allowedMethods("*")
                .allowedHeaders("*")
                .exposedHeaders("Content-Disposition", "Content-Type", "Content-Length", "X-Error-Message") // 🔧 다운로드 관련 헤더 노출
                .allowCredentials(false); // allowedOrigins("*")와 함께 사용할 때는 false
    }
}

