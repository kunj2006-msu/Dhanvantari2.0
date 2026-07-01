package com.dhanvantari.backend.service;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;
// ... other imports ...
import com.dhanvantari.backend.entity.ChatMessage;
import com.dhanvantari.backend.entity.ChatSession;
import com.dhanvantari.backend.entity.Patient;
import com.dhanvantari.backend.repository.ChatMessageRepository;
import com.dhanvantari.backend.repository.ChatSessionRepository;
import com.dhanvantari.backend.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatSessionRepository chatSessionRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final PatientRepository patientRepository;
    private final AiTriageEngine aiTriageEngine;


   // UPDATED: Now accepts sessionId and returns a Map containing both the text and the ID
    @Transactional
    public Map<String, Object> processPatientMessage(String userEmail, String message, String languageCode, Long sessionId) {
        Patient patient = patientRepository.findByUserEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Patient profile not found."));

        // 1. Fetch exact session, or create a brand new one if sessionId is null
        ChatSession currentSession = getOrCreateSession(patient, languageCode, sessionId, message);

        ChatMessage userMsg = ChatMessage.builder()
                .session(currentSession)
                .role("user")
                .content(message)
                .build();
        chatMessageRepository.save(userMsg);

        String silentContext = buildSilentContext(patient);
        String chatHistory = buildSlidingWindow(currentSession.getId());

        String finalPromptToAi = silentContext + "\n\n" + 
                                 "RECENT CHAT HISTORY:\n" + chatHistory + "\n\n" +
                                 "THE USER JUST SAID: " + message;

        String aiResponseText = aiTriageEngine.processTriage(finalPromptToAi, languageCode);

        ChatMessage aiMsg = ChatMessage.builder()
                .session(currentSession)
                .role("ai")
                .content(aiResponseText)
                .build();
        chatMessageRepository.save(aiMsg);

        // Return BOTH the AI's response AND the session ID so React knows which room was just created
        Map<String, Object> response = new java.util.HashMap<>();
        response.put("response", aiResponseText);
        response.put("sessionId", currentSession.getId());
        
        return response;
    }

    @Transactional
    public Map<String, Object> processPatientMessageWithRag(String userEmail, String message, String languageCode, Long sessionId, String aiResponseText) {
        Patient patient = patientRepository.findByUserEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Patient profile not found."));

        // 1. Fetch exact session, or create a brand new one if sessionId is null
        ChatSession currentSession = getOrCreateSession(patient, languageCode, sessionId, message);

        ChatMessage userMsg = ChatMessage.builder()
                .session(currentSession)
                .role("user")
                .content(message)
                .build();
        chatMessageRepository.save(userMsg);

        ChatMessage aiMsg = ChatMessage.builder()
                .session(currentSession)
                .role("ai")
                .content(aiResponseText)
                .build();
        chatMessageRepository.save(aiMsg);

        // Return BOTH the AI's response AND the session ID so React knows which room was just created
        Map<String, Object> response = new java.util.HashMap<>();
        response.put("response", aiResponseText);
        response.put("sessionId", currentSession.getId());
        
        return response;
    }

    // UPDATED: No more 12-hour rule. Strictly obeys the frontend.
    private ChatSession getOrCreateSession(Patient patient, String languageCode, Long sessionId, String firstMessage) {
        if (sessionId != null) {
            return chatSessionRepository.findById(sessionId)
                    .orElseThrow(() -> new RuntimeException("Session not found"));
        }

        // Make a dynamic title based on what the user typed (like Gemini does!)
        String dynamicTitle = firstMessage.length() > 25 ? firstMessage.substring(0, 25) + "..." : firstMessage;

        ChatSession newSession = ChatSession.builder()
                .patient(patient)
                .title(dynamicTitle)
                .languageCode(languageCode)
                .build();
        return chatSessionRepository.save(newSession);
    }
    private String buildSilentContext(Patient patient) {
        StringBuilder context = new StringBuilder("PATIENT MEDICAL PROFILE (Use this silently to guide your advice):\n");
        context.append("- Age: ").append(patient.getDateOfBirth() != null ? "Calculated from " + patient.getDateOfBirth() : "Unknown").append("\n");
        context.append("- Gender: ").append(patient.getGender() != null ? patient.getGender() : "Unknown").append("\n");
        
        if (patient.getPreMedicalConditions() != null && !patient.getPreMedicalConditions().isBlank()) {
            context.append("- Pre-existing Conditions: ").append(patient.getPreMedicalConditions()).append("\n");
        }
        return context.toString();
    }

    private String buildSlidingWindow(Long sessionId) {
        // Fetch all messages, but we only want the most recent 6 to avoid Context Limit crashes
        List<ChatMessage> allMessages = chatMessageRepository.findBySessionIdOrderByTimestampAsc(sessionId);
        int startIndex = Math.max(0, allMessages.size() - 6); 
        
        return allMessages.subList(startIndex, allMessages.size()).stream()
                .map(msg -> (msg.getRole().equals("ai") ? "DHANVANTARI: " : "USER: ") + msg.getContent())
                .collect(Collectors.joining("\n"));
    }

    public List<ChatSession> getPatientHistory(String userEmail) {
        Patient patient = patientRepository.findByUserEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        return chatSessionRepository.findByPatientIdOrderByCreatedAtDesc(patient.getId());
    }

    @Transactional
    public void deleteSession(Long sessionId) {
        // First delete all messages inside the session to prevent foreign-key constraints
        // If your entity has CascadeType.ALL, this happens automatically, otherwise do this:
        List<ChatMessage> messages = chatMessageRepository.findBySessionIdOrderByTimestampAsc(sessionId);
        chatMessageRepository.deleteAll(messages);
        
        // Then delete the room itself
        chatSessionRepository.deleteById(sessionId);
    }

    public List<Map<String, String>> getSessionMessages(Long sessionId) {
        return chatMessageRepository.findBySessionIdOrderByTimestampAsc(sessionId)
                .stream()
                .map(msg -> {
                    Map<String, String> map = new java.util.HashMap<>();
                    map.put("role", msg.getRole().toLowerCase());
                    map.put("text", msg.getContent());
                    return map;
                })
                .collect(java.util.stream.Collectors.toList());
    }

    public String getRecentChatHistory(Long sessionId) {
        if (sessionId == null) {
            return "";
        }
        List<ChatMessage> allMessages = chatMessageRepository.findBySessionIdOrderByTimestampAsc(sessionId);
        int startIndex = Math.max(0, allMessages.size() - 6);
        return allMessages.subList(startIndex, allMessages.size()).stream()
                .map(msg -> (msg.getRole().equalsIgnoreCase("ai") ? "AI: " : "User: ") + msg.getContent())
                .collect(Collectors.joining("\n"));
    }
}