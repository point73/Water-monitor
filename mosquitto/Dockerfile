FROM eclipse-mosquitto:latest

# 작업 디렉토리 설정
WORKDIR /mosquitto

# mosquitto.conf 설정 파일 복사
COPY /mosquitto/config/mosquitto.conf /mosquitto/config/mosquitto.conf

# 데이터 디렉토리 생성 및 권한 설정
RUN mkdir -p /mosquitto/data /mosquitto/log && \
    chown -R mosquitto:mosquitto /mosquitto/data /mosquitto/log

# 포트 노출
EXPOSE 1883

# 볼륨 마운트 포인트 설정
VOLUME ["/mosquitto/data", "/mosquitto/log"]

# Mosquitto 시작 명령
CMD ["/usr/sbin/mosquitto", "-c", "/mosquitto/config/mosquitto.conf"]