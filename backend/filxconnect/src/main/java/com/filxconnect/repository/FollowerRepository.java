package com.filxconnect.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.filxconnect.entity.Follower;

import jakarta.transaction.Transactional;

import java.util.List;
import java.util.UUID;

@Repository
public interface FollowerRepository extends JpaRepository<Follower, UUID> {

    List<Follower> findByFollowerId(UUID followerId); // Get users that a user is following
    List<Follower> findByFollowingId(UUID followingId); // Get users following a particular user
    long countByFollowerId(UUID followerId);
    long countByFollowingId(UUID followingId);

   // void deleteByFollowerIdAndFollowingId(UUID followerId, UUID followingId); // Unfollow a user
    
    @Modifying
    @Transactional // ✅ Wraps delete operation in a transaction
    @Query("DELETE FROM Follower f WHERE f.followerId = :followerId AND f.followingId = :followingId")
    void deleteByFollowerIdAndFollowingId(@Param("followerId") UUID followerId, @Param("followingId") UUID followingId);

}
