package com.sms.vehiclerentalsystem.controller;

import com.sms.vehiclerentalsystem.config.AuthInterceptor;
import com.sms.vehiclerentalsystem.dto.ReviewResponse;
import com.sms.vehiclerentalsystem.model.Booking;
import com.sms.vehiclerentalsystem.model.Notification;
import com.sms.vehiclerentalsystem.model.Payment;
import com.sms.vehiclerentalsystem.model.User;
import com.sms.vehiclerentalsystem.repository.ReviewRepository;
import com.sms.vehiclerentalsystem.service.AuthService;
import com.sms.vehiclerentalsystem.service.BookingService;
import com.sms.vehiclerentalsystem.service.NotificationService;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

// Customer dashboard, profile and notifications (logged-in customers only)
@RestController
public class CustomerController {

    private final BookingService bookingService;
    private final NotificationService notificationService;
    private final AuthService authService;
    private final ReviewRepository reviewRepository;

    public CustomerController(BookingService bookingService, NotificationService notificationService,
                              AuthService authService, ReviewRepository reviewRepository) {
        this.reviewRepository = reviewRepository;
        this.bookingService = bookingService;
        this.notificationService = notificationService;
        this.authService = authService;
    }

    @GetMapping("/me/dashboard")
    public Map<String, Object> dashboard(@RequestAttribute(AuthInterceptor.CURRENT_USER) User user) {
        List<Booking> bookings = bookingService.findForUser(user);
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalBookings", bookings.size());
        stats.put("pending", count(bookings, Booking.Status.PENDING));
        stats.put("upcoming", count(bookings, Booking.Status.APPROVED));
        stats.put("ongoing", count(bookings, Booking.Status.ONGOING));
        stats.put("completed", count(bookings, Booking.Status.COMPLETED));
        stats.put("totalSpent", bookings.stream()
                .filter(b -> b.getPayment() != null && b.getPayment().getStatus() == Payment.Status.PAID)
                .mapToDouble(Booking::getTotal).sum());
        stats.put("totalDays", bookings.stream()
                .filter(b -> b.getStatus() == Booking.Status.COMPLETED).mapToInt(Booking::getDays).sum());
        stats.put("unreadNotifications", notificationService.unreadCount(user));
        return stats;
    }

    private static long count(List<Booking> bookings, Booking.Status status) {
        return bookings.stream().filter(b -> b.getStatus() == status).count();
    }

    @GetMapping("/me/profile")
    public User profile(@RequestAttribute(AuthInterceptor.CURRENT_USER) User user) {
        return user;
    }

    @PutMapping("/me/profile")
    public User updateProfile(@RequestAttribute(AuthInterceptor.CURRENT_USER) User user,
                              @RequestBody Map<String, String> body) {
        return authService.updateProfile(user, body.get("name"), body.get("phone"));
    }

    @PutMapping("/me/password")
    public Map<String, String> changePassword(@RequestAttribute(AuthInterceptor.CURRENT_USER) User user,
                                              @RequestBody Map<String, String> body) {
        authService.changePassword(user, body.get("currentPassword"), body.get("newPassword"));
        return Collections.singletonMap("message", "Password updated");
    }

    @GetMapping("/me/reviews")
    public List<ReviewResponse> myReviews(@RequestAttribute(AuthInterceptor.CURRENT_USER) User user) {
        return reviewRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(ReviewResponse::from).collect(Collectors.toList());
    }

    @GetMapping("/notifications")
    public List<Notification> notifications(@RequestAttribute(AuthInterceptor.CURRENT_USER) User user) {
        return notificationService.forUser(user);
    }

    @PutMapping("/notifications/{id}/read")
    public Notification markRead(@PathVariable Long id, @RequestAttribute(AuthInterceptor.CURRENT_USER) User user) {
        return notificationService.markRead(user, id);
    }

    @PutMapping("/notifications/read-all")
    public void markAllRead(@RequestAttribute(AuthInterceptor.CURRENT_USER) User user) {
        notificationService.markAllRead(user);
    }
}
