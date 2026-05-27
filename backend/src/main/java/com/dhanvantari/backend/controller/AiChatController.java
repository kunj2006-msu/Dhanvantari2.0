package com.dhanvantari.backend.controller;

import com.dhanvantari.backend.dto.ai.ChatRequest;
import com.dhanvantari.backend.entity.ChatType;
import com.dhanvantari.backend.service.HuggingFaceLlamaService;
import com.dhanvantari.backend.service.AiTriageEngine;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/patient/chat")
@PreAuthorize("hasRole('PATIENT')")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AiChatController {

    // Your existing Llama service for Mental Health
    private final HuggingFaceLlamaService llamaService;
    
    // Change the variable type
    private final AiTriageEngine aiTriageEngine;

    @PostMapping("/mental-health")
    public ResponseEntity<String> mentalHealthChat(@RequestBody ChatRequest request) {
        String response = llamaService.generateEmpatheticResponse(
                request.getUserMessage(),
                ChatType.MENTAL_HEALTH,
                request.getLanguage());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/precaution")
    public ResponseEntity<String> precautionChat(@RequestBody ChatRequest request) {
        String response = llamaService.generateEmpatheticResponse(
                request.getUserMessage(),
                ChatType.PRECAUTION,
                request.getLanguage());
        return ResponseEntity.ok(response);
    }

    // Our new, safely translated 3-step Hybrid Triage Endpoint
    @PostMapping("/triage")
    public ResponseEntity<?> handlePrimaryCareChat(@RequestBody Map<String, String> request) {
        try {
            String message = request.get("message");
            String language = request.getOrDefault("language", "gu"); 
            
            // Run the 3-step hybrid pipeline
            String aiResponse = aiTriageEngine.processTriage(message, language);
            
            return ResponseEntity.ok(Map.of("response", aiResponse));
        } catch (Exception e) {
            System.err.println("AI Triage Error: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", "Failed to process triage request."));
        }
    }
}