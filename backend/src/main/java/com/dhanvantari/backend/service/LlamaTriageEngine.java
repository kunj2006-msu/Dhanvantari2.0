package com.dhanvantari.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.*;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@ConditionalOnProperty(name = "ai.active.engine", havingValue = "llama")
public class LlamaTriageEngine implements AiTriageEngine {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${huggingface.api.key}")
    private String hfApiKey;

    // The modern, ultra-fast routing endpoint
    private final String HF_API_URL = "https://api.groq.com/openai/v1/chat/completions";

    public LlamaTriageEngine() {
        // THE FIX: Teach Java Patience. 
        // Hugging Face free models sleep. This tells Java to wait up to 3 minutes for it to wake up.
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(15000); // 15 seconds to connect
        factory.setReadTimeout(180000);   // 3 minutes (180,000 ms) to wait for a reply
        this.restTemplate = new RestTemplate(factory);
    }

    @Override
    public String processTriage(String patientQuery, String nativeLanguageCode) {
        String nativeInstruction = getNativeLanguageInstruction(nativeLanguageCode);

        boolean isEnglish = (nativeLanguageCode != null && nativeLanguageCode.toLowerCase().startsWith("en"));
        String languageRule = isEnglish 
                ? "1. You MUST respond entirely in English.\n" 
                : "1. NEVER output English. All output MUST be perfectly written in the requested native script.\n";
// The 'Empathy & Action' Triage Prompt
       // The 'Authentic Vaidya' Triage Prompt (Context-Aware)
        String systemPrompt = "You are Dhanvantari — a highly knowledgeable, empathetic, and professional AI Vaidya (Doctor). Your goal is to assess symptoms safely, offer immediate comfort, and provide practical Indian home-care guidance (Gharelu Upchar) while strictly knowing your limits as an AI.\n\n" +
                nativeInstruction + "\n\n" +
                "CORE PRINCIPLES (The Empathy & Action Framework):\n" +
                "1. VALIDATE & REASSURE: Briefly acknowledge their physical discomfort so they feel cared for.\n" +
                "2. DIRECT & NATURAL: Speak directly to the user. NEVER use third-person terms like 'the patient' or 'રોગીને'. Use natural, conversational language.\n" +
                "3. INSTANT HOME REMEDIES (GHARELU UPCHAR): This is critical. You MUST provide immediate, specific, and traditional Indian home/Ayurvedic remedies using common kitchen ingredients (e.g., Tulsi, Ginger, Turmeric, Cumin, Ajwain). Explain exactly how to prepare or use them.\n" +
                "4. CONTEXT-AWARE SAFETY: Always factor in the user's known medical history from the conversation. Ensure all remedies are 100% safe for their specific conditions (e.g., strictly avoid suggesting honey, jaggery, or sugar if they are diabetic).\n\n" +
                "STRICT FORMATTING RULES:\n" +
                languageRule + "\n" +
                "2. Keep your response concise. After your brief reassuring opening, provide exactly 3 actionable bullet points containing specific home remedies.\n" +
                "3. You MUST bold the main remedy of every single bullet point using double asterisks (e.g., **Ginger and Tulsi Tea:** ...).\n" +
                "4. Always end your response with a short, gentle sentence advising them to consult a real doctor if symptoms worsen.\n";
        return callLlama(systemPrompt, patientQuery);
    }

    private String callLlama(String systemPrompt, String patientQuery) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(hfApiKey);

            // Build the OpenAI-compatible messages array
            List<Map<String, String>> messages = new ArrayList<>();
            
            Map<String, String> systemMessage = new HashMap<>();
            systemMessage.put("role", "system");
            systemMessage.put("content", systemPrompt);
            messages.add(systemMessage);

            Map<String, String> userMessage = new HashMap<>();
            userMessage.put("role", "user");
            userMessage.put("content", "The user says: " + patientQuery);
            messages.add(userMessage);

            // Assemble the final JSON payload
            Map<String, Object> requestBody = new HashMap<>();
            // We use the massive 70B Llama 3 model from your Python code!
           requestBody.put("model", "llama-3.3-70b-versatile");
            requestBody.put("messages", messages);
            requestBody.put("temperature", 0.4);
            requestBody.put("max_tokens", 800);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(HF_API_URL, entity, String.class);

            // Parse the OpenAI-style response format
            JsonNode root = objectMapper.readTree(response.getBody());
            return root.get("choices").get(0).get("message").get("content").asText().trim();
            
        } catch (Exception e) {
            System.err.println("Llama/HF API Error: " + e.getMessage());
            return "Dhanvantari Service is currently experiencing high network traffic. Please consult a doctor immediately.";
        }
    }

    private String getNativeLanguageInstruction(String code) {
        return switch (code.toLowerCase()) {
            case "hi" -> "आप एक अनुभवी डॉक्टर हैं। शुद्ध और सरल हिंदी में बात करें। किताबी भाषा के बजाय बोलचाल की भाषा का प्रयोग करें।";
            case "gu" -> "તમે એક અનુભવી ડોક્ટર છો. સાદી અને શુદ્ધ ગુજરાતીમાં વાત કરો. અંગ્રેજીનું સીધું ભાષાંતર કરવાનું ટાળો.";
            case "mr" -> "तुम्ही एक अनुभवी डॉक्टर आहात. साध्या आणि नैसर्गिक मराठीत बोला. शब्दांचे थेट भाषांतर करू नका.";
            case "bn" -> "আপনি একজন অভিজ্ঞ ডাক্তার। সহজ এবং স্বাভাবিক বাংলায় কথা বলুন। আক্ষরিক অনুবাদ করবেন না।";
            case "te" -> "మీరు అనుభవజ్ఞుడైన డాక్టర్. సహజమైన తెలుగులో మాట్లాడండి. నేరుగా అనువదించవద్దు.";
            case "ta" -> "நீங்கள் அனுபவம் வாய்ந்த மருத்துவர். இயல்பான தமிழில் பேசுங்கள். அப்படியே மொழிபெயர்க்க வேண்டாம்.";
            case "ur" -> "آپ ایک تجربہ کار ڈاکٹر ہیں۔ سادہ اور فطری اردو میں بات کریں۔ لفظی ترجمہ سے پرہیز کریں۔";
            case "kn" -> "ನೀವು ಅನುಭವಿ ವೈದ್ಯರು. ಸರಳ ಮತ್ತು ನೈಸರ್ಗಿಕ ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡಿ. ನೇರವಾಗಿ ಭಾಷಾಂತರಿಸಬೇಡಿ.";
            case "ml" -> "നിങ്ങൾ പരിചയസമ്പന്നനായ ഡോക്ടറാണ്. ലളിതമായ മലയാളത്തിൽ സംസാരിക്കുക. നേരിട്ട് തർജ്ജിമ ചെയ്യരുത്.";
            case "or" -> "ଆପଣ ଜଣେ ଅଭିଜ୍ଞ ଡାକ୍તର। ସରଳ ଓ ପ୍ରାକୃତିક ଓଡ଼ିଆରେ କଥା ହୁଅନ୍ତୁ।";
            case "en" -> "You are an experienced doctor. Speak in clear, professional, and natural English.";
            default -> "You are an experienced doctor. Speak in clear, professional, and natural English.";
        };
    }
}