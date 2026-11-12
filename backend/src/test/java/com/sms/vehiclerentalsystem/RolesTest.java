package com.sms.vehiclerentalsystem;

import com.sms.vehiclerentalsystem.dto.BookingRequest;
import com.sms.vehiclerentalsystem.dto.NewDriverRequest;
import com.sms.vehiclerentalsystem.exception.ApiException;
import com.sms.vehiclerentalsystem.model.*;
import com.sms.vehiclerentalsystem.repository.DriverRepository;
import com.sms.vehiclerentalsystem.repository.VehicleRepository;
import com.sms.vehiclerentalsystem.service.AuthService;
import com.sms.vehiclerentalsystem.service.BookingService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class RolesTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private BookingService bookingService;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private DriverRepository driverRepository;

    private User account(String prefix, User.Role role) {
        return authService.createAccount(prefix, prefix + System.nanoTime() + "@example.com", "9000000002", "secret123", role);
    }

    private Driver driverWithAccount(String name) {
        User acc = account(name, User.Role.DRIVER);
        Driver d = new Driver(name, "9000000003", acc.getEmail(), "TS00", 5.0, 0);
        d.setAccount(acc);
        return driverRepository.save(d);
    }

    @Test
    void eachRoleMustUseItsOwnLogin() {
        User customer = account("cust", User.Role.USER);
        User driver = account("drv", User.Role.DRIVER);

        assertNotNull(authService.login(customer.getEmail(), "secret123", User.Role.USER).getToken());
        assertNotNull(authService.login(driver.getEmail(), "secret123", User.Role.DRIVER).getToken());

        ApiException ex = assertThrows(ApiException.class,
                () -> authService.login(driver.getEmail(), "secret123", User.Role.USER));
        assertEquals(HttpStatus.FORBIDDEN, ex.getStatus());
        assertThrows(ApiException.class, () -> authService.login(customer.getEmail(), "secret123", User.Role.ADMIN));
    }

    @Test
    void blockedAccountCannotLogInAndLosesSession() {
        User customer = account("blocked", User.Role.USER);
        String token = authService.login(customer.getEmail(), "secret123", User.Role.USER).getToken();

        authService.setActive(customer, false);

        assertFalse(authService.findByToken(token).isPresent(), "old session should stop working");
        assertThrows(ApiException.class, () -> authService.login(customer.getEmail(), "secret123", User.Role.USER));
    }

    @Test
    void registeredDriverWaitsForApprovalAndIsNeverAssignedBeforeIt() {
        NewDriverRequest req = new NewDriverRequest();
        req.setName("New Driver");
        req.setEmail("newdriver" + System.nanoTime() + "@example.com");
        req.setPhone("9000000004");
        req.setLicenseNumber("TS01");
        req.setPassword("secret123");
        Driver driver = authService.registerDriver(req);

        assertEquals(Driver.Status.PENDING, driver.getStatus());
        ApiException ex = assertThrows(ApiException.class,
                () -> authService.login(req.getEmail(), "secret123", User.Role.DRIVER));
        assertTrue(ex.getMessage().contains("waiting for admin approval"));
        assertTrue(driverRepository.findByStatusOrderByRatingDesc(Driver.Status.ACTIVE).stream()
                .noneMatch(d -> d.getId().equals(driver.getId())), "pending drivers must not be assignable");

        // Admin approval: driver becomes active and can log in
        driver.setStatus(Driver.Status.ACTIVE);
        authService.setActive(driver.getAccount(), true);
        assertNotNull(authService.login(req.getEmail(), "secret123", User.Role.DRIVER).getToken());
    }

    @Test
    void driverCanOnlyStartAndCompleteOwnTrips() {
        // Make the two test drivers the only active ones so the booking is assigned to one of them
        driverRepository.findAll().forEach(d -> d.setStatus(Driver.Status.BLOCKED));
        Driver mine = driverWithAccount("Mine");
        Driver other = driverWithAccount("Other");
        other.setStatus(Driver.Status.BLOCKED);

        Vehicle car = vehicleRepository.save(new Vehicle("Role Car", "TEST", "CAR", null,
                1000, 4.5, 20, "Petrol", "Manual", 5, "Gachibowli, Hyderabad"));
        BookingRequest r = new BookingRequest();
        r.setVehicleId(car.getId());
        r.setPickupDate(LocalDate.now());
        r.setReturnDate(LocalDate.now().plusDays(1));
        r.setDriverType(Booking.DriverType.WITH_DRIVER);
        r.setPaymentMethod(Payment.Method.UPI);
        Booking booking = bookingService.createBooking(r, account("cust", User.Role.USER));
        assertEquals(mine.getId(), booking.getDriver().getId());

        // Not approved yet, so the driver can't start it
        assertThrows(ApiException.class, () -> bookingService.updateStatusByDriver(booking.getId(), mine, Booking.Status.ONGOING));
        bookingService.updateStatusByAdmin(booking.getId(), Booking.Status.APPROVED, null);

        ApiException notMine = assertThrows(ApiException.class,
                () -> bookingService.updateStatusByDriver(booking.getId(), other, Booking.Status.ONGOING));
        assertEquals(HttpStatus.FORBIDDEN, notMine.getStatus());
        assertThrows(ApiException.class, () -> bookingService.updateStatusByDriver(booking.getId(), mine, Booking.Status.CANCELLED));

        assertEquals(Booking.Status.ONGOING, bookingService.updateStatusByDriver(booking.getId(), mine, Booking.Status.ONGOING).getStatus());
        assertEquals(Booking.Status.COMPLETED, bookingService.updateStatusByDriver(booking.getId(), mine, Booking.Status.COMPLETED).getStatus());
        assertEquals(1, driverRepository.findById(mine.getId()).get().getTrips());
    }
}
