package com.dhanvantari.backend.service;

import com.dhanvantari.backend.dto.DoctorDTO;
import java.util.List;

public interface DoctorService {
    List<DoctorDTO> getDoctors(String state, String city, String specialization);
}
