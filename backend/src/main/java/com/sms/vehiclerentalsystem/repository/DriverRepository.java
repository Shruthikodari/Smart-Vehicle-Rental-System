package com.sms.vehiclerentalsystem.repository;

import com.sms.vehiclerentalsystem.model.Driver;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DriverRepository extends JpaRepository<Driver, Long> {
    List<Driver> findByStatusOrderByRatingDesc(Driver.Status status);
    long countByStatus(Driver.Status status);
    Optional<Driver> findByAccountId(Long userId);
}
