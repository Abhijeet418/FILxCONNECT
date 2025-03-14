package com.filxconnect.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.filxconnect.entity.Comment;
import com.filxconnect.entity.Post;

import java.util.List;
import java.util.UUID;

@Repository
public interface CommentRepository extends JpaRepository<Comment, UUID> {
    List<Comment> findByPost(Post post);  // ✅ Get comments for a post

    long countByPost_Id(UUID postId);
}
