package com.dhanvantari.backend.service;

/**
 * Service interface for interacting with Gemini models.
 * Primarily handles strict JSON extraction and appointment scheduling triage.
 */
public interface GeminiTriageService {

    /**
     * Extracts key symptoms, urgency, and relevant details from a patient's unstructured text 
     * and returns them as a structured JSON string.
     *
     * @param patientInput The unstructured text input from the patient.
     * @return A strict JSON string containing extracted triage information.
     */
    String extractTriageInformationJson(String patientInput);

    /**
     * Evaluates the extracted triage information to suggest the appropriate medical 
     * specialization and urgency level for appointment scheduling.
     *
     * @param triageJson Strict JSON string representing the patient's condition.
     * @return Recommended specialization for scheduling.
     */
    String recommendSpecialization(String triageJson);

    /**
     * Extracts and maps the patient triage information into a strong DTO.
     * 
     * @param patientInput Unstructured text input from the patient.
     * @return TriageResponseDTO containing parsed details.
     */
    com.dhanvantari.backend.dto.ai.TriageResponseDTO getTriageResponseDTO(String patientInput);

}
