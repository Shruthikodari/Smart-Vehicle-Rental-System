package com.sms.vehiclerentalsystem.controller;

import com.sms.vehiclerentalsystem.config.AuthInterceptor;
import com.sms.vehiclerentalsystem.dto.BookingResponse;
import com.sms.vehiclerentalsystem.dto.NewDriverRequest;
import com.sms.vehiclerentalsystem.exception.ApiException;
import com.sms.vehiclerentalsystem.model.Booking;
import com.sms.vehiclerentalsystem.model.Driver;
import com.sms.vehiclerentalsystem.model.Notification;
import com.sms.vehiclerentalsystem.model.Payment;
import com.sms.vehiclerentalsystem.model.User;
import com.sms.vehiclerentalsystem.model.Vehicle;
import com.sms.vehiclerentalsystem.repository.DriverRepository;
import com.sms.vehiclerentalsystem.repository.UserRepository;
import com.sms.vehiclerentalsystem.repository.VehicleRepository;
import com.sms.vehiclerentalsystem.service.AnalyticsService;
import com.sms.vehiclerentalsystem.service.AuthService;
import com.sms.vehiclerentalsystem.service.BookingService;
import com.sms.vehiclerentalsystem.service.NotificationService;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.Collections;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

// All routes here are protected by AuthInterceptor (ADMIN token required)
@RestController
@RequestMapping("/admin")
public class AdminController {

    private final AnalyticsService analyticsService;
    private final BookingService bookingService;
    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;
    private final UserRepository userRepository;
    private final AuthService authService;
    private final NotificationService notificationService;

    public AdminController(AnalyticsService analyticsService, BookingService bookingService,
                           VehicleRepository vehicleRepository, DriverRepository driverRepository,
                           UserRepository userRepository, AuthService authService,
                           NotificationService notificationService) {
        this.analyticsService = analyticsService;
        this.bookingService = bookingService;
        this.vehicleRepository = vehicleRepository;
        this.driverRepository = driverRepository;
        this.userRepository = userRepository;
        this.authService = authService;
        this.notificationService = notificationService;
    }

    // ---------- Dashboard & analytics ----------

    @GetMapping("/dashboard")
    public Map<String, Object> dashboard() {
        return analyticsService.dashboard();
    }

    @GetMapping("/analytics")
    public Map<String, Object> analytics() {
        return analyticsService.analytics();
    }

    // ---------- Bookings ----------

    @GetMapping("/bookings")
    public List<BookingResponse> bookings() {
        return bookingService.findAll().stream().map(BookingResponse::from).collect(Collectors.toList());
    }

