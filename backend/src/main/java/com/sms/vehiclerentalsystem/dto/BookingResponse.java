package com.sms.vehiclerentalsystem.dto;

import com.sms.vehiclerentalsystem.model.Booking;
import com.sms.vehiclerentalsystem.model.Payment;

import java.time.LocalDate;
import java.time.LocalDateTime;

// Flat view of a booking sent to the frontend (avoids exposing entity relations directly)
public class BookingResponse {

    public Long id;
    public String bookingCode;
    public Long vehicleId;
    public String vehicleName;
    public String vehicleImage;
    public String pickupLocation;
    public LocalDate pickupDate;
    public LocalDate returnDate;
    public int days;
    public String driverType;
    public String driverName;
    public String driverPhone;
    public double basePrice;
    public double taxes;
    public double driverCost;
    public double total;
    public String status;
    public String customerName;
    public String customerEmail;
    public String customerPhone;
    public String paymentMethod;
    public String paymentStatus;
    public String transactionId;
    public String adminNote;
    public boolean reviewed;
    public Integer reviewRating;
    public LocalDateTime createdAt;

    public static BookingResponse from(Booking b) {
        BookingResponse r = new BookingResponse();
        r.id = b.getId();
        r.bookingCode = b.getBookingCode();
        r.vehicleId = b.getVehicle().getId();
        r.vehicleName = b.getVehicle().getName();
        r.vehicleImage = b.getVehicle().getImageUrl();
        r.pickupLocation = b.getVehicle().getLocation();
        r.pickupDate = b.getPickupDate();
        r.returnDate = b.getReturnDate();
        r.days = b.getDays();
        r.driverType = b.getDriverType().name();
        if (b.getDriver() != null) {
            r.driverName = b.getDriver().getName();
            r.driverPhone = b.getDriver().getPhone();
        }
        r.basePrice = b.getBasePrice();
        r.taxes = b.getTaxes();
        r.driverCost = b.getDriverCost();
        r.total = b.getTotal();
        r.status = b.getStatus().name();
        r.customerName = b.getCustomerName();
        r.customerEmail = b.getCustomerEmail();
        r.customerPhone = b.getCustomerPhone();
        Payment p = b.getPayment();
        if (p != null) {
            r.paymentMethod = p.getMethod().name();
            r.paymentStatus = p.getStatus().name();
            r.transactionId = p.getTransactionId();
        }
        r.adminNote = b.getAdminNote();
        if (b.getReview() != null) {
            r.reviewed = true;
            r.reviewRating = b.getReview().getVehicleRating();
        }
        r.createdAt = b.getCreatedAt();
        return r;
    }
}
