# 1️⃣ 빌드 단계
FROM node:20 AS build

# 작업 디렉토리 설정
WORKDIR /app

# package.json, package-lock.json 복사
COPY package*.json ./

# 의존성 설치
RUN npm install

# 소스 코드 복사
COPY . .

# Vite 빌드
RUN npm run build
# -----------------------------------------------------
# 2️⃣ 배포 단계 (Nginx 사용)
FROM nginx:1.25-alpine

# 빌드 결과물 복사
COPY --from=build /app/dist /usr/share/nginx/html

# Nginx 설정 덮어쓰기 (필요 시)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 컨테이너 실행 시 포트
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]