package com.dhanvantari.backend.security;

import com.dhanvantari.backend.entity.User;
import com.dhanvantari.backend.entity.Doctor;
import com.dhanvantari.backend.entity.AccountStatus;
import com.dhanvantari.backend.entity.UserRole;
import com.dhanvantari.backend.repository.UserRepository;
import com.dhanvantari.backend.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + username));

        if (user.getRole() == UserRole.ROLE_DOCTOR) {
            Doctor doctor = doctorRepository.findById(user.getId()).orElse(null);
            if (doctor != null) {
                if (doctor.getAccountStatus() == AccountStatus.DELETED ||
                    doctor.getAccountStatus() == AccountStatus.PENDING_APPROVAL) {
                    throw new DisabledException("Account has been deactivated");
                }
            }
        }

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPasswordHash(),
                Collections.singletonList(new SimpleGrantedAuthority(user.getRole().name()))
        );
    }
}
