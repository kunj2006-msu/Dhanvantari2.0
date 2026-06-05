package com.dhanvantari.backend.controller;

import com.dhanvantari.backend.dto.DoctorDTO;
import com.dhanvantari.backend.service.DoctorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/doctors")
@RequiredArgsConstructor
public class AdminController {

    private final DoctorService doctorService;

    @GetMapping
    public ResponseEntity<List<DoctorDTO>> getAllDoctors() {
        List<DoctorDTO> doctors = doctorService.getAllDoctors();
        return ResponseEntity.ok(doctors);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Map<String, String>> updateDoctorStatus(
            @PathVariable UUID id,
            @RequestParam String status) {
        doctorService.updateDoctorStatus(id, status);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Doctor status updated successfully");
        return ResponseEntity.ok(response);
    }
}
