package kr.u_cube.www.WaterPollution;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class WaterPollutionApplication {

	public static void main(String[] args) {
		// ✅ .env 파일 로드 및 시스템 속성 등록
		Dotenv dotenv = Dotenv.configure()
			.ignoreIfMissing()
			.load();

		dotenv.entries().forEach(entry ->
			System.setProperty(entry.getKey(), entry.getValue())
		);
		

		SpringApplication.run(WaterPollutionApplication.class, args);
	}
}
