package com.filxconnect.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "reports")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Report {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID reportId;

    private UUID reporterUserId;
    private UUID reportedUserId;
    private UUID reportedPostId;
    private String reason;

    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();  // Auto-set timestamp

    @Column
    private String reportStatus = "PENDING";  // Default to PENDING

    @Builder.Default
    private boolean blockRequestFlag = false;  // Default to false

    // ✅ Explicit Getter Methods (if Lombok fails)
    public UUID getReporterUserId() { return reporterUserId; }
    public UUID getReportedUserId() { return reportedUserId; }
    public UUID getReportedPostId() { return reportedPostId; }
    public String getReason() { return reason; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public String getReportStatus() { return reportStatus; }
    public boolean isBlockRequestFlag() { return blockRequestFlag; }

    // ✅ Explicit Setter Methods (if Lombok fails)
    public void setReporterUserId(UUID reporterUserId) { this.reporterUserId = reporterUserId; }
    public void setReportedUserId(UUID reportedUserId) { this.reportedUserId = reportedUserId; }
    public void setReportedPostId(UUID reportedPostId) { this.reportedPostId = reportedPostId; }
    public void setReason(String reason) { this.reason = reason; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    public void setReportStatus(String reportStatus) { this.reportStatus = reportStatus; }
    public void setBlockRequestFlag(boolean blockRequestFlag) { this.blockRequestFlag = blockRequestFlag; }
}
