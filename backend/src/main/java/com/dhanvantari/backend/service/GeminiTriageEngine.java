package com.dhanvantari.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.HashMap;
import java.util.Map;
import java.util.List;

@Service
@ConditionalOnProperty(name = "ai.active.engine", havingValue = "gemini", matchIfMissing = true)
public class GeminiTriageEngine implements AiTriageEngine {

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    private final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=";

    @Override
    public String processTriage(String patientQuery, String nativeLanguageCode) {
        String languageName = getLanguageName(nativeLanguageCode);
        String systemPrompt = "You are an expert clinical triage AI for Dhanvantari. " +
                "Assess the patient's symptoms and provide a professional, brief preliminary recommendation. " +
                "Keep it under 3 sentences. " +
                "IMPORTANT: You MUST reply entirely in the " + languageName + " language. " +
                "Patient symptoms: ";

        return callGemini(systemPrompt + patientQuery);
    }

    private String callGemini(String prompt) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> part = new HashMap<>();
            part.put("text", prompt);

            Map<String, Object> content = new HashMap<>();
            content.put("parts", List.of(part));

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", List.of(content));

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<String> response = restTemplate.postForEntity(GEMINI_API_URL + geminiApiKey, entity, String.class);

            JsonNode root = objectMapper.readTree(response.getBody());
            return root.get("candidates").get(0).get("content").get("parts").get(0).get("text").asText().trim();
        } catch (Exception e) {
            System.err.println("Gemini API Error: " + e.getMessage());
            return "Gemini Service is currently unavailable. Please consult a doctor immediately.";
        }
    }

    private String getLanguageName(String code) {
        return switch (code.toLowerCase()) {
            case "hi" -> "Hindi"; case "gu" -> "Gujarati"; case "mr" -> "Marathi";
            case "bn" -> "Bengali"; case "te" -> "Telugu"; case "ta" -> "Tamil";
            case "ur" -> "Urdu"; default -> "English";
        };
    }
}