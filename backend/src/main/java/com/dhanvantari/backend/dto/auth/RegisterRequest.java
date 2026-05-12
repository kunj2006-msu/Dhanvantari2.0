package com.dhanvantari.backend.dto.auth;

import com.dhanvantari.backend.entity.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {
    private String name;
    private String email;
    private String password;
    private UserRole role;

    // Doctor specific fields
    private String degree;
    private String specialization;
    private String city;
    private String state;
    private String clinicAddress;
    private Integer experienceYears;
    private String registrationNumber;
    private Double latitude;
    private Double longitude;

    // Patient specific fields
    private java.time.LocalDate dateOfBirth;
    private String gender;
    private String bloodGroup;
    private String preMedicalConditions;
    private java.math.BigDecimal heightCm;
    private java.math.BigDecimal weightKg;
}
