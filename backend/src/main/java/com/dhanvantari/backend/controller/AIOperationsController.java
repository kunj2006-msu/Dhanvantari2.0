package com.dhanvantari.backend.controller;

import com.dhanvantari.backend.service.DocumentIngestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/public/ai")
@CrossOrigin(origins = "http://localhost:5173")
public class AIOperationsController {

    private final DocumentIngestionService documentIngestionService;

    @PostMapping("/ingest")
    public ResponseEntity<Map<String, Object>> ingestDocuments() {
        Map<String, Object> result = documentIngestionService.ingestMedicalDocuments();
        if (result.containsKey("error")) {
            return ResponseEntity.internalServerError().body(result);
        }
        return ResponseEntity.ok(result);
    }
}
