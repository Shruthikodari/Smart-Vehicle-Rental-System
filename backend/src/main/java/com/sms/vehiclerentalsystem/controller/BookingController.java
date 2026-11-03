package com.sms.vehiclerentalsystem.controller;

import com.sms.vehiclerentalsystem.config.AuthInterceptor;
import com.sms.vehiclerentalsystem.dto.BookingRequest;
import com.sms.vehiclerentalsystem.dto.BookingResponse;
import com.sms.vehiclerentalsystem.model.User;
import com.sms.vehiclerentalsystem.service.BookingService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;

// All routes here require a logged-in customer (see AuthInterceptor)
@RestController
@RequestMapping("/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    // Creates a PENDING booking (with its payment) that waits for admin review
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BookingResponse create(@Valid @RequestBody BookingRequest request,
                                  @RequestAttribute(AuthInterceptor.CURRENT_USER) User user) {
        return BookingResponse.from(bookingService.createBooking(request, user));
    }

    @GetMapping("/my")
    public List<BookingResponse> myBookings(@RequestAttribute(AuthInterceptor.CURRENT_USER) User user) {
        return bookingService.findForUser(user).stream().map(BookingResponse::from).collect(Collectors.toList());
    }

    @GetMapping("/{code}")
    public BookingResponse findByCode(@PathVariable String code,
                                      @RequestAttribute(AuthInterceptor.CURRENT_USER) User user) {
        return BookingResponse.from(bookingService.findOwnByCode(code, user));
    }

    @PutMapping("/{code}/cancel")
    public BookingResponse cancel(@PathVariable String code,
                                  @RequestAttribute(AuthInterceptor.CURRENT_USER) User user) {
        return BookingResponse.from(bookingService.cancelByCustomer(code, user));
    }
}
