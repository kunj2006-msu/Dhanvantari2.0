package com.dhanvantari.backend.service;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RagService {

        private final VectorStore vectorStore;
        private final ChatClient chatClient; // Groq Llama for English
        private final SarvamChatService sarvamChatService; // Sarvam 30B for Gujarati

        public RagService(VectorStore vectorStore, ChatClient.Builder chatClientBuilder,
                        SarvamChatService sarvamChatService) {
                this.vectorStore = vectorStore;
                this.chatClient = chatClientBuilder.build();
                this.sarvamChatService = sarvamChatService;
        }

        public String generateAnswer(String query, String languageCode, String chatHistory) {

                // Determine if we are in the Gujarati Lane
                boolean isGujarati = languageCode != null &&
                                (languageCode.equalsIgnoreCase("gu") || languageCode.equalsIgnoreCase("gu-IN"));

                // Step A: NATIVE Vector Search using the EXACT query
                List<Document> results = vectorStore.similaritySearch(
                                SearchRequest.builder()
                                                .query(query)
                                                .topK(3)
                                                .build());

                String context = results.stream()
                                .map(Document::getText)
                                .collect(Collectors.joining("\n\n"));

                // Step B: Route to the correct LLM Model with FULL Guardrails Restored
                if (isGujarati) {
                        // --- GUJARATI LANE (SARVAM AI) ---
                        // --- GUJARATI LANE (SARVAM AI) ---
                        String systemPrompt = "=== ROLE ===\n"
                                        + "You are Dhanvantari, an empathetic, warm, and highly knowledgeable AI Vaidya (Doctor). You speak naturally directly to the patient.\n\n"

                                        + "=== STRICT OUTPUT RULES ===\n"
                                        + "1. Answer completely in native GUJARATI script. DO NOT output English.\n"
                                        + "2. NO ROBOTIC PHRASES: NEVER say 'આપેલા સંદર્ભ મુજબ' (According to context) or 'માહિતી મુજબ' (Based on the information). Speak directly as a caring doctor.\n"
                                        + "3. VALIDATE & REASSURE: Start with 1 natural, comforting sentence.\n"
                                        + "4. SPACING & LINE BREAKS: You MUST use proper line breaks (\\n) before each bullet point. Do not squash bullets into a single paragraph.\n"
                                        + "5. BULLET FORMAT: Provide exactly 3 actionable bullet points. Bold ONLY the main remedy name using double asterisks (**Name**), followed by a colon and the description.\n"
                                        + "6. ENDING: ALWAYS end your response with this exact sentence on a new line: 'જો તમારા લક્ષણો વધુ ખરાબ થાય, તો યોગ્ય મૂલ્યાંકન અને સારવાર માટે કૃપા કરીને કોઈ ડૉક્ટરની સલાહ લો.'\n\n"

                                        + "=== EXAMPLE OUTPUT FORMAT (Copy this exact structure and spacing) ===\n"
                                        + "તમને પેટમાં સખત દુખાવો થઈ રહ્યો છે તે જાણીને મને દુઃખ થયું. તમને રાહત આપવા માટે અહીં કેટલાક ઉપાયો છે:\n\n"
                                        + "* **ગરમ પાણીનો શેક:** પેટ પર ગરમ પાણીની થેલી રાખવાથી સ્નાયુઓને આરામ મળશે અને દુખાવો ઘટશે.\n"
                                        + "* **હળવો આહાર:** પચવામાં સરળ હોય તેવો ખોરાક લો, જેમ કે મગની દાળ કે ખીચડી.\n"
                                        + "* **આરામ કરો:** શારીરિક શ્રમ ટાળો અને સીધા સૂઈને આરામ કરો.\n\n"
                                        + "જો તમારા લક્ષણો વધુ ખરાબ થાય, તો યોગ્ય મૂલ્યાંકન અને સારવાર માટે કૃપા કરીને કોઈ ડૉક્ટરની સલાહ લો.\n\n"

                                        + "=== CONTEXT ===\n" + context + "\n\n"
                                        + "=== CHAT HISTORY ===\n" + chatHistory;

                        return sarvamChatService.generateGujaratiResponse(systemPrompt, query);

                } else {
                        // --- ENGLISH LANE (GROQ API) ---
                        String systemPrompt = "You are Dhanvantari — a highly knowledgeable, empathetic, and professional AI Vaidya (Doctor) communicating in English. Your goal is to assess symptoms safely, offer immediate comfort, and provide practical Indian home-care guidance (Gharelu Upchar) using the provided medical Context below. If the answer cannot be find in the context, politely state that you do not have enough official documentation while strictly knowing your limits as an AI.\n\n"
                                        + "STRICT RULE: YOU MUST RESPOND ONLY IN ENGLISH. Do not output in any other language.\n\n"
                                        + "Here is the recent conversation history:\n" + chatHistory + "\n\n"
                                        + "CORE PRINCIPLES (The Empathy & Action Framework):\n"
                                        + "1. VALIDATE & REASSURE: Show brief empathy for their condition. STRICT RULE: NEVER echo, copy, or repeat the user's exact words back to them. NEVER speak in the first person about the user's symptom (do not say 'I have indigestion').\n"
                                        + "2. DIRECT & NATURAL: Speak directly to the user. NEVER use third-person terms like 'the patient'. Use natural, conversational language.\n"
                                        + "3. CONTEXT-AWARE SAFETY: Always factor in the user's known medical history. Ensure all remedies are safe for their specific conditions.\n\n"
                                        + "STRICT FORMATTING RULES:\n"
                                        + "1. GREETINGS: If the user is just saying hello or asking a general non-medical question, politely greet them back and ask how you can help them today. DO NOT provide medical remedies.\n"
                                        + "2. MEDICAL QUERIES: ONLY if the user mentions a symptom, provide exactly 3 actionable bullet points containing specific home remedies from the context.\n"
                                        + "3. You MUST bold the main remedy of every single bullet point using double asterisks (**).\n"
                                        + "4. Always end medical responses with a short sentence advising them to consult a real doctor if symptoms worsen.\n\n"
                                        + "Context:\n" + context;

                        return chatClient.prompt()
                                        .system(systemPrompt)
                                        .user(query)
                                        .call()
                                        .content();
                }
        }
}