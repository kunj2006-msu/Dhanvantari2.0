package com.dhanvantari.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class SarvamChatService {

    @Value("${sarvam.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    public String generateGujaratiResponse(String systemPrompt, String userQuery) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);
            headers.set("api-subscription-key", apiKey);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", "sarvam-30b");
            // LOWERED TEMPERATURE: Keeps the model strictly tied to the RAG context
            requestBody.put("temperature", 0.1);
            // INCREASED MAX TOKENS: Allows the model to generate long, detailed responses
            requestBody.put("max_tokens", 3000);
            requestBody.put("messages", List.of(
                    Map.of("role", "system", "content", systemPrompt),
                    Map.of("role", "user", "content", userQuery)));

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(
                    "https://api.sarvam.ai/v1/chat/completions",
                    entity,
                    Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map body = response.getBody();

                // --- DEBUGGING LINE: Print exactly what Sarvam sends back ---
                System.out.println("[Sarvam Chat] RAW RESPONSE: " + body);

                // --- SAFE PARSING: Check for nulls at every step ---
                if (body.containsKey("choices") && body.get("choices") != null) {
                    List<Map<String, Object>> choices = (List<Map<String, Object>>) body.get("choices");

                    if (!choices.isEmpty() && choices.get(0).containsKey("message")) {
                        Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");

                        if (message != null && message.containsKey("content") && message.get("content") != null) {
                            return message.get("content").toString();
                        }
                    }
                }
                System.err.println("[Sarvam Chat] Missing 'content' in response structure.");
            }
        } catch (Exception e) {
            System.err.println("[Sarvam Chat] Exception occurred: " + e.getMessage());
        }

        // Fallback message if anything fails
        return "ક્ષમા કરશો, હું અત્યારે જવાબ આપવામાં અસમર્થ છું. કૃપા કરીને ડૉક્ટરનો સંપર્ક કરો.";
    }
}