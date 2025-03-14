package com.filxconnect.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import com.filxconnect.entity.Reaction;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor // ✅ Ensure all fields are properly initialized
@JsonInclude(JsonInclude.Include.NON_NULL) // ✅ Prevents null values in response

public class ReactionResponseDTO {
    private UUID id;
    private UUID postId;
    private UUID userId;
    private String emoji;
    private String username;
    private LocalDateTime createdAt;

    public UUID getId() { return id; }
    public UUID getPostId() { return postId; }
    public UUID getUserId() { return userId; }
    public String getUsername() { return username; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public String getEmoji() { return emoji; }


    // ✅ Constructor
    public ReactionResponseDTO(UUID id, UUID postId, UUID userId, LocalDateTime createdAt, String username,String emoji) {
        this.id = id;
        this.postId = postId;
        this.userId = userId;
        this.emoji = emoji;
        this.createdAt = createdAt;
        this.username = username;
    }

    // ✅ Constructor to map `Reaction` entity
    public ReactionResponseDTO(Reaction reaction, String username) {
        this.id = reaction.getId();
        this.postId = reaction.getPostId();
        this.userId = reaction.getUserId();
        this.username = username;
        this.emoji = reaction.getEmoji();
        this.createdAt = reaction.getCreatedAt();
    }
    // ✅ Constructor that takes `Reaction` entity
    public ReactionResponseDTO(Reaction reaction) {
        this.id = reaction.getId();
        this.postId = reaction.getPostId();
        this.userId = reaction.getUserId();
        this.emoji = reaction.getEmoji();
        this.createdAt = reaction.getCreatedAt();
    }
}
