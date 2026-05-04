package com.dhanvantari.backend.controller;

import com.dhanvantari.backend.dto.ai.ChatRequest;
import com.dhanvantari.backend.dto.ai.TriageRequest;
import com.dhanvantari.backend.dto.ai.TriageResponseDTO;
import com.dhanvantari.backend.entity.ChatType;
import com.dhanvantari.backend.service.GeminiTriageService;
import com.dhanvantari.backend.service.HuggingFaceLlamaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/patient/chat")
@PreAuthorize("hasRole('PATIENT')")
@RequiredArgsConstructor // <-- THIS WAS THE MISSING MAGIC WORD!
public class AiChatController {

    private final HuggingFaceLlamaService llamaService;
    private final GeminiTriageService triageService;

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

    @PostMapping("/triage")
    public ResponseEntity<TriageResponseDTO> triageChat(@RequestBody TriageRequest request) {
        TriageResponseDTO response = triageService.getTriageResponseDTO(request.getPatientInput());
        return ResponseEntity.ok(response);
    }
}