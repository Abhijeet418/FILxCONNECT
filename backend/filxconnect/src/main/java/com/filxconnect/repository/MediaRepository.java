package com.filxconnect.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.filxconnect.entity.Media;

import java.util.List;
import java.util.UUID;

@Repository
public interface MediaRepository extends JpaRepository<Media, UUID> {

    // ✅ Fetch media by Post ID
    List<Media> findByPostId(UUID postId);
}
