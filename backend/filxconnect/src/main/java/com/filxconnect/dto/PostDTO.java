package com.filxconnect.dto;

import lombok.Getter;
import lombok.Setter;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
public class PostDTO {
    private UUID userId;
    private String title;
    private String content;
    private String caption;
    private char status;
    private List<String> mediaUrls;  // ✅ Ensure this field exists

    // ✅ Explicit Getters (Fix undefined method issue)
    public UUID getUserId() {
        return userId;
    }

    public String getTitle() {
        return title;
    }

    public String getContent() {
        return content;
    }

    public String getCaption() {
        return caption;
    }

    public List<String> getMediaUrls() {
        return mediaUrls;
    }
    public char getStatus() {
    	return status;
    }
}
