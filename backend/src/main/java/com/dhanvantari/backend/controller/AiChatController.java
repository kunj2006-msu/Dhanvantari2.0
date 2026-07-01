package com.dhanvantari.backend.controller;

import com.dhanvantari.backend.dto.ai.ChatRequest;
import com.dhanvantari.backend.entity.ChatType;
import com.dhanvantari.backend.entity.MoodRecord;
import com.dhanvantari.backend.service.HuggingFaceLlamaService;
import com.dhanvantari.backend.service.AiMentalHealthEngine;
import com.dhanvantari.backend.service.ChatService; // NEW: Import our memory service
import com.dhanvantari.backend.service.RagService;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal; // NEW: Security tracking
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/patient/chat")
@PreAuthorize("hasRole('PATIENT')")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AiChatController {

    private final HuggingFaceLlamaService llamaService;
    
    // NEW: Inject our ChatService instead of the raw aiTriageEngine
    private final ChatService chatService;

    private final RagService ragService;

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
    public ResponseEntity<?> handlePrimaryCareChat(
            @AuthenticationPrincipal UserDetails userDetails, 
            @RequestBody Map<String, Object> request) { // Changed to Object to safely read numbers
        try {
            String message = (String) request.get("message");
            String language = request.getOrDefault("language", "gu-IN").toString();
            if ("gu".equalsIgnoreCase(language) || "gu-IN".equalsIgnoreCase(language)) {
                language = "gu-IN";
            } else {
                language = "en-IN";
            }
            
            // Extract the sessionId if React sends it (it will be null for new chats)
            Long sessionId = request.get("sessionId") != null ? Long.valueOf(request.get("sessionId").toString()) : null;
            
            String userEmail = userDetails.getUsername();
            
            // Fetch the existing session history
            String chatHistory = chatService.getRecentChatHistory(sessionId);
            
            // Generate answer directly via RagService
            String ragResponse = ragService.generateAnswer(message, language, chatHistory);
            
            // Save user and AI messages in the chat session history
            Map<String, Object> result = chatService.processPatientMessageWithRag(userEmail, message, language, sessionId, ragResponse);
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println("AI Triage Error: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", "Failed to process triage request."));
        }
    }
    // NEW: Fetch all past chat sessions for the logged-in patient
    @GetMapping("/sessions")
    public ResponseEntity<?> getChatHistory(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            String userEmail = userDetails.getUsername();
            // We can directly call the repository or add a quick method in ChatService
            // For speed, let's assume we fetch them via a quick service call
            List<com.dhanvantari.backend.entity.ChatSession> sessions = chatService.getPatientHistory(userEmail);
            
            // Map to a clean list of maps containing id, title, and date for the frontend
            List<Map<String, Object>> response = sessions.stream().map(s -> {
                Map<String, Object> map = new java.util.HashMap<>();
                map.put("id", s.getId());
                map.put("title", s.getTitle());
                map.put("createdAt", s.getCreatedAt());
                return map;
            }).collect(java.util.stream.Collectors.toList());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to fetch history."));
        }
    }

    // NEW: Delete a specific chat session
    @DeleteMapping("/sessions/{sessionId}")
    public ResponseEntity<?> deleteChatSession(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long sessionId) {
        try {
            chatService.deleteSession(sessionId);
            return ResponseEntity.ok(Map.of("message", "Session deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to delete session."));
        }
    }

    // NEW: Fetch all chat bubbles for a specific session
    @GetMapping("/sessions/{sessionId}/messages")
    public ResponseEntity<?> getSessionMessages(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long sessionId) {
        try {
            return ResponseEntity.ok(chatService.getSessionMessages(sessionId));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to fetch messages."));
        }
    }

    @Autowired
    private AiMentalHealthEngine aiMentalHealthEngine;

    // NEW: Ephemeral Mental Health Chat Endpoint
    @PostMapping("/mental-health/chat")
    public ResponseEntity<?> handleMentalHealthChat(
            @AuthenticationPrincipal UserDetails userDetails, 
            @RequestBody Map<String, Object> request) {
        try {
            // Extract the history and language from React
            List<Map<String, String>> history = (List<Map<String, String>>) request.get("history");
            String language = request.getOrDefault("language", "gu").toString();
            
            // Process directly through the engine (No database saving!)
            String aiResponse = aiMentalHealthEngine.processSupportChat(history, language);
            
            return ResponseEntity.ok(Map.of("response", aiResponse));
        } catch (Exception e) {
            System.err.println("Mental Health AI Error: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", "Failed to process support chat."));
        }
    }

    @Autowired
    private com.dhanvantari.backend.repository.MoodRecordRepository moodRepository;

    // 1. SAVE THE MOOD SHIFT
    @PostMapping("/mental-health/mood")
    public ResponseEntity<?> saveMood(
            @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails,
            @RequestBody Map<String, String> request) {
        
        String initialMood = request.get("initialMood"); // Get before-chat mood
        String finalMood = request.get("finalMood");     // Get after-chat mood
        
        MoodRecord record = new MoodRecord(userDetails.getUsername(), java.time.LocalDate.now(), initialMood, finalMood);
        moodRepository.save(record);
        
        return ResponseEntity.ok(Map.of("message", "Mood shift saved successfully"));
    }

    // 2. FETCH THE MOODS (Called when the Calendar loads)
    @GetMapping("/mental-health/mood")
    public ResponseEntity<?> getMoodHistory(
            @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        
        List<MoodRecord> history = moodRepository.findByUserEmailOrderByRecordedDateDesc(userDetails.getUsername());
        return ResponseEntity.ok(history);
    }
}