package com.sms.vehiclerentalsystem.controller;

import com.sms.vehiclerentalsystem.exception.ApiException;
import com.sms.vehiclerentalsystem.model.Vehicle;
import com.sms.vehiclerentalsystem.repository.VehicleRepository;
import com.sms.vehiclerentalsystem.service.BookingService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/vehicles")
public class VehicleController {

    private final VehicleRepository vehicleRepository;
    private final BookingService bookingService;

    public VehicleController(VehicleRepository vehicleRepository, BookingService bookingService) {
        this.vehicleRepository = vehicleRepository;
        this.bookingService = bookingService;
    }

    @GetMapping
    public List<Vehicle> getAllVehicles() {
        return vehicleRepository.findAll();
    }

    @GetMapping("/{id}")
    public Vehicle getVehicle(@PathVariable Long id) {
        return vehicleRepository.findById(id).orElseThrow(() -> ApiException.notFound("Vehicle"));
    }

    @GetMapping("/{id}/availability")
    public Map<String, Boolean> availability(@PathVariable Long id,
                                             @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
                                             @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        if (!to.isAfter(from)) {
            throw ApiException.badRequest("Return date must be after the pick-up date");
        }
        Map<String, Boolean> result = new LinkedHashMap<>();
        result.put("available", bookingService.isVehicleAvailable(id, from, to));
        result.put("driverAvailable", bookingService.isDriverAvailable(from, to));
        return result;
    }
}
