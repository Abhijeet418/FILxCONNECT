package com.filxconnect.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
public class UserReportDTO {
    private UUID reporterUserId;
    private UUID reportedUserId;
    private String reason;

    // ✅ Explicit Getter Methods (if Lombok is not working)
    public UUID getReporterUserId() { return reporterUserId; }
    public UUID getReportedUserId() { return reportedUserId; }
    public String getReason() { return reason; }
}
