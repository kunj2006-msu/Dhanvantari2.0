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

        // Validate booking window: [firstAvailableDate, firstAvailableDate + 15 days]
        LocalDate firstAvailable = LocalDate.parse(calculateFirstAvailableDate(doctor.getId()));
        LocalDate maxAvailable = firstAvailable.plusDays(15);
        if (date.isBefore(firstAvailable) || date.isAfter(maxAvailable)) {
            throw new IllegalArgumentException("Booking date must be within the availability window [" + firstAvailable + " to " + maxAvailable + "]");
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

    private String calculateFirstAvailableDate(java.util.UUID doctorId) {
        LocalDate date = LocalDate.now(java.time.ZoneId.systemDefault());
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("hh:mm a", Locale.ENGLISH);
        List<String> allSlots = List.of("09:00 AM", "10:00 AM", "11:30 AM", "02:00 PM", "03:30 PM", "04:15 PM");

        while (true) {
            ZonedDateTime startOfDay = date.atStartOfDay(java.time.ZoneId.systemDefault());
            ZonedDateTime endOfDay = date.plusDays(1).atStartOfDay(java.time.ZoneId.systemDefault()).minusNanos(1);

            List<Appointment> dayAppointments = appointmentRepository
                    .findByDoctorIdAndScheduledTimeBetweenAndStatus(
                            doctorId, startOfDay, endOfDay, AppointmentStatus.SCHEDULED);

            if (dayAppointments.size() >= 6) {
                date = date.plusDays(1);
                continue;
            }

            // If it is today, check if any slots are in the future and not booked
            if (date.equals(LocalDate.now(java.time.ZoneId.systemDefault()))) {
                LocalTime nowTime = LocalTime.now(java.time.ZoneId.systemDefault());
                boolean hasFutureSlot = false;
                for (String slot : allSlots) {
                    LocalTime slotTime = LocalTime.parse(slot, timeFormatter);
                    if (slotTime.isAfter(nowTime)) {
                        // check if this slot is already booked
                        boolean slotBooked = dayAppointments.stream()
                                .anyMatch(apt -> apt.getScheduledTime().toLocalTime().equals(slotTime));
                        if (!slotBooked) {
                            hasFutureSlot = true;
                            break;
                        }
                    }
                }
                if (!hasFutureSlot) {
                    date = date.plusDays(1);
                    continue;
                }
            }

            return date.toString();
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentDTO> getPatientAppointments(String patientEmail) {
        List<Appointment> appointments = appointmentRepository.findByPatientUserEmailOrderByScheduledTimeDesc(patientEmail);
        
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("hh:mm a", Locale.ENGLISH);
        
        return appointments.stream()
                .map(apt -> {
                    ZonedDateTime localTime = apt.getScheduledTime().withZoneSameInstant(java.time.ZoneId.systemDefault());
                    return AppointmentDTO.builder()
                            .id(apt.getId())
                            .doctorName(apt.getDoctor().getFullName())
                            .specialty(apt.getDoctor().getSpecialization())
                            .date(localTime.format(dateFormatter))
                            .time(localTime.format(timeFormatter))
                            .status(apt.getStatus() == AppointmentStatus.SCHEDULED ? "upcoming" : apt.getStatus().name().toLowerCase())
                            .clinicAddress(apt.getDoctor().getClinicAddress())
                            .latitude(apt.getDoctor().getLatitude())
                            .longitude(apt.getDoctor().getLongitude())
                            .doctorNotes(apt.getDoctorNotes())
                            .symptomsNotes(apt.getSymptomsNotes())
                            .build();
                })
                .collect(Collectors.toList());
    }
}
