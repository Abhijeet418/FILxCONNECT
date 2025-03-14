package com.filxconnect.controller;


import com.filxconnect.entity.AdminNotification;
import com.filxconnect.service.AdminNotificationService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/adminNotif")
public class AdminNotificationController {

    private final AdminNotificationService adminNotificationService;

    public AdminNotificationController(AdminNotificationService adminNotificationService) {
        this.adminNotificationService = adminNotificationService;
    }

    @GetMapping("/all")
    public List<AdminNotification> getAll() {
        return adminNotificationService.getNotificationsForAdmin();
    }
}
