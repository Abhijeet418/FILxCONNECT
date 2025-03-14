package com.filxconnect.service;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.filxconnect.entity.Notification;
import com.filxconnect.repository.NotificationRepository;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;
import java.util.UUID;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public Notification warnPost(@PathVariable UUID id) {
        Notification notification = new Notification();
        notification.setUserId(id);
        notification.setSender("Admin");
        notification.setMessage("Your post has been taken down!");
        return notificationRepository.save(notification);
    }

    // ✅ Create a new notification
    public Notification createNotification(UUID userId, String message, UUID postId) {
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setMessage(message);
        notification.setPostId(postId);
        notification.setRead(false);
        return notificationRepository.save(notification);
    }

    public Notification sendWarning(UUID userId) {
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setSender("Admin");
        notification.setMessage("Warning! You have been reported!");
        notification.setRead(false);
        return notificationRepository.save(notification);
    }

    // ✅ Get all notifications for a user
    public List<Notification> getNotificationsForUser(UUID userId) {
        return notificationRepository.findByUserId(userId);
    }

    // ✅ Mark a single notification as read
    public Notification markAsRead(UUID notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setRead(true);
        return notificationRepository.save(notification);
    }

    // ✅ Mark all notifications for a user as read
    public ResponseEntity markAllAsRead(UUID userId) {
        List<Notification> notifications = notificationRepository.findByUserId(userId);
        for (Notification notification : notifications) {
            notification.setRead(true);
        }
        notificationRepository.saveAll(notifications);
        return null;
    }
}
