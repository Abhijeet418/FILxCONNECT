package com.filxconnect.repository;

import com.filxconnect.entity.Reaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReactionRepository extends JpaRepository<Reaction, UUID> {

    // ✅ Corrected Query (UUID instead of byte[])
    @Query("SELECT l FROM Reaction l WHERE l.userId = :userId AND l.postId = :postId")
    Optional<Reaction> findByUserIdAndPostId(@Param("userId") UUID userId, @Param("postId") UUID postId);

    boolean existsByUserIdAndPostId(UUID userId, UUID postId);
    long countByPostId(UUID postId);
    long countByPostIdAndEmoji(UUID postId, String emoji);

    List<Reaction> findByPostId(UUID postId);
    List<Reaction> findByUserId(UUID userId);
}
