package com.sms.vehiclerentalsystem.dto;

import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

public class ReviewRequest {

    @NotBlank
    private String bookingCode;

    @Min(1)
    @Max(5)
    private int vehicleRating;

    @Min(1)
    @Max(5)
    private Integer driverRating;

    @Size(max = 1000)
    private String comment;

    public String getBookingCode() { return bookingCode; }
    public void setBookingCode(String bookingCode) { this.bookingCode = bookingCode; }

    public int getVehicleRating() { return vehicleRating; }
    public void setVehicleRating(int vehicleRating) { this.vehicleRating = vehicleRating; }

    public Integer getDriverRating() { return driverRating; }
    public void setDriverRating(Integer driverRating) { this.driverRating = driverRating; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
}
