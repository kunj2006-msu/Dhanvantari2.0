package com.dhanvantari.backend.service;

public interface AiTriageEngine {
    String processTriage(String patientQuery, String nativeLanguageCode);
}