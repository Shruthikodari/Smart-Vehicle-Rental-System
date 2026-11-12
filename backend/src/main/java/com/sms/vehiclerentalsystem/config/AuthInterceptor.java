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
 * /admin/** needs an ADMIN account, /driver/** a DRIVER account, and customer endpoints
 * (bookings, profile, notifications, writing reviews) a customer (USER) account.
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
        if (customerArea) {
            requireRole(user, User.Role.USER, "Please log in to continue");
        } else if (uri.startsWith("/admin")) {
            requireRole(user, User.Role.ADMIN, "Please log in as admin");
        } else if (uri.startsWith("/driver")) {
            requireRole(user, User.Role.DRIVER, "Please log in as a driver");
        }
        return true;
    }

    private static void requireRole(Optional<User> user, User.Role role, String loginMessage) {
        if (!user.isPresent()) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, loginMessage);
        }
        if (user.get().getRole() != role) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You don't have access to this page");
        }
    }
}
