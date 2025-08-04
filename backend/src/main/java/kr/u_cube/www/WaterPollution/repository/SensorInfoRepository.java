package kr.u_cube.www.WaterPollution.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import kr.u_cube.www.WaterPollution.entity.SensorInfo;

@Repository
public interface SensorInfoRepository extends JpaRepository<SensorInfo, Long> {
    Optional<SensorInfo> findByDeviceId(String deviceId);
}

