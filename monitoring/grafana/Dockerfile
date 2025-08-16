FROM grafana/grafana:latest

# 메타데이터
LABEL maintainer="whdydwns73@gmail.com"
LABEL description="Water Monitoring System - Custom Grafana"
LABEL version="1.0"

# 사용자를 root로 변경
USER root

# Alpine Linux용 패키지 설치 (수정된 부분)
RUN apk update && apk add --no-cache \
    curl

# Provisioning 설정 파일들 복사
COPY grafana/provisioning/ /etc/grafana/provisioning/

# 대시보드 JSON 파일들 복사
COPY grafana/dashboards/ /var/lib/grafana/dashboards/

# 권한 설정
RUN chmod -R 755 /etc/grafana/provisioning/ && \
    chmod -R 644 /var/lib/grafana/dashboards/

# 플러그인 설치
RUN grafana-cli plugins install grafana-clock-panel && \
    grafana-cli plugins install grafana-simple-json-datasource

# grafana 사용자로 변경
USER grafana

# 포트 노출
EXPOSE 3000

# 헬스체크 추가
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1