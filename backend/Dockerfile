# 베이스 이미지 - 21버전의 JDK(스프링코드 실행하기 위한 기저)
FROM eclipse-temurin:21-jdk-alpine

# 컨테이너 내 작업 디렉토리 지정
WORKDIR /app
# Dockerfile이 있는 디렉토리를 기준으로 [복사할 파일 경로] / [컨테이너에서 파일이 위치할 경로]
COPY ./build/libs/*SNAPSHOT.jar app.jar

# 필수 명령은 아니지만, 이미지 사용자에게 “이 컨테이너는 이 포트를 씁니다” 라고 알려주는 용도
EXPOSE 8085
# 컨테이너 생성 후 최초 실행할때 수행될 명령어
ENTRYPOINT [ "java", "-jar", "app.jar" ]