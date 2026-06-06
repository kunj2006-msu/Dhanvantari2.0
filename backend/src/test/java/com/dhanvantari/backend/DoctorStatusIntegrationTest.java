package com.dhanvantari.backend;

import com.dhanvantari.backend.dto.AppointmentRequest;
import com.dhanvantari.backend.dto.AppointmentDTO;
import com.dhanvantari.backend.entity.*;
import com.dhanvantari.backend.repository.DoctorRepository;
import com.dhanvantari.backend.repository.PatientRepository;
import com.dhanvantari.backend.repository.UserRepository;
import com.dhanvantari.backend.security.CustomUserDetailsService;
import com.dhanvantari.backend.service.impl.AppointmentServiceImpl;
import com.dhanvantari.backend.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
public class DoctorStatusIntegrationTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Autowired
    private AppointmentServiceImpl appointmentService;

    @Autowired
    private AuthService authService;

    @Autowired
    private com.dhanvantari.backend.repository.AppointmentRepository appointmentRepository;

    private User doctorUser;
    private Doctor doctor;
    private User patientUser;
    private Patient patient;
    private String uniqueId;

    @BeforeEach
    void setUp() {
        uniqueId = UUID.randomUUID().toString();

        // Create a test doctor user
        doctorUser = User.builder()
                .name("Dr. Test User")
                .email("dr.test-" + uniqueId + "@example.com")
                .passwordHash("password_hash")
                .role(UserRole.ROLE_DOCTOR)
                .build();
        userRepository.save(doctorUser);

        // Create a test doctor profile
        doctor = Doctor.builder()
                .user(doctorUser)
                .fullName("Dr. Test User")
                .degree("MBBS")
                .specialization("General Physician")
                .city("New Delhi")
                .state("Delhi")
                .registrationNumber("REG-" + uniqueId.substring(0, 8))
                .experienceYears(8)
                .accountStatus(AccountStatus.ACTIVE)
                .build();
        doctorRepository.save(doctor);

        // Create a test patient user
        patientUser = User.builder()
                .name("Patient Test")
                .email("patient.test-" + uniqueId + "@example.com")
                .passwordHash("password_hash")
                .role(UserRole.ROLE_PATIENT)
                .build();
        userRepository.save(patientUser);

        patient = Patient.builder()
                .user(patientUser)
                .fullName("Patient Test")
                .build();
        patientRepository.save(patient);
    }

    @Test
    void testActiveDoctorCanLoadUserByUsername() {
        UserDetails userDetails = userDetailsService.loadUserByUsername(doctorUser.getEmail());
        assertNotNull(userDetails);
        assertEquals(doctorUser.getEmail(), userDetails.getUsername());
    }

    @Test
    void testDeletedDoctorCannotLoadUserByUsername() {
        doctor.setAccountStatus(AccountStatus.DELETED);
        doctorRepository.save(doctor);

        assertThrows(DisabledException.class, () -> {
            userDetailsService.loadUserByUsername(doctorUser.getEmail());
        });
    }

    @Test
    void testPendingApprovalDoctorCannotLoadUserByUsername() {
        doctor.setAccountStatus(AccountStatus.PENDING_APPROVAL);
        doctorRepository.save(doctor);

        assertThrows(DisabledException.class, () -> {
            userDetailsService.loadUserByUsername(doctorUser.getEmail());
        });
    }

    @Test
    void testDoctorFilterOnlyReturnsActiveDoctors() {
        // Active doctor should be found
        List<Doctor> activeDoctors = doctorRepository.findDoctorsByFilters("Delhi", "New Delhi", "General Physician");
        assertTrue(activeDoctors.stream().anyMatch(d -> d.getId().equals(doctor.getId())));

        // Deactivating the doctor (e.g. setting to SUNSETTING) should hide them
        doctor.setAccountStatus(AccountStatus.SUNSETTING);
        doctorRepository.save(doctor);
        List<Doctor> updatedDoctors = doctorRepository.findDoctorsByFilters("Delhi", "New Delhi", "General Physician");
        assertFalse(updatedDoctors.stream().anyMatch(d -> d.getId().equals(doctor.getId())));
    }

    @Test
    void testCannotBookInactiveDoctor() {
        doctor.setAccountStatus(AccountStatus.DELETED);
        doctorRepository.save(doctor);

        AppointmentRequest request = new AppointmentRequest();
        request.setDoctorId(doctor.getId());
        request.setScheduledDate(java.time.LocalDate.now().plusDays(2).toString());
        request.setScheduledTime("09:00 AM");
        request.setSymptomsNotes("Headache");

        // Try booking and assert that it throws IllegalArgumentException
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            appointmentService.bookAppointment(request, patientUser.getEmail());
        });
        assertEquals("Doctor is not available for booking.", exception.getMessage());
    }

    @Test
    void testDoctorSoftDeletionPreservesUserAndSetsStatusSunsetting() {
        // Set security context authentication for the doctor email
        org.springframework.security.core.context.SecurityContextHolder.getContext().setAuthentication(
                new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                        doctorUser.getEmail(), null
                )
        );

        authService.deleteMe();

        // Check that the doctor's accountStatus is now SUNSETTING
        Doctor deletedDoctor = doctorRepository.findById(doctor.getId()).orElse(null);
        assertNotNull(deletedDoctor);
        assertEquals(AccountStatus.SUNSETTING, deletedDoctor.getAccountStatus());

        // Check that the User still exists
        User stillUser = userRepository.findById(doctorUser.getId()).orElse(null);
        assertNotNull(stillUser);
    }

    @Test
    void testSunsettingDoctorCanLoadUserByUsername() {
        doctor.setAccountStatus(AccountStatus.SUNSETTING);
        doctorRepository.save(doctor);

        UserDetails userDetails = userDetailsService.loadUserByUsername(doctorUser.getEmail());
        assertNotNull(userDetails);
        assertEquals(doctorUser.getEmail(), userDetails.getUsername());
    }

    @Test
    void testGetUpcomingAppointmentsForDoctor() {
        // Create an appointment for our doctor and patient
        java.time.ZonedDateTime scheduledTime = java.time.ZonedDateTime.now(java.time.ZoneId.systemDefault()).plusDays(3);
        Appointment appointment = Appointment.builder()
                .doctor(doctor)
                .patient(patient)
                .scheduledTime(scheduledTime)
                .status(AppointmentStatus.SCHEDULED)
                .symptomsNotes("Cold")
                .build();
        appointmentRepository.save(appointment);

        // Fetch upcoming appointments
        List<AppointmentDTO> upcoming = appointmentService.getUpcomingAppointmentsForDoctor(doctor.getId());
        
        // Assertions
        assertNotNull(upcoming);
        assertEquals(1, upcoming.size());
        assertEquals("Patient Test", upcoming.get(0).getPatientName());
        assertEquals("scheduled", upcoming.get(0).getStatus());
    }
}
