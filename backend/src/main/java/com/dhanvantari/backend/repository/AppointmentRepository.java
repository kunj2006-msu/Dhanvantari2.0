package com.dhanvantari.backend.repository;

import com.dhanvantari.backend.entity.Appointment;
import com.dhanvantari.backend.entity.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {
    List<Appointment> findByPatientUserEmailOrderByScheduledTimeDesc(String email);
    List<Appointment> findByDoctorUserEmailOrderByScheduledTimeDesc(String email);
    List<Appointment> findByDoctorIdAndScheduledTimeBetweenAndStatus(UUID doctorId, ZonedDateTime start, ZonedDateTime end, AppointmentStatus status);
    List<Appointment> findByDoctorUserEmailAndScheduledTimeAfterOrderByScheduledTimeAsc(String email, ZonedDateTime dateTime);
    long countByDoctorIdAndScheduledTimeAndStatus(UUID doctorId, ZonedDateTime scheduledTime, AppointmentStatus status);
}
