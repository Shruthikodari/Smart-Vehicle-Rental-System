package com.sms.vehiclerentalsystem.dto;

import com.sms.vehiclerentalsystem.model.Review;

import java.time.LocalDateTime;

public class ReviewResponse {

    public Long id;
    public String bookingCode;
    public String customerName;
    public Long vehicleId;
    public String vehicleName;
    public String driverName;
    public int vehicleRating;
    public Integer driverRating;
    public String comment;
    public LocalDateTime createdAt;

    public static ReviewResponse from(Review r) {
        ReviewResponse res = new ReviewResponse();
        res.id = r.getId();
        res.bookingCode = r.getBooking().getBookingCode();
        res.customerName = r.getUser().getName();
        res.vehicleId = r.getVehicle().getId();
        res.vehicleName = r.getVehicle().getName();
        res.driverName = r.getDriver() != null ? r.getDriver().getName() : null;
        res.vehicleRating = r.getVehicleRating();
        res.driverRating = r.getDriverRating();
        res.comment = r.getComment();
        res.createdAt = r.getCreatedAt();
        return res;
    }
}
