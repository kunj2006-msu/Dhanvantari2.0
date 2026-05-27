package com.dhanvantari.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.HashMap;
import java.util.Map;
import java.util.List;

@Service
@ConditionalOnProperty(name = "ai.active.engine", havingValue = "gemini", matchIfMissing = true)
public class GeminiTriageEngine implements AiTriageEngine {

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    private final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=";

   @Override
    public String processTriage(String patientQuery, String nativeLanguageCode) {
        // 1. Get the exact native language instruction from your Python logic
        String nativeInstruction = getNativeLanguageInstruction(nativeLanguageCode);

        // 2. THE FIX: Conditionally apply the "No English" rule to prevent the paradox
        boolean isEnglish = (nativeLanguageCode != null && nativeLanguageCode.toLowerCase().startsWith("en"));
        String languageRule = isEnglish 
                ? "1. You MUST respond entirely in English.\n" 
                : "1. NEVER output English. All output MUST be perfectly written in the requested native script.\n";

       // 3. Build the strict, structured prompt
        String systemPrompt = "You are Dhanvantari, a professional Vaidya (Doctor). " +
                nativeInstruction + "\n\n" +
                "STRICT RULES:\n" +
                languageRule +
                "2. Do not literally translate English medical terms; use natural spoken language.\n" +
                "3. STRUCTURE: Keep your response concise (5 main points). You MUST use bullet points and insert a blank line (\\n\\n) between every single point for readability.\n" +
                "4. End by recommending they consult a real doctor for serious symptoms.\n\n" +
                "Patient symptoms: ";
        return callGemini(systemPrompt + patientQuery);
    }
    private String callGemini(String prompt) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Build the content payload
            Map<String, Object> part = new HashMap<>();
            part.put("text", prompt);
            Map<String, Object> content = new HashMap<>();
            content.put("parts", List.of(part));

            // NEW: Add the Generation Config to lock the Temperature to 0.4 (just like your Python code!)
            Map<String, Object> generationConfig = new HashMap<>();
            generationConfig.put("temperature", 0.4);
            //generationConfig.put("maxOutputTokens", 800);

            // Assemble the final JSON request
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", List.of(content));
            requestBody.put("generationConfig", generationConfig);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(GEMINI_API_URL + geminiApiKey, entity, String.class);

            JsonNode root = objectMapper.readTree(response.getBody());
            return root.get("candidates").get(0).get("content").get("parts").get(0).get("text").asText().trim();
        } catch (Exception e) {
            System.err.println("Gemini API Error: " + e.getMessage());
            return "Dhanvantari Service is currently unavailable. Please consult a doctor immediately.";
        }
    }

    /**
     * Ported directly from your Python get_language_instruction dictionary.
     * This forces the AI to "think" in the native language immediately.
     */
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