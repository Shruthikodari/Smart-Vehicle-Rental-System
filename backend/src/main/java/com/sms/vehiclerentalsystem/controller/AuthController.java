package com.sms.vehiclerentalsystem.controller;

import com.sms.vehiclerentalsystem.config.AuthInterceptor;
import com.sms.vehiclerentalsystem.dto.NewDriverRequest;
import com.sms.vehiclerentalsystem.dto.RegisterRequest;
import com.sms.vehiclerentalsystem.exception.ApiException;
import com.sms.vehiclerentalsystem.model.User;
import com.sms.vehiclerentalsystem.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@Valid @RequestBody RegisterRequest request) {
        User user = authService.register(request);
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("message", "Registration successful");
        body.put("data", user);
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @PostMapping("/register/driver")
    public ResponseEntity<Map<String, Object>> registerDriver(@Valid @RequestBody NewDriverRequest request) {
        authService.registerDriver(request);
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("message", "Registration received. You can log in once an admin approves your account.");
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @PostMapping("/login/user")
    public Map<String, Object> loginUser(@RequestBody Map<String, String> credentials) {
        return session(authService.login(credentials.get("email"), credentials.get("password"), User.Role.USER));
    }

    @PostMapping("/login/admin")
    public Map<String, Object> loginAdmin(@RequestBody Map<String, String> credentials) {
        return session(authService.login(credentials.get("email"), credentials.get("password"), User.Role.ADMIN));
    }

    @PostMapping("/login/driver")
    public Map<String, Object> loginDriver(@RequestBody Map<String, String> credentials) {
        return session(authService.login(credentials.get("email"), credentials.get("password"), User.Role.DRIVER));
    }

    @GetMapping("/me")
    public User me(@RequestAttribute(name = AuthInterceptor.CURRENT_USER, required = false) User user) {
        if (user == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Not logged in");
        }
        return user;
    }

    @PostMapping("/logout")
    public Map<String, Object> logout(@RequestAttribute(name = AuthInterceptor.CURRENT_USER, required = false) User user) {
        if (user != null) {
            authService.logout(user);
        }
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("message", "Logged out");
        return body;
    }

    private static Map<String, Object> session(User user) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("token", user.getToken());
        body.put("data", user);
        return body;
    }
}
