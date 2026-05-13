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

    public java.util.Map<String, Object> getMe() {
        String email = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        
        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("id", user.getId());
        response.put("email", user.getEmail());
        response.put("role", user.getRole().name());
        
        if (user.getRole() == com.dhanvantari.backend.entity.UserRole.ROLE_DOCTOR) {
            com.dhanvantari.backend.entity.Doctor doctor = doctorRepository.findById(user.getId()).orElse(null);
            if (doctor != null) {
                response.put("fullName", doctor.getFullName());
                response.put("degree", doctor.getDegree());
                response.put("specialization", doctor.getSpecialization());
                response.put("city", doctor.getCity());
                response.put("state", doctor.getState());
                response.put("medicalRegistrationNumber", doctor.getRegistrationNumber());
                response.put("yearsOfExperience", doctor.getExperienceYears());
                response.put("clinicAddress", doctor.getClinicAddress());
                response.put("latitude", doctor.getLatitude());
                response.put("longitude", doctor.getLongitude());
            }
        } else if (user.getRole() == com.dhanvantari.backend.entity.UserRole.ROLE_PATIENT) {
            com.dhanvantari.backend.entity.Patient patient = patientRepository.findById(user.getId()).orElse(null);
            if (patient != null) {
                response.put("fullName", patient.getFullName());
                response.put("dateOfBirth", patient.getDateOfBirth() != null ? patient.getDateOfBirth().toString() : null);
                response.put("gender", patient.getGender());
                response.put("bloodGroup", patient.getBloodGroup());
                
                String conditions = patient.getPreMedicalConditions();
                if (conditions != null && !conditions.trim().isEmpty()) {
                    response.put("preMedicalConditions", java.util.Arrays.stream(conditions.split(","))
                                                                       .map(String::trim)
                                                                       .filter(s -> !s.isEmpty())
                                                                       .toArray(String[]::new));
                } else {
                    response.put("preMedicalConditions", new String[0]);
                }
            }
        }
        return response;
    }
}
