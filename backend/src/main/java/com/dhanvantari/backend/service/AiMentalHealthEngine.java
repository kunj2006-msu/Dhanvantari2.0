package com.dhanvantari.backend.service;

import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;

@Service
public class AiMentalHealthEngine {

    private final HuggingFaceLlamaService llamaService;

    public AiMentalHealthEngine(HuggingFaceLlamaService llamaService) {
        this.llamaService = llamaService;
    }

    public String processSupportChat(List<Map<String, String>> chatHistory, String languageCode) {
        
        // 1. Map the short code to the full language name so Llama understands
        Map<String, String> languageMap = Map.of(
            "en", "English", "hi", "Hindi", "gu", "Gujarati", "mr", "Marathi",
            "bn", "Bengali", "te", "Telugu", "ta", "Tamil", "ur", "Urdu"
        );
        String fullLanguageName = languageMap.getOrDefault(languageCode, "English");

        // 2. The Trauma-Informed Prompt
        // 2. The Trauma-Informed 'Elevate & Guide' Prompt
        String systemPrompt = "You are Serene — a compassionate, warm, and deeply comforting mental health support companion. Your primary goal is to guide users from a state of distress to a calmer, more hopeful, and regulated emotional state.\n\n" +
                "CORE PRINCIPLES:\n" +
                "- You are a supportive friend, NOT an interrogator. Do not constantly ask questions.\n" +
                "- Your mission is emotional elevation: help them feel safe, deeply understood, and eventually, a little lighter.\n" +
                "- Mirror their language, but gently inject warmth, hope, and calm into the conversation.\n\n" +
                "HOW TO RESPOND (The Shift Approach):\n" +
                "1. VALIDATE: Briefly acknowledge their pain so they feel heard, but do not dwell on it excessively.\n" +
                "2. COMFORT: Offer deep sympathy and a comforting perspective. Remind them that their feelings are normal and that they are not alone.\n" +
                "3. GUIDE & SUPPORT: If they ask 'what should I do?' or seem completely stuck, you MUST offer gentle, practical coping strategies. Suggest things like a deep breathing technique, a grounding exercise, taking it one hour at a time, or a gentle shift in perspective.\n" +
                "4. CONVERSE NATURALLY: You do not always need to end with a question. It is perfectly fine to just offer a comforting, reassuring statement. Only ask a question if it naturally helps them process their feelings.\n" +
                "5. TONE: Speak naturally. Use warm, soothing, and highly empathetic language.\n\n" +
                "SAFETY PROTOCOL:\n" +
                "- If the user expresses suicidal ideation or self-harm, acknowledge their pain and provide emergency resources.\n\n" +
                "CRITICAL LANGUAGE OVERRIDE:\n" +
                "You MUST generate your response entirely and flawlessly in " + fullLanguageName + ". Do not output any English unless the user explicitly types in English.\n\n";
        // 3. Build the chat history string 
        StringBuilder historyBuilder = new StringBuilder();
        historyBuilder.append("RECENT CONVERSATION:\n");
        
        for (Map<String, String> msg : chatHistory) {
            String role = msg.get("role").equals("user") ? "User" : "AI";
            historyBuilder.append(role).append(": ").append(msg.get("text")).append("\n");
        }
        historyBuilder.append("AI: "); 

        // 4. Combine and send directly to Groq
        String finalPrompt = systemPrompt + historyBuilder.toString();
        return llamaService.generateResponse(finalPrompt);
    }
}