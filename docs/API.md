# API / MQTT 레퍼런스

Water-monitor 백엔드(Spring Boot, 기본 포트 `8085`)가 제공하는 REST API와, 센서 데이터가 오가는 MQTT 토픽을 정리한 문서입니다. 소스: `backend/src/main/java/kr/u_cube/www/WaterPollution/controller`, `mqtt`, `websocket`, `config`.

## REST API

모든 경로는 `http://<backend-host>:8085`를 기준으로 합니다.

### 센서 데이터 - `/api/sensor`

| Method | Path | 설명 |
| --- | --- | --- |
| GET | `/api/sensor/latest/all` | 디바이스별 최신 센서 데이터 전체 조회 |
| GET | `/api/sensor/{deviceId}` | 특정 디바이스의 최신 센서 데이터 조회 (없으면 404) |
| GET | `/api/sensor/history?startDate=&endDate=` | 기간별 측정 이력 조회 (`startDate`/`endDate`는 ISO `yyyy-MM-dd'T'HH:mm:ss`) |

### 센서 데이터 다운로드 - `/api/sensor/download`

| Method | Path | 설명 |
| --- | --- | --- |
| GET | `/api/sensor/download/csv?startDate=&endDate=` | 기간별 데이터 CSV 다운로드 |
| GET | `/api/sensor/download/excel?startDate=&endDate=` | 기간별 데이터 Excel(xlsx) 다운로드 |

`startDate`/`endDate` 형식: `yyyy-MM-dd'T'HH:mm:ss`. 데이터가 없으면 `204 No Content` + `X-Error-Message` 헤더를 반환합니다.

### 센서 메타정보 - `/api/sensor-info`

| Method | Path | 설명 |
| --- | --- | --- |
| GET | `/api/sensor-info` | 전체 센서(측정소) 메타정보 조회 |
| GET | `/api/sensor-info/{deviceId}` | 특정 센서 메타정보 조회 |
| PUT | `/api/sensor-info/{deviceId}` | 센서 메타정보 부분 업데이트 |
| GET | `/api/sensor-info/needs-update` | 정보 입력이 필요한 센서 목록 조회 |
| GET | `/api/sensor-info/statistics` | 센서 통계 조회 |
| DELETE | `/api/sensor-info/{deviceId}` | 센서 메타정보 삭제 |

### AI 예측 - `/api/ai`

| Method | Path | 설명 |
| --- | --- | --- |
| GET | `/api/ai/health` | AI 서버(FastAPI) 연결 상태 확인 |
| POST | `/api/ai/test/prediction` | 센서 데이터(JSON, `SensorDataDto`)로 예측 수동 테스트 |
| POST | `/api/ai/test/dummy-prediction?deviceId=` | 더미 센서 데이터로 예측 테스트 |

### 이메일 알림 - `/api/email`

| Method | Path | 설명 |
| --- | --- | --- |
| POST | `/api/email/test/critical` | 위험(critical) 단계 배치 알림 메일 수동 발송 |
| POST | `/api/email/test/warning` | 경고(warning) 단계 배치 알림 메일 수동 발송 |
| GET | `/api/email/status` | 이메일 발송 상태/미발송 알림 개수 조회 |
| GET | `/api/email/health` | 이메일 시스템 헬스체크 |

### 운영 지표 - `/actuator`

Spring Boot Actuator + Micrometer(Prometheus) 기반. `health`, `info`, `metrics`, `prometheus` 엔드포인트가 노출됩니다 (`application.yml` 참고). Prometheus가 `/actuator/prometheus`를 스크레이핑합니다.

## MQTT

브로커: Mosquitto (`mosquitto/config/mosquitto.conf`, 기본 포트 `1883`, 인증 없음 `allow_anonymous true`).

백엔드는 `MqttSensorSubscriber`에서 앱 시작 시 `${MQTT_BROKER}`(예: `tcp://localhost:1883`)에 연결해 `${MQTT_TOPIC}`(기본값 `water/data`, `backend/.env`에서 설정)을 구독합니다.

| 방향 | 토픽 | 페이로드 | 설명 |
| --- | --- | --- | --- |
| 센서 → 백엔드 (subscribe) | `water/data` (`.env`의 `MQTT_TOPIC`) | `SensorDataDto` JSON (아래 스키마) | 센서 디바이스가 발행하는 원본 측정 데이터 |

### 센서 데이터 페이로드 스키마 (`SensorDataDto`)

```json
{
  "deviceId": "string",
  "ph": 0.0,
  "doValue": 0.0,
  "temperature": 0.0,
  "ec": 0.0,
  "turbidity": 0.0,
  "bod": 0.0,
  "cod": 0.0,
  "tp": 0.0,
  "tn": 0.0,
  "ss": 0.0,
  "chlorophyllA": 0.0,
  "no3n": 0.0,
  "measuredAt": "2026-08-31T12:00:00"
}
```

메시지 수신 시 처리 흐름(`SensorMessageHandler`): DB 저장 → (임계치 기반 알림 체크) → AI 서버(`/predict/all_with_sensors`)에 비동기 예측 요청 → 예측 결과를 WebSocket으로 프론트엔드에 전송.

## WebSocket (STOMP)

MQTT로 들어온 데이터를 처리한 결과는 REST가 아니라 WebSocket(STOMP over SockJS)으로 프론트엔드에 실시간 전달됩니다.

- 연결 엔드포인트: `ws://<backend-host>:8085/ws` (SockJS fallback 지원)
- 클라이언트 → 서버 prefix: `/app`
- 서버 → 클라이언트 broker prefix: `/water`

| 채널 | 방향 | 설명 |
| --- | --- | --- |
| `/app/subscribe/prediction` | 구독 요청 | 전체 예측 결과 구독 시작, `/water/prediction`으로 확인 응답 |
| `/app/subscribe/prediction/device/{deviceId}` | 구독 요청 | 특정 디바이스 예측 결과 구독 |
| `/app/subscribe/system` | 구독 요청 | 시스템 상태 구독 |
| `/app/test/prediction` | 구독 요청 | 테스트용 예측 결과 강제 발행 |
| `/water/prediction` | 발행 | 전체 브로드캐스트되는 AI 예측 결과 (`PredictionResultMessage`) |
| `/water/prediction/device/{deviceId}` | 발행 | 디바이스별 예측 결과 |
| `/water/system` | 발행 | 시스템 상태 메시지 |
| `/water/alert` | 발행 | 임계치 초과 시 센서 알림 (`SensorAlertPublisher`) |
