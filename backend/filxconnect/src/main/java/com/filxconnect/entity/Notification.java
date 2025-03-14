package com.filxconnect.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;

import java.sql.Timestamp;
import java.util.UUID;

@Data
@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue
    @Column(name = "id", columnDefinition = "BINARY(16)")
    private UUID id;

    @Column(nullable = false)
    private UUID userId;

    @Column
    private String sender;

    @Column(name = "sender_pic")
    private String senderPic;

    @Column
    private UUID postId; // ✅ Linked to post

    @Column(name = "message", nullable = false)
    private String message;

    @Column(name = "is_read", nullable = false)
    private boolean isRead = false;

    @Column(name = "created_at", updatable = false, insertable = false,
            columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private Timestamp createdAt;

    // ✅ Getters
    public UUID getId() { return id; }
    public UUID getUserId() { return userId; }
    public UUID getPostId() { return postId; }
    public String getMessage() { return message; }
    public boolean isRead() { return isRead; }
    public String getSender() { return sender; }

    // ✅ Setters
    public void setUserId(UUID userId) { this.userId = userId; }
    public void setPostId(UUID postId) { this.postId = postId; }
    public void setMessage(String message) { this.message = message; }
    public void setRead(boolean read) { this.isRead = read; }
    public void setSender(String sender) { this.sender = sender; }
}
