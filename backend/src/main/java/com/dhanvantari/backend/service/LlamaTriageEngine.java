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

@Service
@ConditionalOnProperty(name = "ai.active.engine", havingValue = "llama")
public class LlamaTriageEngine implements AiTriageEngine {

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${huggingface.api.key}")
    private String hfApiKey;

    @Value("${huggingface.api.url}")
    private String hfApiUrl;

    private final String AI_MODEL = "mistralai/Mistral-7B-Instruct-v0.3";

    @Override
    public String processTriage(String patientQuery, String nativeLanguageCode) {
        String languageName = getLanguageName(nativeLanguageCode);

        // Step 1: Translate to English
        String englishQuery = (languageName.equals("English")) ? patientQuery :
                callHuggingFace("Translate this " + languageName + " text to English. ONLY output the translation: " + patientQuery);

        // Step 2: Medical Assessment
        String systemPrompt = "You are a clinical triage AI. Assess the following symptoms and provide a professional preliminary recommendation. Keep it under 3 sentences. Symptoms: ";
        String englishMedicalResponse = callHuggingFace(systemPrompt + englishQuery);

        // Step 3: Translate Back
        return (languageName.equals("English")) ? englishMedicalResponse :
                callHuggingFace("Translate this English medical advice to " + languageName + ". ONLY output the translation: " + englishMedicalResponse);
    }

    private String callHuggingFace(String prompt) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(hfApiKey);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("inputs", prompt);
            
            Map<String, Object> parameters = new HashMap<>();
            parameters.put("max_new_tokens", 250);
            parameters.put("return_full_text", false);
            parameters.put("temperature", 0.2);
            requestBody.put("parameters", parameters);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(hfApiUrl + AI_MODEL, entity, String.class);

            JsonNode root = objectMapper.readTree(response.getBody());
            return root.get(0).get("generated_text").asText().trim();
        } catch (Exception e) {
            System.err.println("Hugging Face API Error: " + e.getMessage());
            return "Hugging Face Service is currently unavailable. Please consult a doctor immediately.";
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