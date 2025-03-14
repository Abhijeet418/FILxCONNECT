package com.filxconnect.dto;

import lombok.Getter;
import lombok.Setter;
import java.util.UUID;

@Getter
@Setter
public class NotificationRequest {
    private UUID userId;
    private String message;
    private UUID postId;// ✅ Ensure postId is included

    public UUID getUserId() { return userId; }
    public String getMessage() { return message; }
    public UUID getPostId() { return postId; }  // ✅ Add this method

    public void setUserId(UUID userId) { this.userId = userId; }
    public void setMessage(String message) { this.message = message; }
    public void setPostId(UUID postId) { this.postId = postId; }  // ✅ Add this setter
}
