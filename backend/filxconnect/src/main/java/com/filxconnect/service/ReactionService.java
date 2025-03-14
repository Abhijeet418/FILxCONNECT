package com.filxconnect.service;

import com.filxconnect.dto.ReactionResponseDTO;
import com.filxconnect.entity.Notification;
import com.filxconnect.entity.Reaction;
import com.filxconnect.repository.NotificationRepository;
import com.filxconnect.repository.ReactionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.filxconnect.dto.ApiResponse;
import com.filxconnect.entity.User;
import com.filxconnect.repository.PostRepository;
import com.filxconnect.repository.UserRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class ReactionService {

    private final ReactionRepository reactionRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;

    private static final Logger logger = LoggerFactory.getLogger(ReactionService.class);


    public ReactionService(ReactionRepository reactionRepository, PostRepository postRepository, UserRepository userRepository, NotificationRepository notificationRepository) {
        this.reactionRepository = reactionRepository;
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.notificationRepository = notificationRepository;
    }

    // ✅ React on a Post
    public ResponseEntity<?> reactPost(UUID postId, UUID userId, String emoji) {
        if (!postRepository.existsById(postId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new ApiResponse(false, "🚨 ERROR: Post not found with ID: " + postId));
        }
        if (!userRepository.existsById(userId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new ApiResponse(false, "🚨 ERROR: User not found with ID: " + userId));
        }

        // ✅ Check if user already liked the post
        Optional<Reaction> existingReaction = reactionRepository.findByUserIdAndPostId(userId, postId);
        if (existingReaction.isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    new ApiResponse(false, "🚨 ERROR: User already liked this post"));
        }

        // ✅ Create and save like
        Reaction reaction = new Reaction(postId, userId, emoji);
        reaction = reactionRepository.save(reaction);
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getEmail().equals(postRepository.findById(postId).orElseThrow().getUser().getEmail())) {
            return ResponseEntity.ok(new ApiResponse(true, "✅ Success: Post liked!", new ReactionResponseDTO(reaction)));
        }
        Notification notification = new Notification();
        notification.setPostId(postId);
        notification.setUserId(postRepository.findById(postId).orElseThrow().getUser().getId());
        notification.setSender(userRepository.findById(userId).orElseThrow().getUsername());
        notification.setMessage("liked your post!");
        notification.setSenderPic(userRepository.findById(userId).orElseThrow().getProfilePicture());
        notificationRepository.save(notification);

        return ResponseEntity.ok(new ApiResponse(true, "✅ Success: Post liked!", new ReactionResponseDTO(reaction)));
    }

    // ✅ Unreact on a Post
    public ResponseEntity<?> unReactPost(UUID postId, UUID userId) {
        Optional<Reaction> existingReaction = reactionRepository.findByUserIdAndPostId(userId, postId);
        if (existingReaction.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new ApiResponse(false, "🚨 ERROR: User has not liked this post"));
        }

        reactionRepository.delete(existingReaction.get());
        return ResponseEntity.ok(new ApiResponse(true, "✅ Success: Post unliked!"));
    }

    public List<ReactionResponseDTO> getReactionsByPost(UUID postId) {
        List<ReactionResponseDTO> reactions = reactionRepository.findByPostId(postId).stream()
                .map(rct -> {
                    String username = userRepository.findById(rct.getUserId())
                            .map(User::getUsername)
                            .orElse("Unknown User");
                    return new ReactionResponseDTO(rct, username);
                })
                .collect(Collectors.toList());

        logger.info("Fetched Likes for Post ID {}: {}", postId, reactions); // ✅ Log response
        return reactions;
    }


    public List<ReactionResponseDTO> getReactionsByUser(UUID userId) {
        return reactionRepository.findByUserId(userId).stream()
                .map(rct -> {
                    String username = userRepository.findById(rct.getUserId())
                            .map(User::getUsername)
                            .orElse("Unknown User"); // ✅ Ensure valid username
                    return new ReactionResponseDTO(rct, username);
                })
                .collect(Collectors.toList());
    }

    public long getLikesCount(UUID postId) {
        return reactionRepository.countByPostId(postId);
    }

}
