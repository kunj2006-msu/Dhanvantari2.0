package com.dhanvantari.backend.dto;

import lombok.*;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentDTO {
    private UUID id;
    private String doctorName;
    private String specialty;
    private String date; // formatted as DD/MM/YYYY
    private String time; // formatted as hh:mm a
    private String status;
    private String clinicAddress;
    private Double latitude;
    private Double longitude;
    private String doctorNotes;
    private String symptomsNotes;
}
