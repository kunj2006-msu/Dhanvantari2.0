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
            throw new IllegalArgumentException("Email is already in use.");
        }

        if (request.getRole() == com.dhanvantari.backend.entity.UserRole.ROLE_PATIENT) {
            if (request.getDateOfBirth() == null || request.getGender() == null || request.getBloodGroup() == null) {
                throw new IllegalArgumentException("Missing mandatory patient details");
            }
        } else if (request.getRole() == com.dhanvantari.backend.entity.UserRole.ROLE_DOCTOR) {
            boolean hasAddress = request.getClinicAddress() != null || (request.getCity() != null && request.getState() != null);
            if (!hasAddress || request.getLatitude() == null || request.getLongitude() == null) {
                throw new IllegalArgumentException("Missing mandatory clinic address details");
            }
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

    @Transactional
    public void updateMe(java.util.Map<String, Object> updates) {
        String email = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        
        if (updates.containsKey("fullName") && updates.get("fullName") != null) {
            user.setName((String) updates.get("fullName"));
            userRepository.save(user);
        }

        if (user.getRole() == com.dhanvantari.backend.entity.UserRole.ROLE_DOCTOR) {
            com.dhanvantari.backend.entity.Doctor doctor = doctorRepository.findById(user.getId())
                    .orElseThrow(() -> new RuntimeException("Doctor profile not found"));
            
            if (updates.containsKey("fullName") && updates.get("fullName") != null) doctor.setFullName((String) updates.get("fullName"));
            if (updates.containsKey("degree")) doctor.setDegree(updates.get("degree") != null ? (String) updates.get("degree") : null);
            if (updates.containsKey("specialization")) doctor.setSpecialization(updates.get("specialization") != null ? (String) updates.get("specialization") : null);
            if (updates.containsKey("experienceYears") && updates.get("experienceYears") != null) {
                Object exp = updates.get("experienceYears");
                if (exp instanceof Integer) doctor.setExperienceYears((Integer) exp);
                else if (exp instanceof String && !((String) exp).isEmpty()) doctor.setExperienceYears(Integer.parseInt((String) exp));
            }
            if (updates.containsKey("clinicAddress")) doctor.setClinicAddress(updates.get("clinicAddress") != null ? (String) updates.get("clinicAddress") : null);
            if (updates.containsKey("latitude") && updates.get("latitude") != null) {
                Object lat = updates.get("latitude");
                if (lat instanceof Double) doctor.setLatitude((Double) lat);
                else if (lat instanceof Number) doctor.setLatitude(((Number) lat).doubleValue());
                else if (lat instanceof String) doctor.setLatitude(Double.parseDouble((String) lat));
            }
            if (updates.containsKey("longitude") && updates.get("longitude") != null) {
                Object lng = updates.get("longitude");
                if (lng instanceof Double) doctor.setLongitude((Double) lng);
                else if (lng instanceof Number) doctor.setLongitude(((Number) lng).doubleValue());
                else if (lng instanceof String) doctor.setLongitude(Double.parseDouble((String) lng));
            }
            
            doctorRepository.save(doctor);
            
        } else if (user.getRole() == com.dhanvantari.backend.entity.UserRole.ROLE_PATIENT) {
            com.dhanvantari.backend.entity.Patient patient = patientRepository.findById(user.getId())
                    .orElseThrow(() -> new RuntimeException("Patient profile not found"));
            
            if (updates.containsKey("fullName") && updates.get("fullName") != null) patient.setFullName((String) updates.get("fullName"));
            if (updates.containsKey("dateOfBirth") && updates.get("dateOfBirth") != null) {
                Object dob = updates.get("dateOfBirth");
                if (dob instanceof String && !((String) dob).isEmpty()) {
                    patient.setDateOfBirth(java.time.LocalDate.parse((String) dob));
                }
            }
            if (updates.containsKey("gender")) patient.setGender(updates.get("gender") != null ? (String) updates.get("gender") : null);
            if (updates.containsKey("bloodGroup")) patient.setBloodGroup(updates.get("bloodGroup") != null ? (String) updates.get("bloodGroup") : null);
            if (updates.containsKey("preMedicalConditions") && updates.get("preMedicalConditions") != null) {
                Object cond = updates.get("preMedicalConditions");
                if (cond instanceof java.util.List) {
                    java.util.List<?> list = (java.util.List<?>) cond;
                    patient.setPreMedicalConditions(String.join(", ", list.stream().map(Object::toString).toArray(String[]::new)));
                } else if (cond instanceof String) {
                    patient.setPreMedicalConditions((String) cond);
                }
            } else if (updates.containsKey("preMedicalConditions") && updates.get("preMedicalConditions") == null) {
                patient.setPreMedicalConditions(null);
            }
            
            patientRepository.save(patient);
        }
    }

    @Transactional
    public void deleteMe() {
        String email = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        
        if (user.getRole() == com.dhanvantari.backend.entity.UserRole.ROLE_DOCTOR) {
            doctorRepository.deleteById(user.getId());
        } else if (user.getRole() == com.dhanvantari.backend.entity.UserRole.ROLE_PATIENT) {
            patientRepository.deleteById(user.getId());
        }
        userRepository.delete(user);
    }
}

