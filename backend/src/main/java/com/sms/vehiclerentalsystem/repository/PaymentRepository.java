package com.sms.vehiclerentalsystem.repository;

import com.sms.vehiclerentalsystem.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
}
