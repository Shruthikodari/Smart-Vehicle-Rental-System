package com.sms.vehiclerentalsystem.repository;

import com.sms.vehiclerentalsystem.model.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import javax.persistence.LockModeType;
import java.util.Optional;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    long countByStatus(Vehicle.Status status);

    // Row lock so two users cannot book the same vehicle for overlapping dates at the same time
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select v from Vehicle v where v.id = :id")
    Optional<Vehicle> findByIdForUpdate(@Param("id") Long id);
}
