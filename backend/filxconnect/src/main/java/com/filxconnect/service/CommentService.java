package com.filxconnect.service;

import com.filxconnect.entity.*;
import com.filxconnect.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import com.filxconnect.repository.CommentRepository;
import com.filxconnect.repository.PostRepository;
import com.filxconnect.repository.UserRepository;

import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.Optional;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;

    public CommentService(CommentRepository commentRepository, PostRepository postRepository, UserRepository userRepository, NotificationRepository notificationRepository) {
        this.commentRepository = commentRepository;
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.notificationRepository = notificationRepository;
    }

    // ✅ Add a comment with validation
    public Comment addComment(UUID postId, UUID userId, String content) {
        // Ensure the post exists before adding a comment
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Error: Post with ID " + postId + " not found."));

        // Ensure the user exists before adding a comment
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Error: User with ID " + userId + " not found."));

        // Create and save the Comment
        Comment comment = new Comment();
        comment.setPost(post);
        comment.setUser(user);
        comment.setContent(content);

        Comment savedComment = commentRepository.save(comment);

        if (user.getEmail().equals(savedComment.getPost().getUser().getEmail())) {
            return savedComment;
        }
        Notification notification = new Notification();
        notification.setUserId(postRepository.findById(postId).orElseThrow().getUser().getId());
        notification.setSender(savedComment.getUser().getUsername());
        notification.setSenderPic(savedComment.getUser().getProfilePicture());
        notification.setMessage("Commented on your post!");
        notification.setPostId(savedComment.getPost().getId());
        notificationRepository.save(notification);
        return savedComment;
    }

    // ✅ Get all comments for a post
    public List<Comment> getCommentsForPost(UUID postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        List<Comment> comments = commentRepository.findByPost(post);
        
        // If there are no comments, return an empty list or an appropriate response
        if (comments.isEmpty()) {
            return Collections.emptyList(); // You can handle this in Controller
        }
        
        return comments;
    }

    public long getCommentsCount(UUID postId) {
        return commentRepository.countByPost_Id(postId);
    }

    // ✅ Delete a comment (only by author or post owner)
    public void deleteComment(UUID commentId, UUID userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("Error: Comment not found"));

        Post post = comment.getPost();
        User commentAuthor = comment.getUser();
        User postOwner = post.getUser();

        // Allow only the post owner or the comment author to delete the comment
        if (postOwner.getId().equals(userId) || commentAuthor.getId().equals(userId)) {
            commentRepository.delete(comment);
        } else {
            throw new RuntimeException("Error: You do not have permission to delete this comment");
        }
    }
}
