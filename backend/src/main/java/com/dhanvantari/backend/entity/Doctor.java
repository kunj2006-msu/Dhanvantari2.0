package com.dhanvantari.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "doctors")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"user"})
@EqualsAndHashCode(exclude = {"user"})
public class Doctor {

    @Id
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "id")
    private User user;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "degree")
    private String degree;

    @Column(name = "specialization")
    private String specialization;

    @Column(name = "city")
    private String city;

    @Column(name = "state")
    private String state;

    @Column(name = "registration_number", nullable = false, unique = true, length = 100)
    private String registrationNumber;

    @Column(name = "experience_years")
    private Integer experienceYears;

    @Column(name = "clinic_address", columnDefinition = "TEXT")
    private String clinicAddress;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;
}
