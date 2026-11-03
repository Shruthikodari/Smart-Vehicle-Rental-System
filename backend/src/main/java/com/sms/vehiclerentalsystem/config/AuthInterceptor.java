package com.sms.vehiclerentalsystem.config;

import com.sms.vehiclerentalsystem.exception.ApiException;
import com.sms.vehiclerentalsystem.model.User;
import com.sms.vehiclerentalsystem.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.Optional;

/**
 * Reads the "Authorization: Bearer <token>" header and stores the logged-in user on the request.
 * Every /admin/** endpoint requires a token that belongs to an ADMIN account.
 * Customer endpoints (bookings, dashboard, notifications, writing reviews) require any logged-in account.
 */
@Component
public class AuthInterceptor implements HandlerInterceptor {

    public static final String CURRENT_USER = "currentUser";

    private final AuthService authService;

    public AuthInterceptor(AuthService authService) {
        this.authService = authService;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }
        String header = request.getHeader("Authorization");
        String token = header != null && header.startsWith("Bearer ") ? header.substring(7) : null;
        Optional<User> user = authService.findByToken(token);
        user.ifPresent(u -> request.setAttribute(CURRENT_USER, u));

        String uri = request.getRequestURI();
        boolean customerArea = uri.startsWith("/bookings") || uri.startsWith("/notifications") || uri.startsWith("/me")
                || (uri.startsWith("/reviews") && "POST".equalsIgnoreCase(request.getMethod()));
        if (customerArea && !user.isPresent()) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Please log in to continue");
        }

        if (uri.startsWith("/admin")) {
            if (!user.isPresent()) {
                throw new ApiException(HttpStatus.UNAUTHORIZED, "Please log in as admin");
            }
            if (user.get().getRole() != User.Role.ADMIN) {
                throw new ApiException(HttpStatus.FORBIDDEN, "Admin access required");
            }
        }
        return true;
    }
}
