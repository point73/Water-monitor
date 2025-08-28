# main.py
from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel, Field
from typing import List, Dict
import pandas as pd
import joblib
from datetime import date, timedelta

# --- 1. 모델과 함수 준비 ---
try:
    model = joblib.load('prophet_model.joblib')
    onehot_encoder = joblib.load('onehot_encoder.joblib')
except FileNotFoundError:
    print("Error: 모델 파일을 찾을 수 없습니다.")
    exit()

def classify_nsfwqi(wqi_score):
    if 91 <= wqi_score <= 100: return '매우 좋음 (Excellent)'
    elif 71 <= wqi_score < 91: return '좋음 (Good)'
    elif 51 <= wqi_score < 71: return '보통 (Medium)'
    elif 26 <= wqi_score < 51: return '나쁨 (Bad)'
    elif 0 <= wqi_score < 26: return '매우 나쁨 (Very Bad)'
    else: return '범위 초과 (Out of Range)'

# --- 2. FastAPI 앱 생성 및 요청/응답 형식 정의 ---
app = FastAPI(title="수계별 WQI 예측 API")

# JSON으로 받을 각 날짜의 센서 데이터 형식 정의
class SensorDataPoint(BaseModel):
    ds: date = Field(..., description="예측할 날짜 (YYYY-MM-DD)")
    ss: float
    bod: float
    ph: float
    temp: float
    do: float
    ec: float
    no3_n: float
    t_p: float
    t_n: float
    chlorophyll_a: float
    cod: float

class AllSugyePredictionRequest(BaseModel):
    all_sensor_data: Dict[str, List[SensorDataPoint]]

# --- 3. API 엔드포인트 ---

@app.get("/")
def read_root():
    return {"message": "수계별 WQI 예측 API 서버입니다."}


@app.post("/predict/all_with_sensors")
def predict_all_with_sensors(request: AllSugyePredictionRequest):
    """
    사용자가 직접 모든 날짜의 센서 데이터를 제공하는 경우 예측.
    """
    sugye_feature_names = onehot_encoder.get_feature_names_out(['수계별'])
    sugye_names_in_model = [name.split('_')[-1] for name in sugye_feature_names]
    all_predictions = {}

    for sugye_name, sensor_data_list in request.all_sensor_data.items():
        if sugye_name not in sugye_names_in_model:
            all_predictions[sugye_name] = f"Error: '{sugye_name}'은(는) 유효한 수계 이름이 아닙니다."
            continue

        try:
            future_df = pd.DataFrame([data.dict() for data in sensor_data_list])
            future_df['ds'] = pd.to_datetime(future_df['ds'])
        except Exception as e:
            all_predictions[sugye_name] = f"Error: 센서 데이터 변환 중 오류 - {e}"
            continue

        # one-hot 인코딩 컬럼 초기화 후 현재 수계만 1l
        for col in sugye_feature_names:
            future_df[col] = 0
        future_df[f"수계별_{sugye_name}"] = 1

        try:
            forecast = model.predict(future_df)
        except Exception as e:
            all_predictions[sugye_name] = f"Error: 모델 예측 중 오류 - {e}"
            continue

        forecast['WQI_등급'] = forecast['yhat'].apply(classify_nsfwqi)
        results = forecast[['ds', 'yhat', 'WQI_등급']]
        results['ds'] = results['ds'].dt.strftime('%Y-%m-%d')
        all_predictions[sugye_name] = results.to_dict('records')

    return all_predictions


@app.post("/predict/future")
def predict_future(request: AllSugyePredictionRequest, days: int = Query(30, description="예측할 일 수 (기본 30일)")):
    """
    마지막 입력 데이터 기준으로 future 날짜를 자동 생성하여 예측.
    days 파라미터로 예측할 일 수를 지정할 수 있습니다.
    """
    sugye_feature_names = onehot_encoder.get_feature_names_out(['수계별'])
    sugye_names_in_model = [name.split('_')[-1] for name in sugye_feature_names]
    all_predictions = {}

    for sugye_name, sensor_data_list in request.all_sensor_data.items():
        if sugye_name not in sugye_names_in_model:
            all_predictions[sugye_name] = f"Error: '{sugye_name}'은(는) 유효한 수계 이름이 아닙니다."
            continue

        # 마지막 관측 데이터 기준
        last_data = sensor_data_list[-1].dict()
        last_date = pd.to_datetime(last_data["ds"])

        # 미래 날짜 자동 생성
        future_data = []
        for i in range(1, days + 1):
            new_point = last_data.copy()
            new_point["ds"] = (last_date + timedelta(days=i)).strftime("%Y-%m-%d")
            future_data.append(new_point)

        future_df = pd.DataFrame(future_data)
        future_df['ds'] = pd.to_datetime(future_df['ds'])

        # one-hot 인코딩 컬럼 초기화 후 현재 수계만 1
        for col in sugye_feature_names:
            future_df[col] = 0
        future_df[f"수계별_{sugye_name}"] = 1

        try:
            forecast = model.predict(future_df)
        except Exception as e:
            all_predictions[sugye_name] = f"Error: 모델 예측 중 오류 - {e}"
            continue

        forecast['WQI_등급'] = forecast['yhat'].apply(classify_nsfwqi)
        results = forecast[['ds', 'yhat', 'WQI_등급']]
        results['ds'] = results['ds'].dt.strftime('%Y-%m-%d')
        all_predictions[sugye_name] = results.to_dict('records')

    return all_predictions

@app.get("/health")
def health_check():
    return {"status": "ok"}

