package kr.u_cube.www.WaterPollution.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import kr.u_cube.www.WaterPollution.entity.SensorData;

@Repository
public interface SensorDataRepository extends JpaRepository<SensorData, Long> {
    @Query(value = """
                SELECT sd.*
                FROM sensor_data sd
                INNER JOIN (
                    SELECT device_id, MAX(measured_at) AS max_measured_at
                    FROM sensor_data
                    GROUP BY device_id
                ) latest
                ON sd.device_id = latest.device_id
                   AND sd.measured_at = latest.max_measured_at
            """, nativeQuery = true)
    List<SensorData> findLatestEachDevice();

    Optional<SensorData> findTopBySensorInfo_DeviceIdOrderByMeasuredAtDesc(String deviceId);

}
