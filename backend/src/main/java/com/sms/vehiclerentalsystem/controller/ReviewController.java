package com.sms.vehiclerentalsystem.controller;

import com.sms.vehiclerentalsystem.config.AuthInterceptor;
import com.sms.vehiclerentalsystem.dto.ReviewRequest;
import com.sms.vehiclerentalsystem.dto.ReviewResponse;
import com.sms.vehiclerentalsystem.model.User;
import com.sms.vehiclerentalsystem.service.ReviewService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;

@RestController
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping("/reviews")
    @ResponseStatus(HttpStatus.CREATED)
    public ReviewResponse create(@Valid @RequestBody ReviewRequest request,
                                 @RequestAttribute(AuthInterceptor.CURRENT_USER) User user) {
        return ReviewResponse.from(reviewService.create(request, user));
    }

    @GetMapping("/vehicles/{id}/reviews")
    public List<ReviewResponse> forVehicle(@PathVariable Long id) {
        return reviewService.forVehicle(id).stream().map(ReviewResponse::from).collect(Collectors.toList());
    }

    @GetMapping("/admin/reviews")
    public List<ReviewResponse> latest() {
        return reviewService.latest().stream().map(ReviewResponse::from).collect(Collectors.toList());
    }
}
