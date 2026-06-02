package com.dhanvantari.backend.dto;

import lombok.*;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorDTO {
    private UUID id;
    private String name;
    private String specialization;
    private String state;
    private String city;
    private String experience;
    private String clinicAddress;
    private Double latitude;
    private Double longitude;
}
