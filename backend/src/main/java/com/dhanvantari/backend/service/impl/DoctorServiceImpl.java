package com.dhanvantari.backend.service.impl;

import com.dhanvantari.backend.dto.DoctorDTO;
import com.dhanvantari.backend.entity.Doctor;
import com.dhanvantari.backend.repository.DoctorRepository;
import com.dhanvantari.backend.service.DoctorService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorServiceImpl implements DoctorService {

    private final DoctorRepository doctorRepository;
    private final com.dhanvantari.backend.repository.AppointmentRepository appointmentRepository;

    @Override
    public List<DoctorDTO> getDoctors(String state, String city, String specialization) {
        // Convert blank inputs to null for dynamic filter matching in repository
        String stateFilter = (state != null && !state.trim().isEmpty()) ? state.trim() : null;
        String cityFilter = (city != null && !city.trim().isEmpty()) ? city.trim() : null;
        String specFilter = (specialization != null && !specialization.trim().isEmpty()) ? specialization.trim() : null;

        List<Doctor> doctors = doctorRepository.findDoctorsByFilters(stateFilter, cityFilter, specFilter);
        return doctors.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private String calculateFirstAvailableDate(java.util.UUID doctorId) {
        java.time.LocalDate date = java.time.LocalDate.now(java.time.ZoneId.systemDefault());
        java.time.format.DateTimeFormatter timeFormatter = java.time.format.DateTimeFormatter.ofPattern("hh:mm a", java.util.Locale.ENGLISH);
        java.util.List<String> allSlots = java.util.List.of("09:00 AM", "10:00 AM", "11:30 AM", "02:00 PM", "03:30 PM", "04:15 PM");

        while (true) {
            java.time.ZonedDateTime startOfDay = date.atStartOfDay(java.time.ZoneId.systemDefault());
            java.time.ZonedDateTime endOfDay = date.plusDays(1).atStartOfDay(java.time.ZoneId.systemDefault()).minusNanos(1);

            java.util.List<com.dhanvantari.backend.entity.Appointment> dayAppointments = appointmentRepository
                    .findByDoctorIdAndScheduledTimeBetweenAndStatus(
                            doctorId, startOfDay, endOfDay, com.dhanvantari.backend.entity.AppointmentStatus.SCHEDULED);

            if (dayAppointments.size() >= 6) {
                date = date.plusDays(1);
                continue;
            }

            // If it is today, check if any slots are in the future and not booked
            if (date.equals(java.time.LocalDate.now(java.time.ZoneId.systemDefault()))) {
                java.time.LocalTime nowTime = java.time.LocalTime.now(java.time.ZoneId.systemDefault());
                boolean hasFutureSlot = false;
                for (String slot : allSlots) {
                    java.time.LocalTime slotTime = java.time.LocalTime.parse(slot, timeFormatter);
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

    private DoctorDTO convertToDTO(Doctor doctor) {
        return DoctorDTO.builder()
                .id(doctor.getId())
                .name(doctor.getFullName())
                .specialization(doctor.getSpecialization())
                .state(doctor.getState())
                .city(doctor.getCity())
                .experience(doctor.getExperienceYears() != null ? doctor.getExperienceYears() + " Years" : "0 Years")
                .clinicAddress(doctor.getClinicAddress())
                .latitude(doctor.getLatitude())
                .longitude(doctor.getLongitude())
                .firstAvailableDate(calculateFirstAvailableDate(doctor.getId()))
                .build();
    }
}
