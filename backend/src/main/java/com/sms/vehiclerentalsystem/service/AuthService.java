package com.sms.vehiclerentalsystem.service;

import com.sms.vehiclerentalsystem.dto.NewDriverRequest;
import com.sms.vehiclerentalsystem.dto.RegisterRequest;
import com.sms.vehiclerentalsystem.exception.ApiException;
import com.sms.vehiclerentalsystem.model.Driver;
import com.sms.vehiclerentalsystem.model.Notification;
import com.sms.vehiclerentalsystem.model.User;
import com.sms.vehiclerentalsystem.repository.DriverRepository;
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
    private final DriverRepository driverRepository;
    private final NotificationService notificationService;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AuthService(UserRepository userRepository, DriverRepository driverRepository,
                       NotificationService notificationService) {
        this.userRepository = userRepository;
        this.driverRepository = driverRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public User register(RegisterRequest request) {
        return createAccount(request.getName(), request.getEmail(), request.getPhone(), request.getPassword(), User.Role.USER);
    }

    // Drivers sign up themselves; the account stays inactive until an admin approves it
    @Transactional
    public Driver registerDriver(NewDriverRequest request) {
        User account = createAccount(request.getName(), request.getEmail(), request.getPhone(),
                request.getPassword(), User.Role.DRIVER);
        account.setActive(false);
        Driver driver = new Driver(account.getName(), request.getPhone(), account.getEmail(), request.getLicenseNumber(), 5.0, 0);
        driver.setStatus(Driver.Status.PENDING);
        driver.setAccount(account);
        driver = driverRepository.save(driver);
        notificationService.notifyAdmins(Notification.Type.INFO, "New driver registration",
                driver.getName() + " (" + driver.getPhone() + ", licence " + driver.getLicenseNumber()
                        + ") registered as a driver and is waiting for approval.", null);
        return driver;
    }

    @Transactional
    public User createAccount(String name, String email, String phone, String password, User.Role role) {
        if (userRepository.existsByEmailIgnoreCase(email.trim())) {
            throw new ApiException(HttpStatus.CONFLICT, "Email is already registered");
        }
        if (password == null || password.length() < 6) {
            throw ApiException.badRequest("Password must be at least 6 characters");
        }
        User user = new User();
        user.setName(name.trim());
        user.setEmail(email.trim().toLowerCase());
        user.setPhone(phone);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setRole(role);
        return userRepository.save(user);
    }

    // Verifies credentials for the given portal (customer, admin or driver) and issues a fresh session token
    @Transactional
    public User login(String email, String password, User.Role requiredRole) {
        User user = userRepository.findByEmailIgnoreCase(email == null ? "" : email.trim())
                .filter(u -> passwordEncoder.matches(password == null ? "" : password, u.getPasswordHash()))
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));
        if (user.getRole() != requiredRole) {
            throw new ApiException(HttpStatus.FORBIDDEN, wrongPortalMessage(user.getRole()));
        }
        if (!user.isActive()) {
            boolean pendingDriver = user.getRole() == User.Role.DRIVER && driverRepository.findByAccountId(user.getId())
                    .map(d -> d.getStatus() == Driver.Status.PENDING).orElse(false);
            throw new ApiException(HttpStatus.FORBIDDEN, pendingDriver
                    ? "Your registration is waiting for admin approval. You can log in once it is approved."
                    : "This account has been blocked. Please contact SmartRide support.");
        }
        user.setToken(UUID.randomUUID().toString());
        return userRepository.save(user);
    }

    private static String wrongPortalMessage(User.Role actualRole) {
        switch (actualRole) {
            case ADMIN: return "This is an admin account. Please use the staff login.";
            case DRIVER: return "This is a driver account. Please use the driver login.";
            default: return "This is a customer account. Please use the customer login.";
        }
    }

    public Optional<User> findByToken(String token) {
        if (token == null || token.isEmpty()) {
            return Optional.empty();
        }
        return userRepository.findByToken(token).filter(User::isActive);
    }

    @Transactional
    public void logout(User user) {
        user.setToken(null);
        userRepository.save(user);
    }

    @Transactional
    public User updateProfile(User user, String name, String phone) {
        if (name == null || name.trim().isEmpty()) {
            throw ApiException.badRequest("Name is required");
        }
        if (phone == null || !phone.trim().matches("\\d{10}")) {
            throw ApiException.badRequest("Please enter a 10-digit mobile number");
        }
        user.setName(name.trim());
        user.setPhone(phone.trim());
        return userRepository.save(user);
    }

    @Transactional
    public void changePassword(User user, String currentPassword, String newPassword) {
        if (currentPassword == null || !passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw ApiException.badRequest("Current password is incorrect");
        }
        if (newPassword == null || newPassword.length() < 6) {
            throw ApiException.badRequest("New password must be at least 6 characters");
        }
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    // Block or unblock an account; blocking also ends its current session
    @Transactional
    public User setActive(User user, boolean active) {
        user.setActive(active);
        if (!active) {
            user.setToken(null);
        }
        return userRepository.save(user);
    }

    public String hash(String rawPassword) {
        return passwordEncoder.encode(rawPassword);
    }
}
