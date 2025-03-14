/**
 *
 */
package com.filxconnect.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

//import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.filxconnect.entity.Admin;
import com.filxconnect.repository.AdminRepository;

/**
 *
 */
@Service
public class AdminService {

    public AdminRepository AdminRepository;

    public AdminService(AdminRepository adminRepository) {
        this.AdminRepository = adminRepository;
    }

    public Admin createAdmin(Admin admin) {
        admin.setAupdatedate(LocalDateTime.now());
        return AdminRepository.save(admin);
    }

    // Get all Admins
    public List<Admin> getAllAdmins() {
        return AdminRepository.findAll();
    }

    // Get Admin by ID
    public Optional<Admin> getAdminById(UUID id) {
        return AdminRepository.findById(id);
    }

    // Update Admin
    public Admin updateAdmin(UUID id, Admin adminDetails) throws RuntimeException {
        return AdminRepository.findById(id).map(admin -> {
            admin.setAname(adminDetails.getAname());
            admin.setAemail(adminDetails.getAemail());
            admin.setAprofilepic(adminDetails.getAprofilepic());
            admin.setAupdatedate(LocalDateTime.now());
            return AdminRepository.save(admin);
        }).orElseThrow(() -> new RuntimeException("Admin not found with ID: " + id));
    }

    // Delete Admin
    public void deleteAdmin(UUID id) {
        AdminRepository.deleteById(id);
    }
}
