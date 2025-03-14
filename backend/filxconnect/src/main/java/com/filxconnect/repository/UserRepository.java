package com.filxconnect.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.filxconnect.entity.User;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Optional<User> findById(UUID id);

    List<User> findByUsernameContainingIgnoreCase(String username);

    // 🔹 Corrected Query for Deactivating Inactive Users (Use nativeQuery = true)
    @Modifying
    @Transactional
    @Query(value = "UPDATE users SET status = 0 WHERE updated_at < NOW() - INTERVAL 5 DAY AND status = 1", nativeQuery = true)
    void deactivateInactiveUsers();
    
    long countByStatus(int status);
}
