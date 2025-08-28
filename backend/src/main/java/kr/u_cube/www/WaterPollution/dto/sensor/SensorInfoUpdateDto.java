package kr.u_cube.www.WaterPollution.dto.sensor;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SensorInfoUpdateDto {
    private String name;        // 센서 이름 (예: "청계천 상류 센서")
    private String ptno;        // 측정소 코드 (예: "3011A40")
    private String type;        // 측정망 종류 (예: "하천", "호소")
    private Double lat;         // 위도
    private Double lon;         // 경도
    private String location;    // 설치 위치 (예: "서울시 종로구 청계천")
    
    // 부분 업데이트를 위해 null 허용
    // null인 필드는 업데이트하지 않음
}