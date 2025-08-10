package kr.u_cube.www.WaterPollution.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

@Configuration
@EnableScheduling  // 스케줄링 기능 활성화
@EnableAsync       // 비동기 처리 활성화
public class SchedulerConfig {
    
    /**
     * 비동기 처리용 스레드 풀 설정
     * 이메일 발송 등의 작업을 별도 스레드에서 처리
     */
    @Bean(name = "emailTaskExecutor")
    public Executor emailTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        
        // 기본 스레드 수: 2개
        executor.setCorePoolSize(2);
        
        // 최대 스레드 수: 5개 (동시에 많은 이메일 발송 시)
        executor.setMaxPoolSize(5);
        
        // 대기열 크기: 10개 (스레드가 모두 사용 중일 때 대기할 작업 수)
        executor.setQueueCapacity(10);
        
        // 스레드 이름 접두사 (로그에서 구분하기 쉽게)
        executor.setThreadNamePrefix("Email-");
        
        // 애플리케이션 종료 시 실행 중인 작업 완료 대기
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(60);
        
        executor.initialize();
        return executor;
    }
    
    /**
     * 스케줄러용 스레드 풀 설정 (선택사항)
     */
    @Bean(name = "schedulerTaskExecutor") 
    public Executor schedulerTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(1);      // 스케줄러는 1개면 충분
        executor.setMaxPoolSize(2);
        executor.setQueueCapacity(5);
        executor.setThreadNamePrefix("Scheduler-");
        executor.initialize();
        return executor;
    }
}