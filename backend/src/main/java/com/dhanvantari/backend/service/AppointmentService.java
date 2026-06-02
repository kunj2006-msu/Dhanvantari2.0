package com.dhanvantari.backend.service;

import com.dhanvantari.backend.dto.AppointmentDTO;
import com.dhanvantari.backend.dto.AppointmentRequest;
import java.util.List;

public interface AppointmentService {
    String bookAppointment(AppointmentRequest request, String patientEmail);
    List<AppointmentDTO> getPatientAppointments(String patientEmail);
}
