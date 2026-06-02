package com.dhanvantari.backend.dto;

import lombok.*;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentRequest {
    private UUID doctorId;
    private String scheduledDate; // Format: YYYY-MM-DD
    private String scheduledTime; // Format: hh:mm AM/PM
    private String symptomsNotes;
}
