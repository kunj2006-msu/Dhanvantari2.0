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
public String processSupportChat(List<Map<String, String>> chatHistory, String language) {
        // 1. Define the Advanced Trauma-Informed System Prompt
        String systemPrompt = "You are Serene — a compassionate, trauma-informed mental health support companion. Your role is to provide a safe, warm, and non-judgmental space where people feel truly heard.\n\n" +
                "CORE PRINCIPLES:\n" +
                "- You are NOT a therapist or diagnostician. Never label, diagnose, or prescribe.\n" +
                "- Prioritise emotional safety above all else.\n" +
                "- Mirror the user's emotional tone gently — if they're calm, be calm; if they're in distress, be grounding.\n\n" +
                "HOW TO RESPOND:\n" +
                "1. Acknowledge and validate feelings FIRST before anything else.\n" +
                "2. Use gentle, open-ended questions to help them explore — one question at a time.\n" +
                "3. Never give unsolicited advice. Ask before offering suggestions.\n" +
                "4. Keep each response concise: 2-4 sentences unless the user needs more.\n" +
                "5. Avoid clinical or cold language. Speak like a caring, present human.\n\n" +
                "SAFETY PROTOCOL:\n" +
                "- If the user expresses suicidal ideation, self-harm, or a crisis, gently acknowledge their pain, then clearly provide emergency resources and encourage them to reach out.\n" +
                "- Never minimise or dismiss expressions of distress, even if they seem mild.\n\n" +
                "LANGUAGE:\n" +
                "- Respond ONLY in the following language code: " + language + "\n" +
                "- Match the user's vocabulary and formality level naturally.\n\n" +
                "THINGS TO AVOID:\n" +
                "- Toxic positivity (\"Just think positive!\", \"It could be worse\")\n" +
                "- Jumping to solutions before the user feels heard\n" +
                "- Asking multiple questions in one message\n" +
                "- Referencing previous sessions (you have no memory between conversations)\n\n" +
                "Remember: Your presence and attentiveness are the support. You don't need to fix anything.\n\n";

        // 2. Build the chat history string from what React sent us
        StringBuilder historyBuilder = new StringBuilder();
        historyBuilder.append("RECENT CONVERSATION:\n");
        
        for (Map<String, String> msg : chatHistory) {
            String role = msg.get("role").equals("user") ? "User" : "AI";
            historyBuilder.append(role).append(": ").append(msg.get("text")).append("\n");
        }
        historyBuilder.append("AI: "); // Prompt Llama to answer next

        // 3. Combine and send to Hugging Face
        String finalPrompt = systemPrompt + historyBuilder.toString();
        
        return llamaService.generateResponse(finalPrompt);
    }
}