package com.filxconnect.service;

import com.filxconnect.entity.AdminNotification;
import com.filxconnect.entity.Notification;
import com.filxconnect.repository.AdminNotificationRepository;
import com.filxconnect.repository.NotificationRepository;
import com.sun.nio.sctp.Association;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.filxconnect.entity.User;
import com.filxconnect.repository.UserRepository;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final NotificationRepository notificationRepository;
    private final AdminNotificationRepository adminNotificationRepository;

    @Autowired
    public UserService(UserRepository userRepository, NotificationService notificationService, NotificationRepository notificationRepository, AdminNotificationRepository adminNotificationRepository) {
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.notificationRepository = notificationRepository;
        this.adminNotificationRepository = adminNotificationRepository;
    }

 // Create user and set default active status
    public User createUser(User user) {
        user.setUpdatedAt(LocalDateTime.now());
        user.setStatus(3); // Pending by default
        user.setReports(0); // 0 Reports by default

        AdminNotification adminNotification = new AdminNotification();
        adminNotification.setSender(user.getUsername());
        adminNotification.setSenderPic(user.getProfilePicture());
        adminNotification.setMessage("New user created!");
        adminNotificationRepository.save(adminNotification);

        return userRepository.save(user);
    }

    // Get all users
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // Search Users
    public List<User> searchUsers(String query) {
        return userRepository.findByUsernameContainingIgnoreCase(query);
    }

    // Number of Users
    public long numberOfUsers() {
    	return userRepository.count();
    }
    
    // Number of Active Users
    public long numberOfActiveUsers() {
    	return userRepository.countByStatus(1);
    }

    // Get user by ID
    public Optional<User> getUserById(UUID id) {
        return userRepository.findById(id);
    }

    // Get user by Email
    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }
    // Update user
    public User updateUser(UUID id, User userDetails) {
        return userRepository.findById(id).map(user -> {
            user.setUsername(userDetails.getUsername());
//            user.setEmail(userDetails.getEmail());
            user.setBio(userDetails.getBio());
//            user.setProfilePicture(userDetails.getProfilePicture());
            user.setUpdatedAt(LocalDateTime.now()); // ✅ Now it works!
            return userRepository.save(user);
        }).orElseThrow(() -> new RuntimeException("User not found with ID: " + id));
    }

    public User updateProfilePicture(UUID id, String profilePicture) {
        return userRepository.findById(id).map(user -> {
            user.setProfilePicture(profilePicture);
            user.setUpdatedAt(LocalDateTime.now());
            return userRepository.save(user);
        }).orElseThrow(() -> new RuntimeException("User not found with ID: " + id));
    }

    // Approve User Registration
    public User approveUser(UUID id) {
        Notification notification = new Notification();
        notification.setUserId(id);
        notification.setSender("Admin");
        notification.setMessage("Your account has been approved.");
        notification.setPostId(null);
        notification.setCreatedAt(Timestamp.valueOf(LocalDateTime.now()));
        notification.setRead(false);
        notificationRepository.save(notification);

        return userRepository.findById(id).map(user -> {
            user.setStatus(1); // Rejected
            user.setUpdatedAt(LocalDateTime.now());
            return userRepository.save(user);
        }).orElseThrow(() -> new RuntimeException("User not found with ID: " + id));
    }
    
 // Reject User Registration
    public User rejectUser(UUID id) {
        return userRepository.findById(id).map(user -> {
            user.setStatus(0); // Rejected
            user.setUpdatedAt(LocalDateTime.now());
            return userRepository.save(user);
        }).orElseThrow(() -> new RuntimeException("User not found with ID: " + id));
    }

    // Delete user
    public void deleteUser(UUID id) {
        userRepository.deleteById(id);
    }
}
