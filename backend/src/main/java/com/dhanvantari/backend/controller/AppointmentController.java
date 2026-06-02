package com.dhanvantari.backend.controller;

import com.dhanvantari.backend.dto.AppointmentRequest;
import com.dhanvantari.backend.dto.AppointmentDTO;
import com.dhanvantari.backend.service.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import java.util.List;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/patient/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping("/book")
    public ResponseEntity<Map<String, String>> bookAppointment(
            @RequestBody AppointmentRequest request,
            @AuthenticationPrincipal UserDetails currentUser) {
        
        String message = appointmentService.bookAppointment(request, currentUser.getUsername());
        
        Map<String, String> response = new HashMap<>();
        response.put("message", message);
        
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<AppointmentDTO>> getPatientAppointments(
            @AuthenticationPrincipal UserDetails currentUser) {
        List<AppointmentDTO> appointments = appointmentService.getPatientAppointments(currentUser.getUsername());
        return ResponseEntity.ok(appointments);
    }
}
