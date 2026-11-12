package com.sms.vehiclerentalsystem.repository;

import com.sms.vehiclerentalsystem.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByVehicleIdOrderByCreatedAtDesc(Long vehicleId);

    List<Review> findTop20ByOrderByCreatedAtDesc();

    List<Review> findByUserIdOrderByCreatedAtDesc(Long userId);

    boolean existsByBookingId(Long bookingId);

    @Query("select avg(r.vehicleRating) from Review r where r.vehicle.id = :vehicleId")
    Double averageVehicleRating(@Param("vehicleId") Long vehicleId);

    @Query("select avg(r.driverRating) from Review r where r.driver.id = :driverId and r.driverRating is not null")
    Double averageDriverRating(@Param("driverId") Long driverId);
}
