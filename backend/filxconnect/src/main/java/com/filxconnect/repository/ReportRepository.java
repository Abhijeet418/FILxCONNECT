package com.filxconnect.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.filxconnect.entity.Report;

import java.util.List;
import java.util.UUID;

@Repository
public interface ReportRepository extends JpaRepository<Report, UUID> {
    List<Report> findByReportedUserId(UUID reportedUserId);
    List<Report> findByReportedPostId(UUID reportedPostId);
    
    @Query("SELECT COUNT(DISTINCT r.reportedUserId) FROM Report r")
    long countDistinctReportedUsers();
    
}
