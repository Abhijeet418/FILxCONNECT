package com.filxconnect.service;

import com.filxconnect.entity.Post;
import com.filxconnect.entity.User;
import com.filxconnect.repository.PostRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.filxconnect.dto.PostReportDTO;
import com.filxconnect.dto.UserReportDTO;
import com.filxconnect.entity.Report;
import com.filxconnect.entity.ReportStatus;
import com.filxconnect.repository.ReportRepository;
import com.filxconnect.repository.UserRepository;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;

    public ReportService(ReportRepository reportRepository, UserService userService, UserRepository userRepository, PostRepository postRepository) {
        this.reportRepository = reportRepository;
        this.userRepository = userRepository;
        this.postRepository = postRepository;
    }

    // ✅ Report a User
    public Report reportUser(UserReportDTO userReportDTO) {
        Report report = new Report();
        report.setReporterUserId(userReportDTO.getReporterUserId());
        report.setReportedUserId(userReportDTO.getReportedUserId());
        report.setReason(userReportDTO.getReason());
        reportRepository.save(report);

        User user = userRepository.findById(userReportDTO.getReportedUserId())
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        user.setReports(user.getReports()+1);
        userRepository.save(user);
        return report;
    }

    // ✅ Report a Post
    public Report reportPost(PostReportDTO postReportDTO) {
        Report report = new Report();
        report.setReporterUserId(postReportDTO.getReporterUserId());
        Post post = postRepository.findById(postReportDTO.getReportedPostId())
                .orElseThrow(() -> new EntityNotFoundException("Post not found"));

        report.setReportedUserId(post.getUser().getId());
        report.setReportedPostId(postReportDTO.getReportedPostId());
        report.setReason(postReportDTO.getReason());
        reportRepository.save(report);

        return report;
    }

    // ✅ Get reported users
    public List<Report> getReportedUsers() {
        return reportRepository.findAll().stream()
                .filter(report -> report.getReportedUserId() != null)
                .collect(Collectors.toList());
    }
    
    public long countReportedUsers() {
    	return reportRepository.countDistinctReportedUsers();
    }
    
    public List<Report> getAllReports(){
    	return reportRepository.findAll();
    }

    // ✅ Get reported posts
    public List<Report> getReportedPosts() {
        return reportRepository.findAll().stream()
                .filter(report -> report.getReportedPostId() != null)
                .collect(Collectors.toList());
    }

    // ✅ Update Report Status
    public Integer updateReportStatus(UUID userId, ReportStatus status) {
        List<Report> reports = reportRepository.findByReportedUserId(userId);
        reports.forEach(report -> report.setReportStatus(String.valueOf(status)));
        reportRepository.saveAll(reports);
        return 1;
    }
    public Integer updatePostReportStatus(UUID postId, String status) {
        List<Report> reports = reportRepository.findByReportedPostId(postId);
        
        if (reports.isEmpty()) {
            return 0;
        }

        for (Report report : reports) {
            report.setReportStatus(String.valueOf(ReportStatus.valueOf(status.toUpperCase())));
        }

        reportRepository.saveAll(reports);
        return 1;
    }

    public Integer changeStatus(UUID id, String status) {
        Report report = reportRepository.findById(id).orElseThrow();
        if (status.equals("DISMISSED") && report.getReportedPostId() == null){
            User user = userRepository.findById(report.getReportedUserId()).orElseThrow(() -> new EntityNotFoundException("User not found"));
            user.setReports(user.getReports()-1);
        }
        report.setReportStatus(status);
        reportRepository.save(report);
        return 1;
    }
}
