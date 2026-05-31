package com.dhanvantari.backend.service.impl;

import com.dhanvantari.backend.entity.ChatType;
import com.dhanvantari.backend.service.HuggingFaceLlamaService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class HuggingFaceLlamaServiceImpl implements HuggingFaceLlamaService {

    // BULLETPROOF FIX: We create these manually instead of asking Spring to do it.
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${huggingface.api.key}")
    private String apiKey;

  @Value("${huggingface.model.url}")
    private String modelUrl;
    // (Keep your existing MULTILINGUAL_PROMPTS map and the
    // generateEmpatheticResponse method exactly as they are below this line)

    @Override
    public String generateEmpatheticResponse(String userMessage, ChatType chatType, String language) {
        String systemPrompt = MULTILINGUAL_PROMPTS.getOrDefault(language, MULTILINGUAL_PROMPTS.get("English"));

        String context = chatType == ChatType.MENTAL_HEALTH
                ? " You are specialized in mental health support."
                : " You are specialized in general health precautions.";

        String fullPrompt = "System: " + systemPrompt + context + "\nUser: " + userMessage + "\nAssistant:";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + apiKey);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("inputs", fullPrompt);

        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(modelUrl, requestEntity, String.class);
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                if (root.isArray() && root.size() > 0) {
                    JsonNode firstElement = root.get(0);
                    if (firstElement.has("generated_text")) {
                        String generatedText = firstElement.get("generated_text").asText();
                        // Hugging Face API usually returns the input prompt along with the answer. We
                        // can strip it if needed.
                        if (generatedText.startsWith(fullPrompt)) {
                            return generatedText.substring(fullPrompt.length()).trim();
                        }
                        return generatedText.trim();
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            return "Sorry, I am currently unable to provide an empathetic response. Please try again later.";
        }

        return "Sorry, I couldn't generate a response at this time.";
    }

    // NEW: The Developer's Bypass - Groq API Implementation
    @Override
    public String generateResponse(String fullPrompt) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + apiKey);

        // 1. Pack the message into the Groq format
        Map<String, String> message = new HashMap<>();
        message.put("role", "user");
        message.put("content", fullPrompt);

        // 2. Request the exact same Llama model, but from Groq's servers
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", "llama-3.3-70b-versatile"); 
        requestBody.put("messages", new Object[]{message});

        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

        try {
            // 3. Send to Groq
            ResponseEntity<String> response = restTemplate.postForEntity(modelUrl, requestEntity, String.class);
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                // 4. Unpack the Groq response
                JsonNode root = objectMapper.readTree(response.getBody());
                JsonNode choices = root.path("choices");
                
                if (choices.isArray() && choices.size() > 0) {
                    JsonNode messageNode = choices.get(0).path("message");
                    if (messageNode.has("content")) {
                        return messageNode.get("content").asText().trim();
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Groq API Error: " + e.getMessage());
            return "Sorry, I am currently unable to connect to the support server. Please try again later.";
        }

        return "Sorry, I couldn't generate a response at this time.";
    }}
