package com.sms.vehiclerentalsystem.dto;

import com.sms.vehiclerentalsystem.model.Booking;
import com.sms.vehiclerentalsystem.model.Payment;

import javax.validation.constraints.NotNull;
import java.time.LocalDate;

// Customer details come from the logged-in account, not from the request
public class BookingRequest {

    @NotNull
    private Long vehicleId;

    @NotNull
    private LocalDate pickupDate;

    @NotNull
    private LocalDate returnDate;

    @NotNull
    private Booking.DriverType driverType;

    @NotNull
    private Payment.Method paymentMethod;

    public Long getVehicleId() { return vehicleId; }
    public void setVehicleId(Long vehicleId) { this.vehicleId = vehicleId; }

    public LocalDate getPickupDate() { return pickupDate; }
    public void setPickupDate(LocalDate pickupDate) { this.pickupDate = pickupDate; }

    public LocalDate getReturnDate() { return returnDate; }
    public void setReturnDate(LocalDate returnDate) { this.returnDate = returnDate; }

    public Booking.DriverType getDriverType() { return driverType; }
    public void setDriverType(Booking.DriverType driverType) { this.driverType = driverType; }

    public Payment.Method getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(Payment.Method paymentMethod) { this.paymentMethod = paymentMethod; }
}