    @PutMapping("/bookings/{id}/status")
    public BookingResponse updateBookingStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Booking.Status status;
        try {
            status = Booking.Status.valueOf(body.getOrDefault("status", ""));
        } catch (IllegalArgumentException e) {
            throw ApiException.badRequest("Invalid status");
        }
        return BookingResponse.from(bookingService.updateStatusByAdmin(id, status, body.get("note")));
    }

    // ---------- Vehicles ----------

    @GetMapping("/vehicles")
    public List<Vehicle> vehicles() {
        return vehicleRepository.findAll();
    }

    @PostMapping("/vehicles")
    @ResponseStatus(HttpStatus.CREATED)
    public Vehicle addVehicle(@Valid @RequestBody Vehicle vehicle) {
        vehicle.setId(null);
        if (vehicle.getStatus() == null) {
            vehicle.setStatus(Vehicle.Status.AVAILABLE);
        }
        return vehicleRepository.save(vehicle);
    }

    @PutMapping("/vehicles/{id}")
    public Vehicle updateVehicle(@PathVariable Long id, @Valid @RequestBody Vehicle vehicle) {
        if (!vehicleRepository.existsById(id)) {
            throw ApiException.notFound("Vehicle");
        }
        vehicle.setId(id);
        return vehicleRepository.save(vehicle);
    }

    @PatchMapping("/vehicles/{id}/status")
    public Vehicle updateVehicleStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Vehicle vehicle = vehicleRepository.findById(id).orElseThrow(() -> ApiException.notFound("Vehicle"));
        try {
            vehicle.setStatus(Vehicle.Status.valueOf(body.getOrDefault("status", "")));
        } catch (IllegalArgumentException e) {
            throw ApiException.badRequest("Invalid status");
        }
        return vehicleRepository.save(vehicle);
    }

    @DeleteMapping("/vehicles/{id}")
    public void deleteVehicle(@PathVariable Long id) {
        if (!vehicleRepository.existsById(id)) {
            throw ApiException.notFound("Vehicle");
        }
        try {
            vehicleRepository.deleteById(id);
            vehicleRepository.flush();
        } catch (DataIntegrityViolationException e) {
            throw new ApiException(HttpStatus.CONFLICT,
                    "This vehicle has bookings and cannot be deleted. Set it to MAINTENANCE instead.");
        }
    }

    // ---------- Drivers ----------

    @GetMapping("/drivers")
    public List<Driver> drivers() {
        return driverRepository.findAll();
    }

    @PostMapping("/drivers")
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public Driver addDriver(@Valid @RequestBody NewDriverRequest request) {
        // Every driver gets a login for the driver portal
        User account = authService.createAccount(request.getName(), request.getEmail(), request.getPhone(),
                request.getPassword(), User.Role.DRIVER);
        Driver driver = new Driver(request.getName().trim(), request.getPhone(), account.getEmail(),
                request.getLicenseNumber(), 5.0, 0);
        driver.setAccount(account);
        return driverRepository.save(driver);
    }

    // Approve a driver who registered themselves
    @PutMapping("/drivers/{id}/approve")
    public Driver approveDriver(@PathVariable Long id) {
        Driver driver = driverRepository.findById(id).orElseThrow(() -> ApiException.notFound("Driver"));
        if (driver.getStatus() != Driver.Status.PENDING) {
            throw ApiException.badRequest("This driver is not waiting for approval");
        }
        driver.setStatus(Driver.Status.ACTIVE);
        if (driver.getAccount() != null) {
            authService.setActive(driver.getAccount(), true);
            notificationService.notify(driver.getAccount(), Notification.Type.SUCCESS, "Registration approved",
                    "Welcome to SmartRide. You will now be assigned to with-driver bookings.", null);
        }
        return driverRepository.save(driver);
    }

    @PutMapping("/drivers/{id}/reject")
    public Driver rejectDriver(@PathVariable Long id) {
        Driver driver = driverRepository.findById(id).orElseThrow(() -> ApiException.notFound("Driver"));
        if (driver.getStatus() != Driver.Status.PENDING) {
            throw ApiException.badRequest("This driver is not waiting for approval");
        }
        driver.setStatus(Driver.Status.BLOCKED);
        return driverRepository.save(driver);
    }

    @PutMapping("/drivers/{id}/toggle")
    public Driver toggleDriver(@PathVariable Long id) {
        Driver driver = driverRepository.findById(id).orElseThrow(() -> ApiException.notFound("Driver"));
        if (driver.getStatus() == Driver.Status.PENDING) {
            throw ApiException.badRequest("Approve or reject this registration first");
        }
        driver.setStatus(driver.getStatus() == Driver.Status.ACTIVE ? Driver.Status.BLOCKED : Driver.Status.ACTIVE);
        if (driver.getAccount() != null) {
            authService.setActive(driver.getAccount(), driver.getStatus() == Driver.Status.ACTIVE);
        }
        return driverRepository.save(driver);
    }

    // ---------- Notifications ----------

    @GetMapping("/notifications")
    public List<Notification> notifications(@RequestAttribute(AuthInterceptor.CURRENT_USER) User admin) {
        return notificationService.forUser(admin);
    }

    @PutMapping("/notifications/{id}/read")
    public Notification markNotificationRead(@PathVariable Long id, @RequestAttribute(AuthInterceptor.CURRENT_USER) User admin) {
        return notificationService.markRead(admin, id);
    }

    @PutMapping("/notifications/read-all")
    public void markAllNotificationsRead(@RequestAttribute(AuthInterceptor.CURRENT_USER) User admin) {
        notificationService.markAllRead(admin);
    }

    @GetMapping("/notifications/unread-count")
    public Map<String, Long> unreadCount(@RequestAttribute(AuthInterceptor.CURRENT_USER) User admin) {
        return Collections.singletonMap("count", notificationService.unreadCount(admin));
    }

    // ---------- Customers ----------

    @GetMapping("/users")
    public List<Map<String, Object>> users() {
        return userRepository.findByRoleOrderByCreatedAtDesc(User.Role.USER).stream().map(u -> {
            List<Booking> bookings = bookingService.findForUser(u);
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", u.getId());
            row.put("name", u.getName());
            row.put("email", u.getEmail());
            row.put("phone", u.getPhone());
            row.put("active", u.isActive());
            row.put("joined", u.getCreatedAt());
            row.put("bookings", bookings.size());
            row.put("activeBookings", bookings.stream().filter(b -> BookingService.ACTIVE_STATUSES.contains(b.getStatus())).count());
            row.put("totalSpent", bookings.stream()
                    .filter(b -> b.getPayment() != null && b.getPayment().getStatus() == Payment.Status.PAID)
                    .mapToDouble(Booking::getTotal).sum());
            row.put("lastBooking", bookings.stream().map(Booking::getCreatedAt).max(Comparator.naturalOrder()).orElse(null));
            return row;
        }).collect(Collectors.toList());
    }

    @PutMapping("/users/{id}/toggle")
    public Map<String, Object> toggleUser(@PathVariable Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> ApiException.notFound("User"));
        if (user.getRole() != User.Role.USER) {
            throw ApiException.badRequest("Only customer accounts can be blocked here");
        }
        authService.setActive(user, !user.isActive());
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("id", user.getId());
        body.put("active", user.isActive());
        return body;
    }
}
