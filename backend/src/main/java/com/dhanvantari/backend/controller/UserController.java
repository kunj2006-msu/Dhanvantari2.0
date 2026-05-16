package com.dhanvantari.backend.controller;

import com.dhanvantari.backend.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final AuthService authService;

    @GetMapping("/me")
    public ResponseEntity<java.util.Map<String, Object>> getMe() {
        return ResponseEntity.ok(authService.getMe());
    }

    @org.springframework.web.bind.annotation.PutMapping("/me")
    public ResponseEntity<java.util.Map<String, Object>> updateMe(@org.springframework.web.bind.annotation.RequestBody java.util.Map<String, Object> updates) {
        authService.updateMe(updates);
        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("message", "Profile updated successfully");
        return ResponseEntity.ok(response);
    }

    @org.springframework.web.bind.annotation.DeleteMapping("/me")
    public ResponseEntity<java.util.Map<String, Object>> deleteMe() {
        authService.deleteMe();
        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("message", "Account deleted successfully");
        return ResponseEntity.ok(response);
    }
}
