FROM grafana/grafana:latest

# 메타데이터
LABEL maintainer="your-email@example.com"
LABEL description="Water Monitoring System - Custom Grafana"
LABEL version="1.0"

# 사용자를 root로 변경
USER root

# Provisioning 설정 파일들 복사
COPY grafana/provisioning/ /etc/grafana/provisioning/

# 대시보드 JSON 파일들 복사
COPY grafana/dashboards/ /var/lib/grafana/dashboards/

# 권한 설정 (수정된 부분)
RUN chown -R 472:0 /etc/grafana/provisioning/ && \
    chown -R 472:0 /var/lib/grafana/dashboards/ && \
    chmod -R 755 /etc/grafana/provisioning/ && \
    chmod -R 755 /var/lib/grafana/dashboards/

# 플러그인 설치
RUN grafana-cli plugins install grafana-clock-panel && \
    grafana-cli plugins install grafana-simple-json-datasource

# grafana 사용자로 변경 (UID 472)
USER 472

# 포트 노출
EXPOSE 3001

# 환경변수 설정
ENV GF_SECURITY_ADMIN_USER=admin
ENV GF_USERS_ALLOW_SIGN_UP=false