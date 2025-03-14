package com.filxconnect;  // ✅ Ensure this matches your folder structure

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.boot.autoconfigure.domain.EntityScan;

@SpringBootApplication
@EntityScan("com.filxconnect.entity")  // ✅ Ensure correct entity package
@EnableJpaRepositories("com.filxconnect.repository")  // ✅ Ensure correct repository package
public class FilxConnectApplication {
    public static void main(String[] args) {
        SpringApplication.run(FilxConnectApplication.class, args);
    }
}
