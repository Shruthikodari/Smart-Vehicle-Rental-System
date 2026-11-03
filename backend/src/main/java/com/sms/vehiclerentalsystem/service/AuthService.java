package com.sms.vehiclerentalsystem.service;

import com.sms.vehiclerentalsystem.dto.RegisterRequest;
import com.sms.vehiclerentalsystem.exception.ApiException;
import com.sms.vehiclerentalsystem.model.User;
import com.sms.vehiclerentalsystem.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional
    public User register(RegisterRequest request) {
        if (userRepository.existsByEmailIgnoreCase(request.getEmail())) {
            throw new ApiException(HttpStatus.CONFLICT, "Email is already registered");
        }
        User user = new User();
        user.setName(request.getName().trim());
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setPhone(request.getPhone());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(User.Role.USER);
        return userRepository.save(user);
    }

    // Verifies credentials and issues a fresh session token
    @Transactional
    public User login(String email, String password, User.Role requiredRole) {
        User user = userRepository.findByEmailIgnoreCase(email == null ? "" : email.trim())
                .filter(u -> passwordEncoder.matches(password == null ? "" : password, u.getPasswordHash()))
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));
        if (requiredRole == User.Role.ADMIN && user.getRole() != User.Role.ADMIN) {
            throw new ApiException(HttpStatus.FORBIDDEN, "This account does not have admin access");
        }
        user.setToken(UUID.randomUUID().toString());
        return userRepository.save(user);
    }

    public Optional<User> findByToken(String token) {
        if (token == null || token.isEmpty()) {
            return Optional.empty();
        }
        return userRepository.findByToken(token);
    }

    @Transactional
    public void logout(User user) {
        user.setToken(null);
        userRepository.save(user);
    }

    public String hash(String rawPassword) {
        return passwordEncoder.encode(rawPassword);
    }
}
