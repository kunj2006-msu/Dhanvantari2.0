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
                .build();
    }
}
