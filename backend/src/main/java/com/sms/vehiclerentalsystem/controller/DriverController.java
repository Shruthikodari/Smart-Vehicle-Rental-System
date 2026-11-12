package com.sms.vehiclerentalsystem.controller;

import com.sms.vehiclerentalsystem.config.AuthInterceptor;
import com.sms.vehiclerentalsystem.dto.BookingResponse;
import com.sms.vehiclerentalsystem.exception.ApiException;
import com.sms.vehiclerentalsystem.model.Booking;
import com.sms.vehiclerentalsystem.model.Driver;
import com.sms.vehiclerentalsystem.model.Notification;
import com.sms.vehiclerentalsystem.model.User;
import com.sms.vehiclerentalsystem.repository.DriverRepository;
import com.sms.vehiclerentalsystem.service.AuthService;
import com.sms.vehiclerentalsystem.service.BookingService;
import com.sms.vehiclerentalsystem.service.NotificationService;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

// Driver portal: all routes need a DRIVER account (see AuthInterceptor)
@RestController
@RequestMapping("/driver")
public class DriverController {

    private final DriverRepository driverRepository;
    private final BookingService bookingService;
    private final AuthService authService;
    private final NotificationService notificationService;

    public DriverController(DriverRepository driverRepository, BookingService bookingService,
                            AuthService authService, NotificationService notificationService) {
        this.driverRepository = driverRepository;
        this.bookingService = bookingService;
        this.authService = authService;
        this.notificationService = notificationService;
    }

    private Driver driverFor(User user) {
        return driverRepository.findByAccountId(user.getId())
                .orElseThrow(() -> ApiException.notFound("Driver profile"));
    }

    @GetMapping("/me")
    public Map<String, Object> me(@RequestAttribute(AuthInterceptor.CURRENT_USER) User user) {
        Driver driver = driverFor(user);
        List<Booking> trips = bookingService.findForDriver(driver);
        LocalDate today = LocalDate.now();

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("driver", driver);
        body.put("upcoming", trips.stream().filter(b -> b.getStatus() == Booking.Status.APPROVED).count());
        body.put("awaitingApproval", trips.stream().filter(b -> b.getStatus() == Booking.Status.PENDING).count());
        body.put("ongoing", trips.stream().filter(b -> b.getStatus() == Booking.Status.ONGOING).count());
        body.put("completed", trips.stream().filter(b -> b.getStatus() == Booking.Status.COMPLETED).count());
        body.put("earnings", trips.stream().filter(b -> b.getStatus() == Booking.Status.COMPLETED)
                .mapToDouble(Booking::getDriverCost).sum());
        body.put("today", trips.stream()
                .filter(b -> b.getStatus() == Booking.Status.APPROVED || b.getStatus() == Booking.Status.ONGOING)
                .filter(b -> !b.getPickupDate().isAfter(today) && !b.getReturnDate().isBefore(today))
                .map(BookingResponse::from).collect(Collectors.toList()));
        return body;
    }

    @GetMapping("/bookings")
    public List<BookingResponse> bookings(@RequestAttribute(AuthInterceptor.CURRENT_USER) User user) {
        return bookingService.findForDriver(driverFor(user)).stream()
                .map(BookingResponse::from).collect(Collectors.toList());
    }

    @GetMapping("/bookings/{id}")
    public BookingResponse trip(@PathVariable Long id, @RequestAttribute(AuthInterceptor.CURRENT_USER) User user) {
        return bookingService.findForDriver(driverFor(user)).stream()
                .filter(b -> b.getId().equals(id))
                .findFirst()
                .map(BookingResponse::from)
                .orElseThrow(() -> ApiException.notFound("Trip"));
    }

    @PutMapping("/bookings/{id}/start")
    public BookingResponse start(@PathVariable Long id, @RequestAttribute(AuthInterceptor.CURRENT_USER) User user) {
        return BookingResponse.from(bookingService.updateStatusByDriver(id, driverFor(user), Booking.Status.ONGOING));
    }

    @PutMapping("/bookings/{id}/complete")
    public BookingResponse complete(@PathVariable Long id, @RequestAttribute(AuthInterceptor.CURRENT_USER) User user) {
        return BookingResponse.from(bookingService.updateStatusByDriver(id, driverFor(user), Booking.Status.COMPLETED));
    }

    @PutMapping("/profile")
    @Transactional
    public Driver updateProfile(@RequestAttribute(AuthInterceptor.CURRENT_USER) User user,
                                @RequestBody Map<String, String> body) {
        Driver driver = driverFor(user);
        authService.updateProfile(user, body.get("name"), body.get("phone"));
        driver.setName(user.getName());
        driver.setPhone(user.getPhone());
        if (body.get("licenseNumber") != null && !body.get("licenseNumber").trim().isEmpty()) {
            driver.setLicenseNumber(body.get("licenseNumber").trim());
        }
        return driverRepository.save(driver);
    }

    @PutMapping("/password")
    public Map<String, String> changePassword(@RequestAttribute(AuthInterceptor.CURRENT_USER) User user,
                                              @RequestBody Map<String, String> body) {
        authService.changePassword(user, body.get("currentPassword"), body.get("newPassword"));
        return Collections.singletonMap("message", "Password updated");
    }

    @GetMapping("/notifications")
    public List<Notification> notifications(@RequestAttribute(AuthInterceptor.CURRENT_USER) User user) {
        return notificationService.forUser(user);
    }

    @PutMapping("/notifications/read-all")
    public void markAllRead(@RequestAttribute(AuthInterceptor.CURRENT_USER) User user) {
        notificationService.markAllRead(user);
    }
}
