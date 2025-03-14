package com.filxconnect.scheduler;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.filxconnect.repository.UserRepository;

@Service
public class InactiveUserScheduler {

    private final UserRepository userRepository;

    public InactiveUserScheduler(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Scheduled(cron = "0 0 0 * * ?") // Runs every midnight
    @Transactional
    public void updateInactiveUsersStatus() {
        userRepository.deactivateInactiveUsers();
        System.out.println("✅ Inactive users updated successfully!");
    }
}
