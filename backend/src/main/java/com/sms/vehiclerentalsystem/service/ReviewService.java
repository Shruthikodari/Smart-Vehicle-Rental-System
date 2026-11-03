package com.sms.vehiclerentalsystem.service;

import com.sms.vehiclerentalsystem.dto.ReviewRequest;
import com.sms.vehiclerentalsystem.exception.ApiException;
import com.sms.vehiclerentalsystem.model.*;
import com.sms.vehiclerentalsystem.repository.DriverRepository;
import com.sms.vehiclerentalsystem.repository.ReviewRepository;
import com.sms.vehiclerentalsystem.repository.VehicleRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;
    private final BookingService bookingService;

    public ReviewService(ReviewRepository reviewRepository, VehicleRepository vehicleRepository,
                         DriverRepository driverRepository, BookingService bookingService) {
        this.reviewRepository = reviewRepository;
        this.vehicleRepository = vehicleRepository;
        this.driverRepository = driverRepository;
        this.bookingService = bookingService;
    }

    @Transactional
    public Review create(ReviewRequest request, User user) {
        Booking booking = bookingService.findOwnByCode(request.getBookingCode(), user);
        if (booking.getStatus() != Booking.Status.COMPLETED) {
            throw ApiException.badRequest("You can review a rental only after it is completed");
        }
        if (reviewRepository.existsByBookingId(booking.getId())) {
            throw new ApiException(HttpStatus.CONFLICT, "You have already reviewed this rental");
        }

        Review review = new Review();
        review.setBooking(booking);
        review.setUser(user);
        review.setVehicle(booking.getVehicle());
        review.setDriver(booking.getDriver());
        review.setVehicleRating(request.getVehicleRating());
        review.setDriverRating(booking.getDriver() != null ? request.getDriverRating() : null);
        review.setComment(request.getComment() == null ? null : request.getComment().trim());
        review = reviewRepository.save(review);
        booking.setReview(review);

        refreshRatings(booking.getVehicle(), booking.getDriver());
        return review;
    }

    // Vehicle and driver ratings are the average of their customer reviews
    public void refreshRatings(Vehicle vehicle, Driver driver) {
        refreshVehicleRating(vehicle);
        if (driver != null) {
            refreshDriverRating(driver);
        }
    }

    public void refreshVehicleRating(Vehicle vehicle) {
        Double avg = reviewRepository.averageVehicleRating(vehicle.getId());
        if (avg != null) {
            vehicle.setRating(Math.round(avg * 10) / 10.0);
            vehicleRepository.save(vehicle);
        }
    }

    public void refreshDriverRating(Driver driver) {
        Double avg = reviewRepository.averageDriverRating(driver.getId());
        if (avg != null) {
            driver.setRating(Math.round(avg * 10) / 10.0);
            driverRepository.save(driver);
        }
    }

    public List<Review> forVehicle(Long vehicleId) {
        return reviewRepository.findByVehicleIdOrderByCreatedAtDesc(vehicleId);
    }

    public List<Review> latest() {
        return reviewRepository.findTop20ByOrderByCreatedAtDesc();
    }
}
