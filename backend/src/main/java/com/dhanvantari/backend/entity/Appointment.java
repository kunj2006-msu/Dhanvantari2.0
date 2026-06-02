package com.dhanvantari.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "appointments", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"doctor_id", "scheduled_time"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"doctor", "patient"})
@EqualsAndHashCode(exclude = {"doctor", "patient"})
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(name = "scheduled_time", nullable = false)
    private ZonedDateTime scheduledTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private AppointmentStatus status = AppointmentStatus.SCHEDULED;

    @Column(name = "symptoms_notes", columnDefinition = "TEXT")
    private String symptomsNotes;

    @Column(name = "doctor_notes", columnDefinition = "TEXT")
    private String doctorNotes;

    @Version
    @Column(nullable = false)
    @Builder.Default
    private Integer version = 0;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private ZonedDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private ZonedDateTime updatedAt;
}
