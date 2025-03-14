package com.filxconnect.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;
import java.util.UUID;

import com.filxconnect.entity.Report;
import com.filxconnect.entity.ReportStatus;

@Getter
@Setter
@NoArgsConstructor
public class ReportDTO {
    private UUID reporterUserId;
    private UUID reportedUserId;
    private UUID reportedPostId;
    private String reason;
    private LocalDateTime timestamp;
    private ReportStatus reportStatus;
    private boolean blockRequestFlag;
  

    // ✅ Explicit Getter Methods (if Lombok is not working)
    public UUID getReporterUserId() { return reporterUserId; }
    public UUID getReportedUserId() { return reportedUserId; }
    public UUID getReportedPostId() { return reportedPostId; }
    public String getReason() { return reason; }
  
    
    
    
    public boolean isUserReport() {
        return reportedUserId != null && reportedPostId == null;
    }

    public boolean isPostReport() {
        return reportedUserId == null && reportedPostId != null;
    }

    public ReportDTO(Report report) {
        this.reporterUserId = report.getReporterUserId();
        this.reportedUserId = report.getReportedUserId();
        this.reportedPostId = report.getReportedPostId();
        this.reason = report.getReason();
        this.timestamp = report.getTimestamp();
        this.reportStatus = ReportStatus.valueOf(report.getReportStatus());
        this.blockRequestFlag = report.isBlockRequestFlag();
    }
   
}
