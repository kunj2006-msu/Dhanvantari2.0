package com.dhanvantari.backend.service;

import com.dhanvantari.backend.dto.auth.AuthResponse;
import com.dhanvantari.backend.dto.auth.LoginRequest;
import com.dhanvantari.backend.dto.auth.RegisterRequest;
import com.dhanvantari.backend.entity.User;
import com.dhanvantari.backend.repository.UserRepository;
import com.dhanvantari.backend.repository.DoctorRepository;
import com.dhanvantari.backend.repository.PatientRepository;
import com.dhanvantari.backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email is already taken!");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .build();

        userRepository.save(user);

        if (request.getRole() == com.dhanvantari.backend.entity.UserRole.ROLE_DOCTOR) {
            com.dhanvantari.backend.entity.Doctor doctor = new com.dhanvantari.backend.entity.Doctor();
            doctor.setUser(user);
            
            doctor.setFullName(request.getName());
            doctor.setDegree(request.getDegree());
            doctor.setSpecialization(request.getSpecialization());
            doctor.setCity(request.getCity());
            doctor.setState(request.getState());
            doctor.setRegistrationNumber(request.getRegistrationNumber());
            doctor.setExperienceYears(request.getExperienceYears());
            doctor.setClinicAddress(request.getClinicAddress());
            doctor.setLatitude(request.getLatitude());
            doctor.setLongitude(request.getLongitude());
            
            doctorRepository.save(doctor);
            
        } else if (request.getRole() == com.dhanvantari.backend.entity.UserRole.ROLE_PATIENT) {
            com.dhanvantari.backend.entity.Patient patient = new com.dhanvantari.backend.entity.Patient();
            patient.setUser(user);
            patient.setFullName(request.getName());
            patient.setDateOfBirth(request.getDateOfBirth());
            patient.setGender(request.getGender());
            patient.setBloodGroup(request.getBloodGroup());
            patient.setPreMedicalConditions(request.getPreMedicalConditions());
            patient.setHeightCm(request.getHeightCm());
            patient.setWeightKg(request.getWeightKg());
            
            patientRepository.save(patient);
        }

        org.springframework.security.core.userdetails.User userDetails =
                new org.springframework.security.core.userdetails.User(
                        user.getEmail(),
                        user.getPasswordHash(),
                        Collections.singletonList(new SimpleGrantedAuthority(user.getRole().name()))
                );

        String jwtToken = jwtUtil.generateToken(userDetails);
        return AuthResponse.builder()
                .token(jwtToken)
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        org.springframework.security.core.userdetails.User userDetails =
                new org.springframework.security.core.userdetails.User(
                        user.getEmail(),
                        user.getPasswordHash(),
                        Collections.singletonList(new SimpleGrantedAuthority(user.getRole().name()))
                );

        String jwtToken = jwtUtil.generateToken(userDetails);
        
        String specialization = null;
        if (user.getRole() == com.dhanvantari.backend.entity.UserRole.ROLE_DOCTOR) {
            specialization = doctorRepository.findById(user.getId())
                    .map(com.dhanvantari.backend.entity.Doctor::getSpecialization)
                    .orElse("Specialist");
        }

        return AuthResponse.builder()
                .token(jwtToken)
                .name(user.getName())
                .role(user.getRole().name())
                .specialization(specialization)
                .build();
    }
}
