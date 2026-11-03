package com.sms.vehiclerentalsystem.repository;

import com.sms.vehiclerentalsystem.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    Optional<Booking> findByBookingCode(String bookingCode);

    List<Booking> findByCustomerEmailIgnoreCaseOrderByPickupDateDesc(String email);

    List<Booking> findAllByOrderByCreatedAtDesc();

    List<Booking> findByStatusIn(Collection<Booking.Status> statuses);

    long countByStatus(Booking.Status status);

    // Two rentals overlap when one starts before the other ends (return day is free for the next customer)
    @Query("select count(b) > 0 from Booking b where b.vehicle.id = :vehicleId and b.status in :active " +
            "and b.pickupDate < :returnDate and b.returnDate > :pickupDate")
    boolean vehicleHasOverlap(@Param("vehicleId") Long vehicleId,
                              @Param("pickupDate") LocalDate pickupDate,
                              @Param("returnDate") LocalDate returnDate,
                              @Param("active") Collection<Booking.Status> active);

    @Query("select count(b) > 0 from Booking b where b.driver.id = :driverId and b.status in :active " +
            "and b.pickupDate < :returnDate and b.returnDate > :pickupDate")
    boolean driverHasOverlap(@Param("driverId") Long driverId,
                             @Param("pickupDate") LocalDate pickupDate,
                             @Param("returnDate") LocalDate returnDate,
                             @Param("active") Collection<Booking.Status> active);

    List<Booking> findByUserIdOrderByPickupDateDesc(Long userId);

    List<Booking> findByStatusAndReturnDateBefore(Booking.Status status, LocalDate date);

    List<Booking> findByStatusAndPickupDateLessThanEqual(Booking.Status status, LocalDate date);

    List<Booking> findByStatusAndPickupDateBefore(Booking.Status status, LocalDate date);

    List<Booking> findByStatusAndPickupDateAndReminderSentFalse(Booking.Status status, LocalDate date);
}
