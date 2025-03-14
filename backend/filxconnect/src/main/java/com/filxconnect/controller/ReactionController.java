package com.filxconnect.controller;

import com.filxconnect.dto.ReactionResponseDTO;
import com.filxconnect.service.ReactionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/reactions")
public class ReactionController {

    private final ReactionService reactionService;

    public ReactionController(ReactionService reactionService) {
        this.reactionService = reactionService;
    }

    // ✅ Like a post (Proper Response Message)
    @PostMapping("/{postId}/{userId}/{emoji}")
    public ResponseEntity<?> reactPost(@PathVariable UUID postId, @PathVariable UUID userId, @PathVariable String emoji) {
        return reactionService.reactPost(postId, userId, emoji);
    }

    // ✅ Get likes for a post
    @GetMapping("/posts/{postId}")
    public ResponseEntity<List<ReactionResponseDTO>> getReactionsByPost(@PathVariable UUID postId) {
        return ResponseEntity.ok(reactionService.getReactionsByPost(postId));
    }

    @GetMapping("/posts/{postId}/count")
    public ResponseEntity<Long> getLikesCount(@PathVariable UUID postId) {
        return ResponseEntity.ok(reactionService.getLikesCount(postId));
    }

    // ✅ Get likes by a user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ReactionResponseDTO>> getReactionsByUser(@PathVariable UUID userId) {
        return ResponseEntity.ok(reactionService.getReactionsByUser(userId));
    }

    // ✅ Unlike a post
    @DeleteMapping("/{postId}/{userId}")
    public ResponseEntity<?> unReactPost(@PathVariable UUID postId, @PathVariable UUID userId) {
        return reactionService.unReactPost(postId, userId);
    }
}
