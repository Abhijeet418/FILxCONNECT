package com.filxconnect.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.filxconnect.dto.PostReportDTO;
import com.filxconnect.dto.UserReportDTO;
import com.filxconnect.entity.Report;
import com.filxconnect.entity.ReportStatus;
import com.filxconnect.service.ReportService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/reports")
public class ReportController {
    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    // ✅ Report a User
    @PostMapping("/user")
    public ResponseEntity<Report> reportUser(@RequestBody UserReportDTO userReportDTO) {
        return ResponseEntity.ok(reportService.reportUser(userReportDTO));
    }

    // ✅ Report a Post
    @PostMapping("/post")
    public ResponseEntity<Report> reportPost(@RequestBody PostReportDTO postReportDTO) {
        return ResponseEntity.ok(reportService.reportPost(postReportDTO));
    }
    
    @GetMapping("/total/users")
    public ResponseEntity<Long> getNumberOfReportedUsers(){
    	return ResponseEntity.ok(reportService.countReportedUsers());
    }

    // ✅ Get Reported Users
    @GetMapping("/users")
    public ResponseEntity<List<Report>> getReportedUsers() {
        return ResponseEntity.ok(reportService.getReportedUsers());
    }

    // ✅ Get Reported Posts
    @GetMapping("/posts")
    public ResponseEntity<List<Report>> getReportedPosts() {
        return ResponseEntity.ok(reportService.getReportedPosts());
    }
    
    @GetMapping
    public ResponseEntity<List<Report>> getAllReports() {
        return ResponseEntity.ok(reportService.getAllReports());
    }

    // ✅ Update Report Status
    @PutMapping("/user/{userId}/status")
    public ResponseEntity<Integer> updateReportStatus(@PathVariable UUID userId, @RequestParam ReportStatus status) {
        return ResponseEntity.ok(reportService.updateReportStatus(userId, status));
    }
    @PutMapping("/post/{postId}/status")
    public ResponseEntity<?> updatePostReportStatus(@PathVariable UUID postId, @RequestParam ReportStatus status) {
        return ResponseEntity.ok(reportService.updateReportStatus(postId, status));
    }

    @PutMapping("/changeStatus/{id}/{status}")
    public ResponseEntity<Integer> changeReportStatus(@PathVariable UUID id, @PathVariable String status) {
        return ResponseEntity.ok(reportService.changeStatus(id, status));
    }
}
