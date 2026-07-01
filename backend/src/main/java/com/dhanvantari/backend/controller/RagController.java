package com.dhanvantari.backend.controller;

import com.dhanvantari.backend.service.RagService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/public/ai")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class RagController {

    private final RagService ragService;

    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> chat(@RequestBody Map<String, String> request) {
        String query = request.get("query");
        String language = request.getOrDefault("language", "en-IN");
        if ("gu".equalsIgnoreCase(language) || "gu-IN".equalsIgnoreCase(language)) {
            language = "gu-IN";
        } else {
            language = "en-IN";
        }
        String responseText = ragService.generateAnswer(query, language, "");

        Map<String, String> response = new HashMap<>();
        response.put("response", responseText);

        return ResponseEntity.ok(response);
    }
}
