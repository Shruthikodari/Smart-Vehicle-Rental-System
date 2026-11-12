package com.sms.vehiclerentalsystem.service;

import com.sms.vehiclerentalsystem.exception.ApiException;
import com.sms.vehiclerentalsystem.model.Notification;
import com.sms.vehiclerentalsystem.model.User;
import com.sms.vehiclerentalsystem.repository.NotificationRepository;
import com.sms.vehiclerentalsystem.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    // Sends the same notification to every admin account
    public void notifyAdmins(Notification.Type type, String title, String message, String bookingCode) {
        userRepository.findByRoleOrderByCreatedAtDesc(User.Role.ADMIN)
                .forEach(admin -> notify(admin, type, title, message, bookingCode));
    }

    public void notify(User user, Notification.Type type, String title, String message, String bookingCode) {
        if (user == null) {
            return;
        }
        notificationRepository.save(new Notification(user, type, title, message, bookingCode));
    }

    public List<Notification> forUser(User user) {
        return notificationRepository.findTop30ByUserIdOrderByCreatedAtDesc(user.getId());
    }

    public long unreadCount(User user) {
        return notificationRepository.countByUserIdAndReadFalse(user.getId());
    }

    @Transactional
    public Notification markRead(User user, Long id) {
        Notification n = notificationRepository.findById(id).orElseThrow(() -> ApiException.notFound("Notification"));
        if (!n.getUser().getId().equals(user.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Not your notification");
        }
        n.setRead(true);
        return notificationRepository.save(n);
    }

    @Transactional
    public void markAllRead(User user) {
        List<Notification> unread = notificationRepository.findByUserIdAndReadFalse(user.getId());
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }
}
