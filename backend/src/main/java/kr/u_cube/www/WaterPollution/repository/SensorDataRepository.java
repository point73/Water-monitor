package kr.u_cube.www.WaterPollution.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import kr.u_cube.www.WaterPollution.entity.SensorData;

@Repository
public interface SensorDataRepository extends JpaRepository<SensorData, Long> {
    Optional<SensorData> findTopByOrderByMeasuredAtDesc(); // 가장 최근 데이터 1개
}
