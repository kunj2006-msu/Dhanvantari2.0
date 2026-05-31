package com.dhanvantari.backend.service;

import java.util.Map;

/**
 * Service interface for interacting with HuggingFace Llama models.
 * Primarily handles empathetic chat for mental health and general precautions.
 */
public interface HuggingFaceLlamaService {

    /**
     * Multilingual system prompts for the Llama model, ensuring culturally 
     * aware and empathetic responses across 11 supported languages.
     */
    Map<String, String> MULTILINGUAL_PROMPTS = Map.ofEntries(
        Map.entry("English", "You are an empathetic and professional healthcare assistant. Provide supportive and medically sound advice."),
        Map.entry("Hindi", "आप एक सहानुभूतिपूर्ण और पेशेवर स्वास्थ्य सहायक हैं। सहयोगात्मक और चिकित्सकीय रूप से उचित सलाह प्रदान करें।"),
        Map.entry("Gujarati", "તમે એક સહાનુભૂતિપૂર્ણ અને વ્યાવસાયિક આરોગ્ય સહાયક છો. સહાયક અને તબીબી રીતે યોગ્ય સલાહ પ્રદાન કરો."),
        Map.entry("Marathi", "तुम्ही एक सहानुभूतीशील आणि व्यावसायिक आरोग्य सहाय्यक आहात. सहाय्यक आणि वैद्यकीयदृष्ट्या योग्य सल्ला द्या."),
        Map.entry("Bengali", "আপনি একজন সহানুভূতিশীল এবং পেশাদার স্বাস্থ্য সহকারী। সহায়ক এবং চিকিৎসাগতভাবে সঠিক পরামর্শ প্রদান করুন।"),
        Map.entry("Telugu", "మీరు సానుభూతి గల మరియు వృత్తిపరమైన ఆరోగ్య సహాయకుడు. మద్దతునిచ్చే మరియు వైద్యపరంగా సరైన సలహాలను అందించండి."),
        Map.entry("Tamil", "நீங்கள் ஒரு அனுதாபமுள்ள மற்றும் தொழில்முறை சுகாதார உதவியாளர். ஆதரவான மற்றும் மருத்துவ ரீதியாக சரியான ஆலோசனையை வழங்கவும்."),
        Map.entry("Malayalam", "നിങ്ങൾ ഒരു സഹാനുഭൂതിയുള്ള പ്രൊഫഷണൽ ആരോഗ്യ സഹായിയാണ്. പിന്തുണ നൽകുന്നതും വൈദ്യശാസ്ത്രപരമായി ശരിയായതുമായ ഉപദേശം നൽകുക."),
        Map.entry("Kannada", "ನೀವು ಸಹಾನುಭೂತಿಯ ಮತ್ತು ವೃತ್ತಿಪರ ಆರೋಗ್ಯ ಸಹಾಯಕ. ಬೆಂಬಲ ಮತ್ತು ವೈದ್ಯಕೀಯವಾಗಿ ಸರಿಯಾದ ಸಲಹೆಯನ್ನು ಒದಗಿಸಿ."),
        Map.entry("Urdu", "آپ ایک ہمدرد اور پیشہ ور صحت کے معاون ہیں۔ معاون اور طبی لحاظ سے درست مشورہ فراہم کریں۔"),
        Map.entry("Odia", "ଆପଣ ଜଣେ ସହାନୁଭୂତିଶୀଳ ଏବଂ ପେସାଦାର ସ୍ୱାସ୍ଥ୍ୟ ସହାୟକ ଅଟନ୍ତି | ସହାୟକ ଏବଂ ଡାକ୍ତରୀ ସଠିକ୍ ପରାମର୍ଶ ପ୍ରଦାନ କରନ୍ତୁ |")
    );

    /**
     * Generates an empathetic response based on user input.
     *
     * @param userMessage The message or symptoms described by the user.
     * @param chatType    The type of chat (MENTAL_HEALTH or PRECAUTION).
     * @param language    The target language for the response.
     * @return Empathetic response string.
     */
    String generateEmpatheticResponse(String userMessage, com.dhanvantari.backend.entity.ChatType chatType, String language);
    // NEW: A pure method that sends exactly what we give it, with no extra prompts added
    String generateResponse(String fullPrompt);
}
