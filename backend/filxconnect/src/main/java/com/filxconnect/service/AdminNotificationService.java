package com.filxconnect.service;

import com.filxconnect.entity.AdminNotification;
import com.filxconnect.repository.AdminNotificationRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class AdminNotificationService {

    private final AdminNotificationRepository notificationRepository;

    public AdminNotificationService(AdminNotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    // ✅ Create a new notification
    public AdminNotification createNotification(UUID adminId, String message, UUID postId) {
        AdminNotification notification = new AdminNotification();

        notification.setMessage(message);
        notification.setPostId(postId);
        notification.setRead(false);
        return notificationRepository.save(notification);
    }

    // ✅ Get all notifications for a admin
    public List<AdminNotification> getNotificationsForAdmin() {
        return notificationRepository.findAll();
    }

    // ✅ Mark a single notification as read
    public AdminNotification markAsRead(UUID notificationId) {
        AdminNotification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setRead(true);
        return notificationRepository.save(notification);
    }

    // ✅ Mark all notifications for a admin as read
    public ResponseEntity markAllAsRead() {
        List<AdminNotification> notifications = notificationRepository.findAll();
        for (AdminNotification notification : notifications) {
            notification.setRead(true);
        }
        notificationRepository.saveAll(notifications);
        return null;
    }
}
