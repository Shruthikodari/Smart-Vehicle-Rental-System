package com.sms.vehiclerentalsystem.repository;

import com.sms.vehiclerentalsystem.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmailIgnoreCase(String email);
    Optional<User> findByToken(String token);
    boolean existsByEmailIgnoreCase(String email);
    List<User> findByRoleOrderByCreatedAtDesc(User.Role role);
}
