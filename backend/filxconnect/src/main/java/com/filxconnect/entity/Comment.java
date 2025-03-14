package com.filxconnect.entity;

import jakarta.persistence.*;
import java.sql.Timestamp;
import java.util.UUID;

@Entity
@Table(name = "comments")
public class Comment {

    @Id
    @GeneratedValue
    @Column(name = "id", columnDefinition = "BINARY(16)")
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "post_id", nullable = false)  // ✅ Link to Post entity
    private Post post;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)  // ✅ Link to User entity
    private User user;

    @Column(name = "content", nullable = false)
    private String content;

    @Column(name = "created_at", updatable = false, insertable = false, 
            columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private Timestamp createdAt;

    // ✅ Getters and Setters
    public UUID getId() { return id; }
    public Post getPost() { return post; }
    public User getUser() { return user; }
    public String getContent() { return content; }
    public Timestamp getCreatedAt() { return createdAt; }

    public void setPost(Post post) { this.post = post; }
    public void setUser(User user) { this.user = user; }
    public void setContent(String content) { this.content = content; }
}
