package com.filxconnect.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.filxconnect.entity.Post;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PostRepository extends JpaRepository<Post, UUID> {
	
	long countByStatus(char status);
    long countByUser_Id(UUID id);


	List<Post> findByStatus(char status);

    // Corrected Query: Ensure `p.user.id` is used instead of `userId`
    @Query("SELECT p FROM Post p WHERE p.user.id = :userId")
    List<Post> findByUserId(@Param("userId") UUID userId);
}
