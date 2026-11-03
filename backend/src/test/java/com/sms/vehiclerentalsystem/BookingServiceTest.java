package com.sms.vehiclerentalsystem;

import com.sms.vehiclerentalsystem.dto.BookingRequest;
import com.sms.vehiclerentalsystem.dto.ReviewRequest;
import com.sms.vehiclerentalsystem.exception.ApiException;
import com.sms.vehiclerentalsystem.model.*;
import com.sms.vehiclerentalsystem.repository.BookingRepository;
import com.sms.vehiclerentalsystem.repository.NotificationRepository;
import com.sms.vehiclerentalsystem.repository.UserRepository;
import com.sms.vehiclerentalsystem.repository.VehicleRepository;
import com.sms.vehiclerentalsystem.service.BookingService;
import com.sms.vehiclerentalsystem.service.ReviewService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class BookingServiceTest {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private ReviewService reviewService;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    private Vehicle vehicle;
    private User customer;
    private final LocalDate start = LocalDate.now().plusDays(60);

    @BeforeEach
    void setUp() {
        vehicle = vehicleRepository.save(new Vehicle("Test Car", "TEST", "CAR", null,
                1000, 4.5, 20, "Petrol", "Manual", 5, "Test City"));
        User u = new User();
        u.setName("Test User");
        u.setEmail("test-" + System.nanoTime() + "@example.com");
        u.setPhone("9000000001");
        u.setPasswordHash("x");
        customer = userRepository.save(u);
    }

    private BookingRequest request(LocalDate from, LocalDate to, Booking.DriverType driverType, Payment.Method method) {
        BookingRequest r = new BookingRequest();
        r.setVehicleId(vehicle.getId());
        r.setPickupDate(from);
        r.setReturnDate(to);
        r.setDriverType(driverType);
        r.setPaymentMethod(method);
        return r;
    }

    private Booking book(LocalDate from, LocalDate to) {
        return bookingService.createBooking(request(from, to, Booking.DriverType.SELF_DRIVE, Payment.Method.UPI), customer);
    }

    @Test
    void newBookingIsPendingWithServerPriceAndNotification() {
        Booking b = bookingService.createBooking(
                request(start, start.plusDays(3), Booking.DriverType.WITH_DRIVER, Payment.Method.UPI), customer);

        assertEquals(Booking.Status.PENDING, b.getStatus());
        assertEquals(3, b.getDays());
        assertEquals(3000, b.getBasePrice());
        assertEquals(150, b.getTaxes());
        assertEquals(1500, b.getDriverCost());
        assertEquals(4650, b.getTotal());
        assertNotNull(b.getDriver(), "a driver should be assigned");
        assertEquals(customer.getEmail(), b.getCustomerEmail());
        assertEquals(1, notificationRepository.countByUserIdAndReadFalse(customer.getId()));
    }

    @Test
    void bookingRequiresLogin() {
        ApiException ex = assertThrows(ApiException.class, () -> bookingService.createBooking(
                request(start, start.plusDays(1), Booking.DriverType.SELF_DRIVE, Payment.Method.UPI), null));
        assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatus());
    }

    @Test
    void rejectsOverlappingBooking() {
        book(start, start.plusDays(3));
        ApiException ex = assertThrows(ApiException.class, () -> book(start.plusDays(2), start.plusDays(5)));
        assertEquals(HttpStatus.CONFLICT, ex.getStatus());
    }

    @Test
    void allowsBackToBackBooking() {
        book(start, start.plusDays(3));
        assertNotNull(book(start.plusDays(3), start.plusDays(4)).getId());
    }

    @Test
    void rejectedBookingIsRefundedAndFreesDates() {
        Booking b = book(start, start.plusDays(2));
        Booking rejected = bookingService.updateStatusByAdmin(b.getId(), Booking.Status.REJECTED, "Not available");

        assertEquals(Booking.Status.REJECTED, rejected.getStatus());
        assertEquals(Payment.Status.REFUNDED, rejected.getPayment().getStatus());
        assertTrue(bookingService.isVehicleAvailable(vehicle.getId(), start, start.plusDays(2)));
    }

    @Test
    void fullLifecycleEndsWithReview() {
        // Booked for today so the rental can start
        Booking b = book(LocalDate.now(), LocalDate.now().plusDays(2));
        bookingService.updateStatusByAdmin(b.getId(), Booking.Status.APPROVED, null);
        bookingService.updateStatusByAdmin(b.getId(), Booking.Status.ONGOING, null);
        Booking done = bookingService.updateStatusByAdmin(b.getId(), Booking.Status.COMPLETED, null);
        assertEquals(Booking.Status.COMPLETED, done.getStatus());

        ReviewRequest review = new ReviewRequest();
        review.setBookingCode(b.getBookingCode());
        review.setVehicleRating(3);
        review.setComment("Okay");
        reviewService.create(review, customer);

        assertEquals(3.0, vehicleRepository.findById(vehicle.getId()).get().getRating());
        assertThrows(ApiException.class, () -> reviewService.create(review, customer), "only one review per rental");
    }

    @Test
    void cannotSkipLifecycleSteps() {
        Booking b = book(start, start.plusDays(1));
        assertThrows(ApiException.class, () -> bookingService.updateStatusByAdmin(b.getId(), Booking.Status.COMPLETED, null));
        bookingService.updateStatusByAdmin(b.getId(), Booking.Status.APPROVED, null);
        // Pick-up date is in the future, so the rental cannot start yet
        assertThrows(ApiException.class, () -> bookingService.updateStatusByAdmin(b.getId(), Booking.Status.ONGOING, null));
    }

    @Test
    void cannotReviewUnfinishedRental() {
        Booking b = book(start, start.plusDays(1));
        ReviewRequest review = new ReviewRequest();
        review.setBookingCode(b.getBookingCode());
        review.setVehicleRating(5);
        assertThrows(ApiException.class, () -> reviewService.create(review, customer));
    }

    @Test
    void schedulerStartsApprovedRentalsAndExpiresStalePending() {
        Booking approved = book(LocalDate.now(), LocalDate.now().plusDays(1));
        bookingService.updateStatusByAdmin(approved.getId(), Booking.Status.APPROVED, null);

        Booking stale = book(start, start.plusDays(1));
        stale.setPickupDate(LocalDate.now().minusDays(1));
        stale.setReturnDate(LocalDate.now().plusDays(5));
        bookingRepository.save(stale);

        bookingService.advanceBookings();

        assertEquals(Booking.Status.ONGOING, bookingRepository.findById(approved.getId()).get().getStatus());
        assertEquals(Booking.Status.REJECTED, bookingRepository.findById(stale.getId()).get().getStatus());
    }

    @Test
    void maintenanceVehicleCannotBeBooked() {
        vehicle.setStatus(Vehicle.Status.MAINTENANCE);
        vehicleRepository.save(vehicle);
        assertThrows(ApiException.class, () -> book(start, start.plusDays(1)));
    }
}
