package com.dhanvantari.backend.config;

import com.dhanvantari.backend.entity.User;
import com.dhanvantari.backend.entity.UserRole;
import com.dhanvantari.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
@Order(2)
public class AdminSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        log.info("Checking if an admin account exists...");

        java.util.Optional<User> adminOpt = userRepository.findByEmail("admin@dhanvantari.com");
        
        // Fallback: search for any user with ROLE_ADMIN if not found by email
        if (adminOpt.isEmpty()) {
            adminOpt = userRepository.findAll().stream()
                    .filter(u -> u.getRole() == UserRole.ROLE_ADMIN)
                    .findFirst();
        }

        User admin;
        if (adminOpt.isEmpty()) {
            log.info("No admin user found. Seeding default admin account...");
            admin = User.builder()
                    .email("admin@dhanvantari.com")
                    .name("System Admin")
                    .build();
        } else {
            log.info("Admin account already exists. Retrieving and verifying...");
            admin = adminOpt.get();
        }

        admin.setPasswordHash(passwordEncoder.encode("admin123"));
        admin.setRole(UserRole.ROLE_ADMIN);

        // Note: No standard access flags (e.g., enabled, accountNonLocked, accountNonExpired)
        // are defined on the User entity, so none are set here.

        userRepository.save(admin);

        System.out.println("Admin account verified and unlocked.");
        log.info("Default admin account successfully seeded/verified (email: admin@dhanvantari.com).");
    }
}
