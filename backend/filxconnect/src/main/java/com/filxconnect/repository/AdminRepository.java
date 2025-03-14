/**
 *
 */
package com.filxconnect.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.filxconnect.entity.*;
/**
 *
 */
@Repository
public interface AdminRepository extends JpaRepository<Admin, UUID>{
	Optional<Admin> findByAname(String username);
    Optional<Admin> findByAemail(String email);
    Optional<Admin> findById(UUID id);
}
