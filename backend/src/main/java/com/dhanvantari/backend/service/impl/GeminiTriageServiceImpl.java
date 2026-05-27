package com.dhanvantari.backend.service.impl;

import com.dhanvantari.backend.dto.ai.TriageResponseDTO;
import com.dhanvantari.backend.service.GeminiTriageService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GeminiTriageServiceImpl implements GeminiTriageService {
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    private static final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=";

    @Override
    public String extractTriageInformationJson(String patientInput) {
        String prompt = "You are a medical data extractor. Analyze the following patient symptoms. " +
                "You MUST output ONLY a raw JSON object with NO markdown formatting (do NOT use ```json or ```). " +
                "The JSON schema must exactly match this format: " +
                "{ \"primarySymptoms\": [\"list\", \"of\", \"symptoms\"], " +
                "\"recommendedSpecialization\": \"String matching one of our DB specializations\", " +
                "\"doctorSummary\": \"A 2-sentence professional summary for the doctor's dashboard\" } " +
                "\nPatient symptoms: " + patientInput;

        String geminiEndpoint = GEMINI_API_URL + geminiApiKey;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Build the payload
        Map<String, Object> part = new HashMap<>();
        part.put("text", prompt);

        Map<String, Object> content = new HashMap<>();
        content.put("parts", List.of(part));

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("contents", List.of(content));

        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(geminiEndpoint, requestEntity, String.class);
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                JsonNode candidates = root.path("candidates");
                if (candidates.isArray() && candidates.size() > 0) {
                    JsonNode firstCandidate = candidates.get(0);
                    JsonNode textNode = firstCandidate.path("content").path("parts").get(0).path("text");
                    if (!textNode.isMissingNode()) {
                        String rawJson = textNode.asText().trim();
                        // Clean up markdown block if the model disobeyed instructions
                        if (rawJson.startsWith("```json")) {
                            rawJson = rawJson.substring(7);
                        }
                        if (rawJson.startsWith("```")) {
                            rawJson = rawJson.substring(3);
                        }
                        if (rawJson.endsWith("```")) {
                            rawJson = rawJson.substring(0, rawJson.length() - 3);
                        }
                        return rawJson.trim();
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return "{}";
    }

    @Override
    public String recommendSpecialization(String triageJson) {
        try {
            TriageResponseDTO dto = objectMapper.readValue(triageJson, TriageResponseDTO.class);
            return dto.getRecommendedSpecialization();
        } catch (Exception e) {
            e.printStackTrace();
            return "GENERAL_PHYSICIAN";
        }
    }

    public TriageResponseDTO getTriageResponseDTO(String patientInput) {
        String jsonStr = extractTriageInformationJson(patientInput);
        try {
            return objectMapper.readValue(jsonStr, TriageResponseDTO.class);
        } catch (Exception e) {
            e.printStackTrace();
            return TriageResponseDTO.builder()
                    .primarySymptoms(List.of("Unable to parse symptoms"))
                    .recommendedSpecialization("GENERAL_PHYSICIAN")
                    .doctorSummary("Error extracting triage data.")
                    .build();
        }
    }
}
