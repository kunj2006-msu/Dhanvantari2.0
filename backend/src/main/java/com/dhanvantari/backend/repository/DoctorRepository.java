package com.dhanvantari.backend.repository;

import com.dhanvantari.backend.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, UUID> {
    
    /**
     * Finds doctors by a specific City name and Specialization name.
     * This powers the user dropdown search feature.
     * 
     * @param city the name of the city
     * @param specialization the name of the specialization
     * @return List of matching doctors
     */
    List<Doctor> findByCityAndSpecialization(String city, String specialization);

    @Query("SELECT d FROM Doctor d WHERE " +
           "(:state IS NULL OR d.state = :state) AND " +
           "(:city IS NULL OR d.city = :city) AND " +
           "(:specialization IS NULL OR d.specialization = :specialization)")
    List<Doctor> findDoctorsByFilters(
        @Param("state") String state, 
        @Param("city") String city, 
        @Param("specialization") String specialization
    );

    java.util.Optional<Doctor> findByUserEmail(String email);
}
