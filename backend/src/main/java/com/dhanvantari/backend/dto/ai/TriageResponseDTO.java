package com.dhanvantari.backend.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TriageResponseDTO {
    private List<String> primarySymptoms;
    private String recommendedSpecialization;
    private String doctorSummary;
}
