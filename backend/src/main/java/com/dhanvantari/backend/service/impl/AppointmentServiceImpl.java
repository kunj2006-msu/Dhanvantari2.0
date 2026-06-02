package com.dhanvantari.backend.service.impl;

import com.dhanvantari.backend.dto.AppointmentRequest;
import com.dhanvantari.backend.entity.*;
import com.dhanvantari.backend.repository.*;
import com.dhanvantari.backend.service.AppointmentService;
import com.dhanvantari.backend.dto.AppointmentDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;

    @Override
    @Transactional
    public String bookAppointment(AppointmentRequest request, String patientEmail) {
        // 1. Look up user context from authenticated username (email)
        User user = userRepository.findByEmail(patientEmail)
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user not found"));

        // 2. Resolve the patient profile securely
        Patient patient = patientRepository.findById(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Patient profile not found for user: " + patientEmail));

        // 3. Resolve doctor profile
        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new IllegalArgumentException("Doctor not found with ID: " + request.getDoctorId()));

        // 4. Parse incoming scheduledDate string to LocalDate
        LocalDate date;
        try {
            date = LocalDate.parse(request.getScheduledDate());
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid date format. Expected YYYY-MM-DD", e);
        }

        // 5. Parse time slot and combine with date
        ZonedDateTime scheduledTime;
        try {
            DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("hh:mm a", Locale.ENGLISH);
            LocalTime time = LocalTime.parse(request.getScheduledTime(), timeFormatter);
            LocalDateTime localDateTime = LocalDateTime.of(date, time);
            scheduledTime = ZonedDateTime.of(localDateTime, java.time.ZoneId.systemDefault());
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid time format. Expected hh:mm AM/PM", e);
        }

        // 6. Build and save Appointment
        Appointment appointment = Appointment.builder()
                .doctor(doctor)
                .patient(patient)
                .scheduledTime(scheduledTime)
                .symptomsNotes(request.getSymptomsNotes())
                .status(AppointmentStatus.SCHEDULED)
                .build();

        appointmentRepository.save(appointment);

        return "Appointment booked successfully with " + doctor.getFullName();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentDTO> getPatientAppointments(String patientEmail) {
        List<Appointment> appointments = appointmentRepository.findByPatientUserEmailOrderByScheduledTimeDesc(patientEmail);
        
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("hh:mm a", Locale.ENGLISH);
        
        return appointments.stream()
                .map(apt -> AppointmentDTO.builder()
                        .id(apt.getId())
                        .doctorName(apt.getDoctor().getFullName())
                        .specialty(apt.getDoctor().getSpecialization())
                        .date(apt.getScheduledTime().format(dateFormatter))
                        .time(apt.getScheduledTime().format(timeFormatter))
                        .status(apt.getStatus() == AppointmentStatus.SCHEDULED ? "upcoming" : apt.getStatus().name().toLowerCase())
                        .build())
                .collect(Collectors.toList());
    }
}
