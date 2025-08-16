FROM prom/prometheus:latest

# 메타데이터
LABEL maintainer="your-email@example.com"
LABEL description="Water Monitoring System - Custom Prometheus"
LABEL version="1.0"

# 사용자를 root로 변경 (파일 복사 권한)
USER root

# 설정 파일 복사
COPY prometheus/prometheus.yml /etc/prometheus/prometheus.yml

# 알림 규칙 파일 복사
COPY alerting/alert-rules.yml /etc/prometheus/alert-rules.yml

# 권한 설정 (수정된 부분)
RUN chown -R nobody:nogroup /etc/prometheus/ || \
    chown -R 65534:65534 /etc/prometheus/ || \
    chmod -R 644 /etc/prometheus/

# 다시 nobody 사용자로 변경 (또는 원래 사용자)
USER nobody

# 포트 노출
EXPOSE 9090

# 헬스체크 추가
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:9090/-/healthy || exit 1

# 기본 명령어
CMD ["--config.file=/etc/prometheus/prometheus.yml", \
     "--storage.tsdb.path=/prometheus", \
     "--web.console.libraries=/etc/prometheus/console_libraries", \
     "--web.console.templates=/etc/prometheus/consoles", \
     "--storage.tsdb.retention.time=200h", \
     "--web.enable-lifecycle", \
     "--web.enable-admin-api"]