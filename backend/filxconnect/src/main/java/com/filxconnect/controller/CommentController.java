package com.filxconnect.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.filxconnect.entity.Comment;
import com.filxconnect.service.CommentService;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    // ✅ Add a Comment
    @PostMapping
    public ResponseEntity<?> addComment(@RequestParam UUID postId, @RequestParam UUID userId, @RequestParam String content) {
        try {
            Comment comment = commentService.addComment(postId, userId, content);
            return ResponseEntity.status(HttpStatus.CREATED).body(comment);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    // ✅ Get Comments for a Post
    @GetMapping("/{postId}")
    public ResponseEntity<?> getCommentsForPost(@PathVariable UUID postId) {
        List<Comment> comments = commentService.getCommentsForPost(postId);
        
        if (comments.isEmpty()) {
            return ResponseEntity.ok(Collections.singletonMap("message", "No comments on this post"));
        }
        
        return ResponseEntity.ok(comments);
    }

    @GetMapping("/{postId}/count")
    public ResponseEntity<Long> getCommentsCount(@PathVariable UUID postId) {
        return ResponseEntity.ok(commentService.getCommentsCount(postId));
    }

    // ✅ Delete a Comment (only allowed for post owner or comment author)
    @DeleteMapping("/{commentId}")
    public ResponseEntity<?> deleteComment(@PathVariable UUID commentId, @RequestParam UUID userId) {
        try {
            commentService.deleteComment(commentId, userId);
            return ResponseEntity.ok("Comment deleted successfully.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }
}
