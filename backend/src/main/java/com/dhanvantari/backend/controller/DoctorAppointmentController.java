package com.dhanvantari.backend.controller;

import com.dhanvantari.backend.entity.*;
import com.dhanvantari.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.Period;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/doctor")
@PreAuthorize("hasRole('DOCTOR')")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class DoctorAppointmentController {

    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;
    private final ChatSessionRepository chatSessionRepository;
    private final ChatMessageRepository chatMessageRepository;

    @GetMapping("/appointments")
    public ResponseEntity<?> getDoctorAppointments(@AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails.getUsername();
        Optional<Doctor> doctorOpt = doctorRepository.findByUserEmail(email);
        if (doctorOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Doctor profile not found"));
        }

        java.time.ZonedDateTime now = java.time.ZonedDateTime.now(java.time.ZoneId.systemDefault());
        List<Appointment> appointments = appointmentRepository.findByDoctorUserEmailAndScheduledTimeAfterOrderByScheduledTimeAsc(email, now);
        
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("hh:mm a", Locale.ENGLISH);

        List<Map<String, Object>> responseList = appointments.stream().map(apt -> {
            java.time.ZonedDateTime localTime = apt.getScheduledTime().withZoneSameInstant(java.time.ZoneId.systemDefault());
            Map<String, Object> map = new HashMap<>();
            map.put("id", apt.getId().toString());
            map.put("patientId", apt.getPatient().getId().toString());
            map.put("patientName", apt.getPatient().getFullName());
            map.put("date", localTime.format(dateFormatter));
            map.put("time", localTime.format(timeFormatter));
            map.put("reason", apt.getSymptomsNotes() != null ? apt.getSymptomsNotes() : "Routine Checkup");
            map.put("gender", apt.getPatient().getGender() != null ? apt.getPatient().getGender() : "Unknown");
            map.put("bloodGroup", apt.getPatient().getBloodGroup() != null ? apt.getPatient().getBloodGroup() : "Unknown");
            map.put("pastHistory", apt.getPatient().getPreMedicalConditions() != null ? apt.getPatient().getPreMedicalConditions() : "None");
            map.put("heightCm", apt.getPatient().getHeightCm());
            map.put("weightKg", apt.getPatient().getWeightKg());
            map.put("doctorNotes", apt.getDoctorNotes());
            map.put("status", apt.getStatus().name());

            if (apt.getPatient().getDateOfBirth() != null) {
                map.put("age", Period.between(apt.getPatient().getDateOfBirth(), LocalDate.now()).getYears());
            } else {
                map.put("age", 0);
            }

            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(responseList);
    }

    @PutMapping("/appointments/{appointmentId}/notes")
    public ResponseEntity<?> updateAppointmentNotes(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID appointmentId,
            @RequestBody Map<String, String> requestBody) {

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));

        // Verify that the appointment is indeed booked with the authenticated doctor
        if (!appointment.getDoctor().getUser().getEmail().equals(userDetails.getUsername())) {
            return ResponseEntity.status(403).body(Map.of("error", "Unauthorized access to this appointment"));
        }

        String doctorNotes = requestBody.get("doctorNotes");
        appointment.setDoctorNotes(doctorNotes);
        appointment.setStatus(AppointmentStatus.COMPLETED);
        appointmentRepository.save(appointment);

        return ResponseEntity.ok(Map.of("message", "Appointment completed successfully."));
    }

    @GetMapping("/patients/{patientId}/triage-history")
    public ResponseEntity<?> getPatientTriageHistory(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID patientId) {

        List<ChatSession> sessions = chatSessionRepository.findByPatientIdOrderByCreatedAtDesc(patientId);

        List<Map<String, Object>> response = sessions.stream().map(session -> {
            Map<String, Object> sessionMap = new HashMap<>();
            sessionMap.put("sessionId", session.getId());
            sessionMap.put("title", session.getTitle());
            sessionMap.put("languageCode", session.getLanguageCode());
            sessionMap.put("createdAt", session.getCreatedAt());

            List<ChatMessage> messages = chatMessageRepository.findBySessionIdOrderByTimestampAsc(session.getId());
            List<Map<String, String>> messagesList = messages.stream().map(msg -> {
                Map<String, String> msgMap = new HashMap<>();
                msgMap.put("role", msg.getRole());
                msgMap.put("content", msg.getContent());
                return msgMap;
            }).collect(Collectors.toList());

            sessionMap.put("messages", messagesList);
            return sessionMap;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }
}
