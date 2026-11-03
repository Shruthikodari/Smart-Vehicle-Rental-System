package com.sms.vehiclerentalsystem.controller;

import com.sms.vehiclerentalsystem.dto.BookingResponse;
import com.sms.vehiclerentalsystem.exception.ApiException;
import com.sms.vehiclerentalsystem.model.Booking;
import com.sms.vehiclerentalsystem.model.Driver;
import com.sms.vehiclerentalsystem.model.Vehicle;
import com.sms.vehiclerentalsystem.repository.DriverRepository;
import com.sms.vehiclerentalsystem.repository.VehicleRepository;
import com.sms.vehiclerentalsystem.service.AnalyticsService;
import com.sms.vehiclerentalsystem.service.BookingService;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
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

    public AdminController(AnalyticsService analyticsService, BookingService bookingService,
                           VehicleRepository vehicleRepository, DriverRepository driverRepository) {
        this.analyticsService = analyticsService;
        this.bookingService = bookingService;
        this.vehicleRepository = vehicleRepository;
        this.driverRepository = driverRepository;
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
    public Driver addDriver(@Valid @RequestBody Driver driver) {
        driver.setId(null);
        driver.setTrips(0);
        if (driver.getStatus() == null) {
            driver.setStatus(Driver.Status.ACTIVE);
        }
        return driverRepository.save(driver);
    }

    @PutMapping("/drivers/{id}/toggle")
    public Driver toggleDriver(@PathVariable Long id) {
        Driver driver = driverRepository.findById(id).orElseThrow(() -> ApiException.notFound("Driver"));
        driver.setStatus(driver.getStatus() == Driver.Status.ACTIVE ? Driver.Status.BLOCKED : Driver.Status.ACTIVE);
        return driverRepository.save(driver);
    }
}
