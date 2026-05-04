package com.dhanvantari.backend.repository;

import com.dhanvantari.backend.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, UUID> {
    
    /**
     * Finds doctors by a specific City name and Specialization name.
     * This powers the user dropdown search feature.
     * 
     * @param cityName the name of the city
     * @param specializationName the name of the specialization
     * @return List of matching doctors
     */
    List<Doctor> findByCity_NameAndSpecialization_Name(String cityName, String specializationName);
}
