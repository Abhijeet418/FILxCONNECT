package com.filxconnect.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
public class PostReportDTO {
    private UUID reporterUserId;
    private UUID reportedPostId;
    private String reason;

    // ✅ Explicit Getter Methods (if Lombok is not working)
    public UUID getReporterUserId() { return reporterUserId; }
    public UUID getReportedPostId() { return reportedPostId; }
    public String getReason() { return reason; }

}
